const db = require('../db/connection');

class AIAdTargetingService {
  // AI-powered audience targeting suggestions
  async getAudienceSuggestions(campaignId, businessType, objective) {
    try {
      const suggestions = {
        demographics: this.getDemographicSuggestions(businessType, objective),
        geographic: this.getGeographicSuggestions(businessType, objective),
        interests: this.getInterestSuggestions(businessType, objective),
        behavioral: this.getBehavioralSuggestions(businessType, objective),
        device: this.getDeviceSuggestions(businessType, objective)
      };

      return suggestions;
    } catch (error) {
      throw new Error(`Failed to get audience suggestions: ${error.message}`);
    }
  }

  // Get demographic targeting suggestions
  getDemographicSuggestions(businessType, objective) {
    const suggestions = {
      university: {
        awareness: {
          age_range: { min: 16, max: 25 },
          gender: 'all',
          education_level: ['high_school', 'undergraduate'],
          income_level: 'any'
        },
        leads: {
          age_range: { min: 17, max: 24 },
          gender: 'all',
          education_level: ['high_school', 'undergraduate'],
          income_level: 'any'
        }
      },
      car_dealer: {
        awareness: {
          age_range: { min: 18, max: 65 },
          gender: 'all',
          education_level: 'any',
          income_level: 'middle_high'
        },
        conversions: {
          age_range: { min: 25, max: 55 },
          gender: 'all',
          education_level: 'any',
          income_level: 'high'
        }
      },
      course_provider: {
        awareness: {
          age_range: { min: 18, max: 45 },
          gender: 'all',
          education_level: 'any',
          income_level: 'any'
        },
        leads: {
          age_range: { min: 20, max: 40 },
          gender: 'all',
          education_level: ['undergraduate', 'graduate'],
          income_level: 'middle'
        }
      },
      scholarship_provider: {
        awareness: {
          age_range: { min: 16, max: 30 },
          gender: 'all',
          education_level: ['high_school', 'undergraduate', 'graduate'],
          income_level: 'low_middle'
        },
        leads: {
          age_range: { min: 17, max: 28 },
          gender: 'all',
          education_level: ['high_school', 'undergraduate'],
          income_level: 'low_middle'
        }
      }
    };

    return suggestions[businessType]?.[objective] || suggestions[businessType]?.awareness || suggestions.university.awareness;
  }

  // Get geographic targeting suggestions
  getGeographicSuggestions(businessType, objective) {
    const suggestions = {
      university: {
        awareness: {
          countries: ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK'],
          regions: ['North America', 'Europe', 'Oceania'],
          cities: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris']
        },
        leads: {
          countries: ['US', 'CA', 'UK', 'AU'],
          regions: ['North America', 'Europe'],
          cities: ['New York', 'London', 'Toronto', 'Sydney']
        }
      },
      car_dealer: {
        awareness: {
          countries: ['US', 'CA', 'UK', 'DE', 'FR', 'AU'],
          regions: ['North America', 'Europe', 'Oceania'],
          cities: ['New York', 'Los Angeles', 'London', 'Berlin', 'Paris', 'Sydney']
        },
        conversions: {
          countries: ['US', 'CA', 'UK', 'DE'],
          regions: ['North America', 'Europe'],
          cities: ['New York', 'Los Angeles', 'London', 'Berlin']
        }
      },
      course_provider: {
        awareness: {
          countries: ['US', 'CA', 'UK', 'AU', 'IN', 'BR', 'MX'],
          regions: ['North America', 'Europe', 'Oceania', 'Asia', 'South America'],
          cities: ['New York', 'London', 'Toronto', 'Sydney', 'Mumbai', 'São Paulo']
        },
        leads: {
          countries: ['US', 'CA', 'UK', 'AU', 'IN'],
          regions: ['North America', 'Europe', 'Oceania', 'Asia'],
          cities: ['New York', 'London', 'Toronto', 'Sydney', 'Mumbai']
        }
      },
      scholarship_provider: {
        awareness: {
          countries: ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'IN', 'BR', 'MX'],
          regions: ['North America', 'Europe', 'Oceania', 'Asia', 'South America'],
          cities: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Mumbai', 'São Paulo']
        },
        leads: {
          countries: ['US', 'CA', 'UK', 'AU', 'DE', 'FR'],
          regions: ['North America', 'Europe', 'Oceania'],
          cities: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris']
        }
      }
    };

    return suggestions[businessType]?.[objective] || suggestions[businessType]?.awareness || suggestions.university.awareness;
  }

  // Get interest targeting suggestions
  getInterestSuggestions(businessType, objective) {
    const suggestions = {
      university: {
        awareness: {
          interests: ['education', 'study_abroad', 'university', 'college', 'academic', 'research'],
          keywords: ['study', 'university', 'college', 'education', 'degree', 'scholarship']
        },
        leads: {
          interests: ['study_abroad', 'university', 'college', 'academic', 'research', 'career'],
          keywords: ['apply', 'admission', 'university', 'college', 'study', 'degree']
        }
      },
      car_dealer: {
        awareness: {
          interests: ['automotive', 'cars', 'driving', 'transportation', 'luxury', 'sports_cars'],
          keywords: ['car', 'vehicle', 'automobile', 'buy', 'sell', 'dealer']
        },
        conversions: {
          interests: ['automotive', 'cars', 'luxury', 'sports_cars', 'electric_vehicles'],
          keywords: ['buy car', 'car dealer', 'vehicle', 'automobile', 'finance']
        }
      },
      course_provider: {
        awareness: {
          interests: ['education', 'learning', 'online_courses', 'skill_development', 'career'],
          keywords: ['course', 'learn', 'skill', 'training', 'education', 'online']
        },
        leads: {
          interests: ['online_courses', 'skill_development', 'career', 'professional_development'],
          keywords: ['enroll', 'course', 'learn', 'skill', 'certification']
        }
      },
      scholarship_provider: {
        awareness: {
          interests: ['education', 'scholarship', 'study_abroad', 'university', 'college', 'academic'],
          keywords: ['scholarship', 'funding', 'study', 'education', 'university', 'college']
        },
        leads: {
          interests: ['scholarship', 'study_abroad', 'university', 'college', 'academic', 'research'],
          keywords: ['apply', 'scholarship', 'funding', 'study', 'university', 'college']
        }
      }
    };

    return suggestions[businessType]?.[objective] || suggestions[businessType]?.awareness || suggestions.university.awareness;
  }

  // Get behavioral targeting suggestions
  getBehavioralSuggestions(businessType, objective) {
    const suggestions = {
      university: {
        awareness: {
          behaviors: ['visited_university_pages', 'searched_scholarships', 'viewed_education_content'],
          recent_activity: ['education_related_searches', 'university_website_visits'],
          engagement: ['high_education_content_engagement', 'scholarship_application_interest']
        },
        leads: {
          behaviors: ['applied_scholarships', 'visited_university_pages', 'downloaded_education_materials'],
          recent_activity: ['scholarship_searches', 'university_application_interest'],
          engagement: ['high_education_engagement', 'active_scholarship_seeker']
        }
      },
      car_dealer: {
        awareness: {
          behaviors: ['visited_car_listings', 'searched_vehicles', 'viewed_automotive_content'],
          recent_activity: ['car_related_searches', 'dealership_visits'],
          engagement: ['high_automotive_engagement', 'car_buying_interest']
        },
        conversions: {
          behaviors: ['test_drove_vehicles', 'visited_car_listings', 'searched_financing'],
          recent_activity: ['car_purchase_searches', 'dealership_visits'],
          engagement: ['high_automotive_engagement', 'active_car_buyer']
        }
      },
      course_provider: {
        awareness: {
          behaviors: ['visited_course_pages', 'searched_learning_content', 'viewed_educational_materials'],
          recent_activity: ['course_related_searches', 'education_website_visits'],
          engagement: ['high_learning_engagement', 'course_enrollment_interest']
        },
        leads: {
          behaviors: ['enrolled_courses', 'visited_course_pages', 'downloaded_learning_materials'],
          recent_activity: ['course_searches', 'learning_interest'],
          engagement: ['high_learning_engagement', 'active_learner']
        }
      },
      scholarship_provider: {
        awareness: {
          behaviors: ['visited_scholarship_pages', 'searched_funding', 'viewed_education_content'],
          recent_activity: ['scholarship_searches', 'education_website_visits'],
          engagement: ['high_education_engagement', 'scholarship_interest']
        },
        leads: {
          behaviors: ['applied_scholarships', 'visited_scholarship_pages', 'downloaded_application_materials'],
          recent_activity: ['scholarship_searches', 'funding_interest'],
          engagement: ['high_education_engagement', 'active_scholarship_seeker']
        }
      }
    };

    return suggestions[businessType]?.[objective] || suggestions[businessType]?.awareness || suggestions.university.awareness;
  }

  // Get device targeting suggestions
  getDeviceSuggestions(businessType, objective) {
    const suggestions = {
      university: {
        awareness: {
          devices: ['mobile', 'desktop', 'tablet'],
          mobile_preference: 0.6,
          desktop_preference: 0.3,
          tablet_preference: 0.1
        },
        leads: {
          devices: ['mobile', 'desktop'],
          mobile_preference: 0.7,
          desktop_preference: 0.3,
          tablet_preference: 0.0
        }
      },
      car_dealer: {
        awareness: {
          devices: ['mobile', 'desktop', 'tablet'],
          mobile_preference: 0.4,
          desktop_preference: 0.5,
          tablet_preference: 0.1
        },
        conversions: {
          devices: ['desktop', 'mobile'],
          mobile_preference: 0.3,
          desktop_preference: 0.6,
          tablet_preference: 0.1
        }
      },
      course_provider: {
        awareness: {
          devices: ['mobile', 'desktop', 'tablet'],
          mobile_preference: 0.5,
          desktop_preference: 0.4,
          tablet_preference: 0.1
        },
        leads: {
          devices: ['mobile', 'desktop'],
          mobile_preference: 0.6,
          desktop_preference: 0.4,
          tablet_preference: 0.0
        }
      },
      scholarship_provider: {
        awareness: {
          devices: ['mobile', 'desktop', 'tablet'],
          mobile_preference: 0.6,
          desktop_preference: 0.3,
          tablet_preference: 0.1
        },
        leads: {
          devices: ['mobile', 'desktop'],
          mobile_preference: 0.7,
          desktop_preference: 0.3,
          tablet_preference: 0.0
        }
      }
    };

    return suggestions[businessType]?.[objective] || suggestions[businessType]?.awareness || suggestions.university.awareness;
  }

  // Optimize ad targeting based on performance data
  async optimizeTargeting(campaignId) {
    try {
      // Get campaign performance data
      const [performance] = await db.execute(
        `SELECT 
           COUNT(s.id) as impressions,
           COUNT(s.clicked_at) as clicks,
           COUNT(s.conversion_at) as conversions,
           AVG(s.cost_per_impression) as avg_cpm,
           AVG(s.cost_per_click) as avg_cpc
         FROM ad_servings s
         JOIN ad_creatives c ON s.creative_id = c.id
         WHERE c.campaign_id = ?`,
        [campaignId]
      );

      const data = performance[0];
      const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;

      // Get current targeting
      const [campaign] = await db.execute(
        'SELECT target_audience, targeting_criteria FROM ad_campaigns WHERE id = ?',
        [campaignId]
      );

      const currentTargeting = {
        target_audience: JSON.parse(campaign[0].target_audience || '{}'),
        targeting_criteria: JSON.parse(campaign[0].targeting_criteria || '{}')
      };

      // Generate optimization suggestions
      const optimizations = [];

      if (ctr < 2.0) {
        optimizations.push({
          type: 'ctr_optimization',
          suggestion: 'Consider refining your target audience or improving ad creative',
          priority: 'high',
          actions: [
            'Narrow down demographic targeting',
            'Improve ad creative relevance',
            'Test different interest categories'
          ]
        });
      }

      if (conversionRate < 5.0) {
        optimizations.push({
          type: 'conversion_optimization',
          suggestion: 'Focus on users more likely to convert',
          priority: 'high',
          actions: [
            'Target users with higher engagement history',
            'Refine behavioral targeting',
            'Improve landing page experience'
          ]
        });
      }

      if (data.avg_cpm > 5.0) {
        optimizations.push({
          type: 'cost_optimization',
          suggestion: 'Reduce cost per impression',
          priority: 'medium',
          actions: [
            'Lower bid amounts',
            'Target less competitive keywords',
            'Focus on lower-cost placements'
          ]
        });
      }

      return {
        current_performance: {
          impressions: data.impressions,
          clicks: data.clicks,
          conversions: data.conversions,
          ctr: ctr,
          conversion_rate: conversionRate,
          avg_cpm: data.avg_cpm,
          avg_cpc: data.avg_cpc
        },
        optimizations,
        recommended_changes: this.generateRecommendedChanges(currentTargeting, optimizations)
      };
    } catch (error) {
      throw new Error(`Failed to optimize targeting: ${error.message}`);
    }
  }

  // Generate recommended changes based on optimizations
  generateRecommendedChanges(currentTargeting, optimizations) {
    const changes = {};

    optimizations.forEach(opt => {
      if (opt.type === 'ctr_optimization') {
        changes.demographics = {
          ...currentTargeting.target_audience.demographics,
          age_range: { min: 18, max: 35 }, // Narrow age range
          education_level: ['undergraduate', 'graduate'] // Focus on higher education
        };
      }

      if (opt.type === 'conversion_optimization') {
        changes.behavioral = {
          ...currentTargeting.target_audience.behavioral,
          engagement_level: 'high',
          recent_activity: ['active_searcher', 'high_engagement']
        };
      }

      if (opt.type === 'cost_optimization') {
        changes.bid_strategy = 'auto';
        changes.bid_amount = Math.max(0.50, (currentTargeting.targeting_criteria.bid_amount || 1.00) * 0.8);
      }
    });

    return changes;
  }

  // Predict ad performance for targeting options
  async predictAdPerformance(campaignId, targetingOptions) {
    try {
      // Get historical performance data for similar campaigns
      const [similarCampaigns] = await db.execute(
        `SELECT 
           c.objective,
           c.target_audience,
           c.targeting_criteria,
           COUNT(s.id) as impressions,
           COUNT(s.clicked_at) as clicks,
           COUNT(s.conversion_at) as conversions,
           AVG(s.cost_per_impression) as avg_cpm
         FROM ad_campaigns c
         JOIN ad_creatives cr ON c.id = cr.campaign_id
         JOIN ad_servings s ON cr.id = s.creative_id
         WHERE c.objective = (SELECT objective FROM ad_campaigns WHERE id = ?)
           AND c.id != ?
         GROUP BY c.id
         HAVING impressions > 100
         ORDER BY impressions DESC
         LIMIT 10`,
        [campaignId, campaignId]
      );

      if (similarCampaigns.length === 0) {
        return {
          predicted_ctr: 2.0,
          predicted_conversion_rate: 5.0,
          predicted_cpm: 2.0,
          confidence: 'low',
          recommendation: 'Insufficient data for prediction'
        };
      }

      // Calculate average performance
      const avgCtr = similarCampaigns.reduce((sum, c) => {
        const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
        return sum + ctr;
      }, 0) / similarCampaigns.length;

      const avgConversionRate = similarCampaigns.reduce((sum, c) => {
        const convRate = c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0;
        return sum + convRate;
      }, 0) / similarCampaigns.length;

      const avgCpm = similarCampaigns.reduce((sum, c) => sum + (c.avg_cpm || 0), 0) / similarCampaigns.length;

      // Adjust predictions based on targeting options
      let ctrMultiplier = 1.0;
      let conversionMultiplier = 1.0;
      let cpmMultiplier = 1.0;

      if (targetingOptions.demographics?.age_range) {
        const ageRange = targetingOptions.demographics.age_range;
        if (ageRange.max - ageRange.min < 10) {
          ctrMultiplier *= 1.2; // Narrow age range improves CTR
        }
      }

      if (targetingOptions.behavioral?.engagement_level === 'high') {
        conversionMultiplier *= 1.5; // High engagement improves conversions
      }

      if (targetingOptions.interests?.length > 5) {
        cpmMultiplier *= 1.3; // More interests = higher competition
      }

      return {
        predicted_ctr: Math.round(avgCtr * ctrMultiplier * 100) / 100,
        predicted_conversion_rate: Math.round(avgConversionRate * conversionMultiplier * 100) / 100,
        predicted_cpm: Math.round(avgCpm * cpmMultiplier * 100) / 100,
        confidence: similarCampaigns.length > 5 ? 'high' : 'medium',
        recommendation: this.generatePerformanceRecommendation(avgCtr, avgConversionRate, avgCpm),
        data_points: similarCampaigns.length
      };
    } catch (error) {
      throw new Error(`Failed to predict ad performance: ${error.message}`);
    }
  }

  // Generate performance recommendation
  generatePerformanceRecommendation(ctr, conversionRate, cpm) {
    if (ctr > 3.0 && conversionRate > 8.0) {
      return 'Excellent targeting! Consider increasing budget to scale successful campaigns.';
    } else if (ctr > 2.0 && conversionRate > 5.0) {
      return 'Good performance. Test additional targeting options to improve further.';
    } else if (ctr < 1.0 || conversionRate < 3.0) {
      return 'Performance needs improvement. Consider refining audience targeting and ad creative.';
    } else {
      return 'Average performance. A/B test different targeting options to optimize.';
    }
  }
}

module.exports = new AIAdTargetingService();
