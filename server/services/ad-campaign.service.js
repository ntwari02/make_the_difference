const db = require('../db/connection');

class AdCampaignService {
  // Create ad campaign
  async createCampaign(advertiserId, campaignData) {
    try {
      const {
        campaign_name,
        objective,
        budget_type,
        budget_amount,
        start_date,
        end_date,
        target_audience,
        targeting_criteria,
        bid_strategy,
        bid_amount
      } = campaignData;

      const [result] = await db.execute(
        `INSERT INTO ad_campaigns (
          advertiser_id, campaign_name, objective, budget_type, budget_amount,
          start_date, end_date, target_audience, targeting_criteria,
          bid_strategy, bid_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [
          advertiserId, campaign_name, objective, budget_type, budget_amount,
          start_date, end_date, JSON.stringify(target_audience), JSON.stringify(targeting_criteria),
          bid_strategy, bid_amount
        ]
      );

      return {
        id: result.insertId,
        advertiser_id: advertiserId,
        campaign_name,
        objective,
        status: 'draft'
      };
    } catch (error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }

  // Get campaign by ID
  async getCampaignById(campaignId) {
    try {
      const [rows] = await db.execute(
        `SELECT c.*, a.business_name, a.business_type, a.verification_status
         FROM ad_campaigns c
         JOIN advertisers a ON c.advertiser_id = a.id
         WHERE c.id = ?`,
        [campaignId]
      );

      if (rows.length === 0) return null;

      const campaign = rows[0];
      campaign.target_audience = JSON.parse(campaign.target_audience || '{}');
      campaign.targeting_criteria = JSON.parse(campaign.targeting_criteria || '{}');

      return campaign;
    } catch (error) {
      throw new Error(`Failed to get campaign: ${error.message}`);
    }
  }

  // Get campaigns by advertiser
  async getCampaignsByAdvertiser(advertiserId, page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE c.advertiser_id = ?';
      const queryParams = [advertiserId];

      if (filters.status) {
        whereClause += ' AND c.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.objective) {
        whereClause += ' AND c.objective = ?';
        queryParams.push(filters.objective);
      }

      if (filters.search) {
        whereClause += ' AND c.campaign_name LIKE ?';
        queryParams.push(`%${filters.search}%`);
      }

      const [rows] = await db.execute(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM ad_creatives WHERE campaign_id = c.id) as creative_count,
                (SELECT COUNT(*) FROM ad_servings WHERE creative_id IN (
                  SELECT id FROM ad_creatives WHERE campaign_id = c.id
                )) as total_impressions,
                (SELECT COUNT(*) FROM ad_servings WHERE creative_id IN (
                  SELECT id FROM ad_creatives WHERE campaign_id = c.id
                ) AND clicked_at IS NOT NULL) as total_clicks
         FROM ad_campaigns c
         ${whereClause}
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Parse JSON fields
      const campaigns = rows.map(campaign => ({
        ...campaign,
        target_audience: JSON.parse(campaign.target_audience || '{}'),
        targeting_criteria: JSON.parse(campaign.targeting_criteria || '{}')
      }));

      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM ad_campaigns c ${whereClause}`,
        queryParams
      );

      return {
        campaigns,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }
  }

  // Update campaign
  async updateCampaign(campaignId, updateData) {
    try {
      const allowedFields = [
        'campaign_name', 'objective', 'budget_type', 'budget_amount',
        'start_date', 'end_date', 'target_audience', 'targeting_criteria',
        'bid_strategy', 'bid_amount'
      ];

      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === 'target_audience' || key === 'targeting_criteria') {
            updateFields.push(`${key} = ?`);
            updateValues.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            updateValues.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(campaignId);

      const [result] = await db.execute(
        `UPDATE ad_campaigns SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
  }

  // Update campaign status
  async updateCampaignStatus(campaignId, status, reason = null) {
    try {
      const [result] = await db.execute(
        `UPDATE ad_campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, campaignId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update campaign status: ${error.message}`);
    }
  }

  // Submit campaign for approval
  async submitCampaignForApproval(campaignId) {
    try {
      // Check if campaign has creatives
      const [creatives] = await db.execute(
        'SELECT COUNT(*) as count FROM ad_creatives WHERE campaign_id = ?',
        [campaignId]
      );

      if (creatives[0].count === 0) {
        throw new Error('Campaign must have at least one creative before submission');
      }

      const [result] = await db.execute(
        `UPDATE ad_campaigns SET status = 'pending_approval', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [campaignId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to submit campaign: ${error.message}`);
    }
  }

  // Pause/Resume campaign
  async toggleCampaignStatus(campaignId, newStatus) {
    try {
      const validStatuses = ['active', 'paused'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status. Must be "active" or "paused"');
      }

      const [result] = await db.execute(
        `UPDATE ad_campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newStatus, campaignId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to toggle campaign status: ${error.message}`);
    }
  }

  // Get campaign performance
  async getCampaignPerformance(campaignId, startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      const queryParams = [campaignId];

      if (startDate && endDate) {
        dateFilter = 'AND DATE(s.served_at) BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
      }

      const [performance] = await db.execute(
        `SELECT 
           COUNT(s.id) as total_impressions,
           COUNT(s.clicked_at) as total_clicks,
           COUNT(s.conversion_at) as total_conversions,
           SUM(s.cost_per_impression) as total_spend,
           AVG(s.cost_per_impression) as avg_cpm,
           AVG(s.cost_per_click) as avg_cpc,
           AVG(s.cost_per_conversion) as avg_cpa,
           CASE 
             WHEN COUNT(s.id) > 0 THEN (COUNT(s.clicked_at) / COUNT(s.id)) * 100
             ELSE 0 
           END as ctr,
           CASE 
             WHEN COUNT(s.clicked_at) > 0 THEN (COUNT(s.conversion_at) / COUNT(s.clicked_at)) * 100
             ELSE 0 
           END as conversion_rate
         FROM ad_servings s
         JOIN ad_creatives c ON s.creative_id = c.id
         WHERE c.campaign_id = ? ${dateFilter}`,
        queryParams
      );

      const [dailyPerformance] = await db.execute(
        `SELECT 
           DATE(s.served_at) as date,
           COUNT(s.id) as impressions,
           COUNT(s.clicked_at) as clicks,
           COUNT(s.conversion_at) as conversions,
           SUM(s.cost_per_impression) as spend
         FROM ad_servings s
         JOIN ad_creatives c ON s.creative_id = c.id
         WHERE c.campaign_id = ? ${dateFilter}
         GROUP BY DATE(s.served_at)
         ORDER BY date DESC
         LIMIT 30`,
        queryParams
      );

      return {
        ...performance[0],
        daily_performance: dailyPerformance
      };
    } catch (error) {
      throw new Error(`Failed to get campaign performance: ${error.message}`);
    }
  }

  // Delete campaign
  async deleteCampaign(campaignId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM ad_campaigns WHERE id = ?',
        [campaignId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }
  }

  // Get all campaigns for admin
  async getAllCampaigns(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (filters.status) {
        whereClause += ' AND c.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.objective) {
        whereClause += ' AND c.objective = ?';
        queryParams.push(filters.objective);
      }

      if (filters.business_type) {
        whereClause += ' AND a.business_type = ?';
        queryParams.push(filters.business_type);
      }

      if (filters.search) {
        whereClause += ' AND (c.campaign_name LIKE ? OR a.business_name LIKE ?)';
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const [rows] = await db.execute(
        `SELECT c.*, a.business_name, a.business_type, a.verification_status,
                (SELECT COUNT(*) FROM ad_creatives WHERE campaign_id = c.id) as creative_count
         FROM ad_campaigns c
         JOIN advertisers a ON c.advertiser_id = a.id
         ${whereClause}
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Parse JSON fields
      const campaigns = rows.map(campaign => ({
        ...campaign,
        target_audience: JSON.parse(campaign.target_audience || '{}'),
        targeting_criteria: JSON.parse(campaign.targeting_criteria || '{}')
      }));

      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM ad_campaigns c
         JOIN advertisers a ON c.advertiser_id = a.id
         ${whereClause}`,
        queryParams
      );

      return {
        campaigns,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get all campaigns: ${error.message}`);
    }
  }
}

module.exports = new AdCampaignService();
