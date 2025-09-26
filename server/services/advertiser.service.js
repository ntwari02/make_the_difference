const db = require('../db/connection');

class AdvertiserService {
  // Create advertiser account
  async createAdvertiser(userId, advertiserData) {
    try {
      const {
        business_name,
        business_type,
        description,
        website_url,
        contact_email,
        contact_phone,
        business_address,
        tax_id,
        payment_method,
        billing_address
      } = advertiserData;

      const [result] = await db.execute(
        `INSERT INTO advertisers (
          user_id, business_name, business_type, description, website_url,
          contact_email, contact_phone, business_address, tax_id,
          payment_method, billing_address, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          userId, business_name, business_type, description, website_url,
          contact_email, contact_phone, business_address, tax_id,
          payment_method, billing_address
        ]
      );

      return {
        id: result.insertId,
        user_id: userId,
        business_name,
        business_type,
        verification_status: 'pending'
      };
    } catch (error) {
      throw new Error(`Failed to create advertiser: ${error.message}`);
    }
  }

  // Get advertiser by ID
  async getAdvertiserById(advertiserId) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.email, u.first_name, u.last_name 
         FROM advertisers a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.id = ?`,
        [advertiserId]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get advertiser: ${error.message}`);
    }
  }

  // Get advertiser by user ID
  async getAdvertiserByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.email, u.first_name, u.last_name 
         FROM advertisers a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.user_id = ?`,
        [userId]
      );

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get advertiser by user ID: ${error.message}`);
    }
  }

  // Update advertiser
  async updateAdvertiser(advertiserId, updateData) {
    try {
      const allowedFields = [
        'business_name', 'description', 'website_url', 'contact_email',
        'contact_phone', 'business_address', 'tax_id', 'payment_method', 'billing_address'
      ];

      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(advertiserId);

      const [result] = await db.execute(
        `UPDATE advertisers SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update advertiser: ${error.message}`);
    }
  }

  // Verify advertiser
  async verifyAdvertiser(advertiserId, status, verificationDocuments) {
    try {
      const [result] = await db.execute(
        `UPDATE advertisers 
         SET verification_status = ?, verification_documents = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, JSON.stringify(verificationDocuments), advertiserId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to verify advertiser: ${error.message}`);
    }
  }

  // Get all advertisers with pagination
  async getAdvertisers(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (filters.business_type) {
        whereClause += ' AND a.business_type = ?';
        queryParams.push(filters.business_type);
      }

      if (filters.verification_status) {
        whereClause += ' AND a.verification_status = ?';
        queryParams.push(filters.verification_status);
      }

      if (filters.search) {
        whereClause += ' AND (a.business_name LIKE ? OR a.contact_email LIKE ?)';
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const [rows] = await db.execute(
        `SELECT a.*, u.email, u.first_name, u.last_name,
                (SELECT COUNT(*) FROM ad_campaigns WHERE advertiser_id = a.id) as total_campaigns,
                (SELECT SUM(spent_amount) FROM ad_campaigns WHERE advertiser_id = a.id) as total_spent
         FROM advertisers a 
         JOIN users u ON a.user_id = u.id 
         ${whereClause}
         ORDER BY a.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM advertisers a ${whereClause}`,
        queryParams
      );

      return {
        advertisers: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get advertisers: ${error.message}`);
    }
  }

  // Get advertiser statistics
  async getAdvertiserStats(advertiserId) {
    try {
      const [campaignStats] = await db.execute(
        `SELECT 
           COUNT(*) as total_campaigns,
           SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_campaigns,
           SUM(spent_amount) as total_spent,
           AVG(spent_amount) as avg_spend_per_campaign
         FROM ad_campaigns 
         WHERE advertiser_id = ?`,
        [advertiserId]
      );

      const [recentCampaigns] = await db.execute(
        `SELECT id, campaign_name, status, spent_amount, created_at
         FROM ad_campaigns 
         WHERE advertiser_id = ? 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [advertiserId]
      );

      const [monthlySpend] = await db.execute(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m') as month,
           SUM(spent_amount) as monthly_spend
         FROM ad_campaigns 
         WHERE advertiser_id = ? 
           AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month DESC`,
        [advertiserId]
      );

      return {
        ...campaignStats[0],
        recent_campaigns: recentCampaigns,
        monthly_spend: monthlySpend
      };
    } catch (error) {
      throw new Error(`Failed to get advertiser stats: ${error.message}`);
    }
  }

  // Delete advertiser
  async deleteAdvertiser(advertiserId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM advertisers WHERE id = ?',
        [advertiserId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete advertiser: ${error.message}`);
    }
  }

  // Check if user is verified advertiser
  async isVerifiedAdvertiser(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT id, verification_status FROM advertisers WHERE user_id = ? AND verification_status = 'verified'`,
        [userId]
      );

      return rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to check advertiser verification: ${error.message}`);
    }
  }
}

module.exports = new AdvertiserService();
