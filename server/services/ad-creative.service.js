const db = require('../db/connection');

class AdCreativeService {
  // Create ad creative
  async createCreative(campaignId, creativeData) {
    try {
      const {
        creative_type,
        title,
        description,
        headline,
        call_to_action,
        image_url,
        video_url,
        video_thumbnail,
        landing_page_url,
        creative_assets,
        dimensions,
        file_size,
        duration
      } = creativeData;

      const [result] = await db.execute(
        `INSERT INTO ad_creatives (
          campaign_id, creative_type, title, description, headline, call_to_action,
          image_url, video_url, video_thumbnail, landing_page_url, creative_assets,
          dimensions, file_size, duration, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          campaignId, creative_type, title, description, headline, call_to_action,
          image_url, video_url, video_thumbnail, landing_page_url, JSON.stringify(creative_assets),
          dimensions, file_size, duration
        ]
      );

      return {
        id: result.insertId,
        campaign_id: campaignId,
        creative_type,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Failed to create creative: ${error.message}`);
    }
  }

  // Get creative by ID
  async getCreativeById(creativeId) {
    try {
      const [rows] = await db.execute(
        `SELECT c.*, camp.campaign_name, camp.objective, camp.status as campaign_status,
                adv.business_name, adv.business_type
         FROM ad_creatives c
         JOIN ad_campaigns camp ON c.campaign_id = camp.id
         JOIN advertisers adv ON camp.advertiser_id = adv.id
         WHERE c.id = ?`,
        [creativeId]
      );

      if (rows.length === 0) return null;

      const creative = rows[0];
      creative.creative_assets = JSON.parse(creative.creative_assets || '{}');

      return creative;
    } catch (error) {
      throw new Error(`Failed to get creative: ${error.message}`);
    }
  }

  // Get creatives by campaign
  async getCreativesByCampaign(campaignId) {
    try {
      const [rows] = await db.execute(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM ad_servings WHERE creative_id = c.id) as total_impressions,
                (SELECT COUNT(*) FROM ad_servings WHERE creative_id = c.id AND clicked_at IS NOT NULL) as total_clicks,
                (SELECT COUNT(*) FROM ad_servings WHERE creative_id = c.id AND conversion_at IS NOT NULL) as total_conversions
         FROM ad_creatives c
         WHERE c.campaign_id = ?
         ORDER BY c.created_at DESC`,
        [campaignId]
      );

      return rows.map(creative => ({
        ...creative,
        creative_assets: JSON.parse(creative.creative_assets || '{}')
      }));
    } catch (error) {
      throw new Error(`Failed to get creatives: ${error.message}`);
    }
  }

  // Update creative
  async updateCreative(creativeId, updateData) {
    try {
      const allowedFields = [
        'title', 'description', 'headline', 'call_to_action',
        'image_url', 'video_url', 'video_thumbnail', 'landing_page_url',
        'creative_assets', 'dimensions', 'file_size', 'duration'
      ];

      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === 'creative_assets') {
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

      updateValues.push(creativeId);

      const [result] = await db.execute(
        `UPDATE ad_creatives SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update creative: ${error.message}`);
    }
  }

  // Approve/Reject creative
  async updateCreativeStatus(creativeId, status, rejectionReason = null) {
    try {
      const [result] = await db.execute(
        `UPDATE ad_creatives 
         SET status = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, rejectionReason, creativeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update creative status: ${error.message}`);
    }
  }

  // Get creative performance
  async getCreativePerformance(creativeId, startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      const queryParams = [creativeId];

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
         WHERE s.creative_id = ? ${dateFilter}`,
        queryParams
      );

      const [placementPerformance] = await db.execute(
        `SELECT 
           p.placement_name,
           p.module,
           p.page_location,
           COUNT(s.id) as impressions,
           COUNT(s.clicked_at) as clicks,
           AVG(s.cost_per_impression) as avg_cpm
         FROM ad_servings s
         JOIN ad_placements p ON s.placement_id = p.id
         WHERE s.creative_id = ? ${dateFilter}
         GROUP BY p.id, p.placement_name, p.module, p.page_location
         ORDER BY impressions DESC`,
        queryParams
      );

      return {
        ...performance[0],
        placement_performance: placementPerformance
      };
    } catch (error) {
      throw new Error(`Failed to get creative performance: ${error.message}`);
    }
  }

  // Delete creative
  async deleteCreative(creativeId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM ad_creatives WHERE id = ?',
        [creativeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete creative: ${error.message}`);
    }
  }

  // Get creatives for approval
  async getCreativesForApproval(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE c.status = "pending"';
      const queryParams = [];

      if (filters.creative_type) {
        whereClause += ' AND c.creative_type = ?';
        queryParams.push(filters.creative_type);
      }

      if (filters.campaign_id) {
        whereClause += ' AND c.campaign_id = ?';
        queryParams.push(filters.campaign_id);
      }

      if (filters.business_type) {
        whereClause += ' AND adv.business_type = ?';
        queryParams.push(filters.business_type);
      }

      const [rows] = await db.execute(
        `SELECT c.*, camp.campaign_name, camp.objective,
                adv.business_name, adv.business_type, adv.verification_status
         FROM ad_creatives c
         JOIN ad_campaigns camp ON c.campaign_id = camp.id
         JOIN advertisers adv ON camp.advertiser_id = adv.id
         ${whereClause}
         ORDER BY c.created_at ASC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Parse JSON fields
      const creatives = rows.map(creative => ({
        ...creative,
        creative_assets: JSON.parse(creative.creative_assets || '{}')
      }));

      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM ad_creatives c
         JOIN ad_campaigns camp ON c.campaign_id = camp.id
         JOIN advertisers adv ON camp.advertiser_id = adv.id
         ${whereClause}`,
        queryParams
      );

      return {
        creatives,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get creatives for approval: ${error.message}`);
    }
  }

  // Get creative by type and placement
  async getCreativesForPlacement(placementId, targetingCriteria = {}) {
    try {
      // Get placement details
      const [placementRows] = await db.execute(
        'SELECT * FROM ad_placements WHERE id = ? AND is_active = TRUE',
        [placementId]
      );

      if (placementRows.length === 0) {
        return [];
      }

      const placement = placementRows[0];

      // Build targeting query
      let targetingQuery = `
        SELECT DISTINCT c.*, camp.bid_amount, camp.budget_type, camp.budget_amount, camp.spent_amount
        FROM ad_creatives c
        JOIN ad_campaigns camp ON c.campaign_id = camp.id
        JOIN advertisers adv ON camp.advertiser_id = adv.id
        WHERE c.status = 'approved' 
          AND camp.status = 'active'
          AND adv.verification_status = 'verified'
          AND (camp.end_date IS NULL OR camp.end_date > NOW())
          AND (camp.budget_type = 'lifetime' OR camp.spent_amount < camp.budget_amount)
      `;

      const queryParams = [];

      // Add targeting filters
      if (targetingCriteria.demographics) {
        // Add demographic targeting logic
        targetingQuery += ' AND JSON_EXTRACT(camp.target_audience, "$.demographics") IS NOT NULL';
      }

      if (targetingCriteria.geographic) {
        // Add geographic targeting logic
        targetingQuery += ' AND JSON_EXTRACT(camp.target_audience, "$.geographic") IS NOT NULL';
      }

      if (targetingCriteria.interests) {
        // Add interest targeting logic
        targetingQuery += ' AND JSON_EXTRACT(camp.target_audience, "$.interests") IS NOT NULL';
      }

      targetingQuery += ' ORDER BY camp.bid_amount DESC, c.created_at DESC LIMIT ?';
      queryParams.push(placement.max_ads_per_page || 1);

      const [rows] = await db.execute(targetingQuery, queryParams);

      return rows.map(creative => ({
        ...creative,
        creative_assets: JSON.parse(creative.creative_assets || '{}')
      }));
    } catch (error) {
      throw new Error(`Failed to get creatives for placement: ${error.message}`);
    }
  }
}

module.exports = new AdCreativeService();
