const db = require('../db/connection');
const crypto = require('crypto');

class AdServingService {
  // Serve ad for a placement
  async serveAd(placementId, userContext = {}) {
    try {
      const {
        user_id,
        session_id,
        ip_address,
        user_agent,
        referrer_url,
        page_url,
        device_type = 'desktop',
        targeting_criteria = {}
      } = userContext;

      // Get placement details
      const [placementRows] = await db.execute(
        'SELECT * FROM ad_placements WHERE id = ? AND is_active = TRUE',
        [placementId]
      );

      if (placementRows.length === 0) {
        throw new Error('Placement not found or inactive');
      }

      const placement = placementRows[0];

      // Get available creatives for this placement
      const creatives = await this.getAvailableCreatives(placementId, targeting_criteria);

      if (creatives.length === 0) {
        return null; // No ads available
      }

      // Select best creative (highest bid or random if equal)
      const selectedCreative = this.selectBestCreative(creatives);

      // Generate impression ID
      const impressionId = this.generateImpressionId();

      // Calculate costs
      const costs = this.calculateAdCosts(selectedCreative, placement);

      // Record ad serving
      const [result] = await db.execute(
        `INSERT INTO ad_servings (
          creative_id, placement_id, user_id, session_id, impression_id,
          ip_address, user_agent, referrer_url, page_url, device_type,
          cost_per_impression, cost_per_click, cost_per_conversion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          selectedCreative.id, placementId, user_id, session_id, impressionId,
          ip_address, user_agent, referrer_url, page_url, device_type,
          costs.cpm, costs.cpc, costs.cpa
        ]
      );

      // Update campaign spend
      await this.updateCampaignSpend(selectedCreative.campaign_id, costs.cpm);

      return {
        ...selectedCreative,
        impression_id: impressionId,
        serving_id: result.insertId,
        costs
      };
    } catch (error) {
      throw new Error(`Failed to serve ad: ${error.message}`);
    }
  }

  // Get available creatives for placement
  async getAvailableCreatives(placementId, targetingCriteria = {}) {
    try {
      const [placementRows] = await db.execute(
        'SELECT * FROM ad_placements WHERE id = ? AND is_active = TRUE',
        [placementId]
      );

      if (placementRows.length === 0) {
        return [];
      }

      const placement = placementRows[0];

      let query = `
        SELECT DISTINCT c.*, camp.bid_amount, camp.budget_type, camp.budget_amount, camp.spent_amount,
               camp.target_audience, camp.targeting_criteria
        FROM ad_creatives c
        JOIN ad_campaigns camp ON c.campaign_id = camp.id
        JOIN advertisers adv ON camp.advertiser_id = adv.id
        WHERE c.status = 'approved' 
          AND camp.status = 'active'
          AND adv.verification_status = 'verified'
          AND c.creative_type = ?
          AND (camp.end_date IS NULL OR camp.end_date > NOW())
          AND (camp.budget_type = 'lifetime' OR camp.spent_amount < camp.budget_amount)
      `;

      const queryParams = [placement.ad_format];

      // Add targeting filters
      if (targetingCriteria.demographics) {
        query += ' AND JSON_EXTRACT(camp.target_audience, "$.demographics") IS NOT NULL';
      }

      if (targetingCriteria.geographic) {
        query += ' AND JSON_EXTRACT(camp.target_audience, "$.geographic") IS NOT NULL';
      }

      if (targetingCriteria.interests) {
        query += ' AND JSON_EXTRACT(camp.target_audience, "$.interests") IS NOT NULL';
      }

      query += ' ORDER BY camp.bid_amount DESC, c.created_at DESC LIMIT ?';
      queryParams.push(placement.max_ads_per_page || 1);

      const [rows] = await db.execute(query, queryParams);

      return rows.map(creative => ({
        ...creative,
        creative_assets: JSON.parse(creative.creative_assets || '{}'),
        target_audience: JSON.parse(creative.target_audience || '{}'),
        targeting_criteria: JSON.parse(creative.targeting_criteria || '{}')
      }));
    } catch (error) {
      throw new Error(`Failed to get available creatives: ${error.message}`);
    }
  }

  // Select best creative from available options
  selectBestCreative(creatives) {
    if (creatives.length === 0) return null;
    if (creatives.length === 1) return creatives[0];

    // Sort by bid amount (highest first)
    const sortedCreatives = creatives.sort((a, b) => b.bid_amount - a.bid_amount);

    // If there's a clear winner, return it
    if (sortedCreatives[0].bid_amount > sortedCreatives[1].bid_amount) {
      return sortedCreatives[0];
    }

    // If bids are equal, randomly select from top bidders
    const topBid = sortedCreatives[0].bid_amount;
    const topBidders = sortedCreatives.filter(c => c.bid_amount === topBid);
    
    return topBidders[Math.floor(Math.random() * topBidders.length)];
  }

  // Record ad click
  async recordClick(impressionId, clickData = {}) {
    try {
      const {
        user_id,
        session_id,
        click_position,
        click_element,
        page_url
      } = clickData;

      const [result] = await db.execute(
        `UPDATE ad_servings 
         SET clicked_at = CURRENT_TIMESTAMP, 
             click_position = ?, 
             click_element = ?,
             page_url = ?
         WHERE impression_id = ?`,
        [click_position, click_element, page_url, impressionId]
      );

      if (result.affectedRows > 0) {
        // Update campaign spend for click
        const [serving] = await db.execute(
          'SELECT creative_id FROM ad_servings WHERE impression_id = ?',
          [impressionId]
        );

        if (serving.length > 0) {
          const [campaign] = await db.execute(
            'SELECT campaign_id FROM ad_creatives WHERE id = ?',
            [serving[0].creative_id]
          );

          if (campaign.length > 0) {
            await this.updateCampaignSpend(campaign[0].campaign_id, 0, 0.50); // $0.50 per click
          }
        }
      }

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to record click: ${error.message}`);
    }
  }

  // Record conversion
  async recordConversion(impressionId, conversionData = {}) {
    try {
      const {
        conversion_type,
        conversion_value,
        conversion_data
      } = conversionData;

      const [result] = await db.execute(
        `UPDATE ad_servings 
         SET conversion_at = CURRENT_TIMESTAMP,
             conversion_type = ?,
             conversion_value = ?,
             conversion_data = ?
         WHERE impression_id = ?`,
        [conversion_type, conversion_value, JSON.stringify(conversion_data), impressionId]
      );

      if (result.affectedRows > 0) {
        // Update campaign spend for conversion
        const [serving] = await db.execute(
          'SELECT creative_id FROM ad_servings WHERE impression_id = ?',
          [impressionId]
        );

        if (serving.length > 0) {
          const [campaign] = await db.execute(
            'SELECT campaign_id FROM ad_creatives WHERE id = ?',
            [serving[0].creative_id]
          );

          if (campaign.length > 0) {
            await this.updateCampaignSpend(campaign[0].campaign_id, 0, 0, 5.00); // $5.00 per conversion
          }
        }
      }

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to record conversion: ${error.message}`);
    }
  }

  // Calculate ad costs
  calculateAdCosts(creative, placement) {
    const bidAmount = creative.bid_amount || 0;
    const basePrice = placement.base_price || 0;

    return {
      cpm: Math.max(bidAmount, basePrice) / 1000, // Cost per mille
      cpc: Math.max(bidAmount * 0.1, 0.50), // Cost per click
      cpa: Math.max(bidAmount * 0.5, 5.00)  // Cost per acquisition
    };
  }

  // Update campaign spend
  async updateCampaignSpend(campaignId, impressionCost = 0, clickCost = 0, conversionCost = 0) {
    try {
      const totalCost = impressionCost + clickCost + conversionCost;

      await db.execute(
        'UPDATE ad_campaigns SET spent_amount = spent_amount + ? WHERE id = ?',
        [totalCost, campaignId]
      );
    } catch (error) {
      throw new Error(`Failed to update campaign spend: ${error.message}`);
    }
  }

  // Generate unique impression ID
  generateImpressionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Get ad performance analytics
  async getAdPerformance(filters = {}) {
    try {
      const {
        start_date,
        end_date,
        campaign_id,
        creative_id,
        placement_id,
        advertiser_id
      } = filters;

      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (start_date && end_date) {
        whereClause += ' AND DATE(s.served_at) BETWEEN ? AND ?';
        queryParams.push(start_date, end_date);
      }

      if (campaign_id) {
        whereClause += ' AND c.campaign_id = ?';
        queryParams.push(campaign_id);
      }

      if (creative_id) {
        whereClause += ' AND s.creative_id = ?';
        queryParams.push(creative_id);
      }

      if (placement_id) {
        whereClause += ' AND s.placement_id = ?';
        queryParams.push(placement_id);
      }

      if (advertiser_id) {
        whereClause += ' AND camp.advertiser_id = ?';
        queryParams.push(advertiser_id);
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
         JOIN ad_campaigns camp ON c.campaign_id = camp.id
         ${whereClause}`,
        queryParams
      );

      return performance[0];
    } catch (error) {
      throw new Error(`Failed to get ad performance: ${error.message}`);
    }
  }

  // Get placement performance
  async getPlacementPerformance(placementId, startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      const queryParams = [placementId];

      if (startDate && endDate) {
        dateFilter = 'AND DATE(s.served_at) BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
      }

      const [performance] = await db.execute(
        `SELECT 
           p.placement_name,
           p.module,
           p.page_location,
           COUNT(s.id) as total_impressions,
           COUNT(s.clicked_at) as total_clicks,
           COUNT(s.conversion_at) as total_conversions,
           SUM(s.cost_per_impression) as total_revenue,
           AVG(s.cost_per_impression) as avg_cpm,
           CASE 
             WHEN COUNT(s.id) > 0 THEN (COUNT(s.clicked_at) / COUNT(s.id)) * 100
             ELSE 0 
           END as ctr
         FROM ad_servings s
         JOIN ad_placements p ON s.placement_id = p.id
         WHERE s.placement_id = ? ${dateFilter}
         GROUP BY p.id, p.placement_name, p.module, p.page_location`,
        queryParams
      );

      return performance[0] || null;
    } catch (error) {
      throw new Error(`Failed to get placement performance: ${error.message}`);
    }
  }

  // Detect ad fraud
  async detectAdFraud(servingId) {
    try {
      const [serving] = await db.execute(
        `SELECT s.*, c.campaign_id, camp.advertiser_id
         FROM ad_servings s
         JOIN ad_creatives c ON s.creative_id = c.id
         JOIN ad_campaigns camp ON c.campaign_id = camp.id
         WHERE s.id = ?`,
        [servingId]
      );

      if (serving.length === 0) {
        return null;
      }

      const adServing = serving[0];
      let fraudScore = 0;
      let fraudReasons = [];

      // Check for suspicious patterns
      const [recentImpressions] = await db.execute(
        `SELECT COUNT(*) as count FROM ad_servings 
         WHERE ip_address = ? AND served_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [adServing.ip_address]
      );

      if (recentImpressions[0].count > 10) {
        fraudScore += 0.3;
        fraudReasons.push('High impression frequency from same IP');
      }

      // Check for bot-like behavior
      if (adServing.user_agent && adServing.user_agent.includes('bot')) {
        fraudScore += 0.5;
        fraudReasons.push('Bot user agent detected');
      }

      // Check for suspicious click patterns
      if (adServing.clicked_at) {
        const [clickTime] = await db.execute(
          `SELECT TIMESTAMPDIFF(SECOND, served_at, clicked_at) as click_delay
           FROM ad_servings WHERE id = ?`,
          [servingId]
        );

        if (clickTime[0].click_delay < 1) {
          fraudScore += 0.2;
          fraudReasons.push('Suspiciously fast click');
        }
      }

      // Record fraud detection if score is high
      if (fraudScore > 0.3) {
        await db.execute(
          `INSERT INTO ad_fraud_detection (
            serving_id, fraud_type, fraud_score, detection_reason, is_confirmed
          ) VALUES (?, 'suspicious_behavior', ?, ?, FALSE)`,
          [servingId, fraudScore, fraudReasons.join('; ')]
        );
      }

      return {
        fraud_score: fraudScore,
        fraud_reasons: fraudReasons,
        is_fraudulent: fraudScore > 0.5
      };
    } catch (error) {
      throw new Error(`Failed to detect ad fraud: ${error.message}`);
    }
  }
}

module.exports = new AdServingService();
