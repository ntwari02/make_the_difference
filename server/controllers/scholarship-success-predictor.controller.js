const scholarshipSuccessPredictorService = require('../services/scholarship-success-predictor.service');

class ScholarshipSuccessPredictorController {
  // Get comprehensive success prediction
  async getSuccessPrediction(req, res) {
    try {
      const userId = req.user.id;
      const { scholarshipId } = req.params;
      const { applicationData } = req.body;

      const prediction = await scholarshipSuccessPredictorService.getSuccessPrediction(
        userId, 
        scholarshipId, 
        applicationData
      );

      res.json({
        success: true,
        data: prediction,
        message: `Success probability: ${Math.round(prediction.overall_success_probability * 100)}%`
      });
    } catch (error) {
      console.error('Error in getSuccessPrediction:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get success prediction'
      });
    }
  }

  // Get success prediction for application form
  async getApplicationFormPrediction(req, res) {
    try {
      const userId = req.user.id;
      const { scholarshipId } = req.params;
      const applicationData = req.body;

      const prediction = await scholarshipSuccessPredictorService.getSuccessPrediction(
        userId, 
        scholarshipId, 
        applicationData
      );

      // Format response for application form display
      const formResponse = {
        success_probability: prediction.overall_success_probability,
        confidence_level: prediction.confidence_level,
        scholarship_info: prediction.scholarship_info,
        criteria_analysis: this.formatCriteriaAnalysis(prediction.success_factors, prediction.detailed_breakdown),
        competitive_analysis: prediction.competitive_analysis,
        improvement_recommendations: prediction.improvement_recommendations,
        success_factors_breakdown: prediction.success_factors,
        generated_at: prediction.generated_at
      };

      res.json({
        success: true,
        data: formResponse,
        message: `Your chances of success: ${Math.round(prediction.overall_success_probability * 100)}%`
      });
    } catch (error) {
      console.error('Error in getApplicationFormPrediction:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get application form prediction'
      });
    }
  }

  // Format criteria analysis for form display
  formatCriteriaAnalysis(successFactors, detailedBreakdown) {
    const criteria = [];

    for (const [factor, data] of Object.entries(detailedBreakdown)) {
      const factorInfo = successFactors[factor];
      
      criteria.push({
        factor_name: this.getFactorDisplayName(factor),
        factor_key: factor,
        score: data.score,
        status: data.status,
        importance: factorInfo.importance,
        weight: factorInfo.weight,
        description: factorInfo.description,
        details: data.details,
        user_data: this.extractUserData(data, factor),
        requirements: this.extractRequirements(data, factor),
        recommendation: this.getFactorRecommendation(data, factor)
      });
    }

    return criteria.sort((a, b) => b.weight - a.weight);
  }

  // Get factor display name
  getFactorDisplayName(factor) {
    const displayNames = {
      academic_performance: 'Academic Performance',
      field_match: 'Field of Study Match',
      nationality_eligibility: 'Nationality Eligibility',
      age_requirement: 'Age Requirements',
      language_proficiency: 'Language Proficiency',
      financial_need: 'Financial Need',
      extracurricular_activities: 'Extracurricular Activities',
      essay_quality: 'Application Essays'
    };

    return displayNames[factor] || factor;
  }

  // Extract user data for display
  extractUserData(data, factor) {
    switch (factor) {
      case 'academic_performance':
        return {
          user_gpa: data.user_gpa,
          required_gpa: data.required_gpa,
          has_honors: data.details.some(d => d.includes('honors') || d.includes('awards'))
        };
      case 'field_match':
        return {
          user_field: data.user_field,
          scholarship_fields: data.scholarship_fields
        };
      case 'nationality_eligibility':
        return {
          user_nationality: data.user_nationality,
          restrictions: data.restrictions
        };
      case 'age_requirement':
        return {
          user_age: data.user_age,
          min_age: data.min_age,
          max_age: data.max_age
        };
      case 'language_proficiency':
        return {
          user_skills: data.user_skills,
          requirements: data.requirements
        };
      case 'financial_need':
        return {
          is_need_based: data.is_need_based
        };
      case 'extracurricular_activities':
        return {
          total_activities: data.total_activities
        };
      case 'essay_quality':
        return {
          motivation_length: data.motivation_length,
          career_goals_length: data.career_goals_length
        };
      default:
        return {};
    }
  }

  // Extract requirements for display
  extractRequirements(data, factor) {
    switch (factor) {
      case 'academic_performance':
        return {
          gpa_requirement: data.required_gpa,
          honors_preferred: true
        };
      case 'field_match':
        return {
          accepted_fields: data.scholarship_fields,
          open_to_all: data.scholarship_fields.length === 0 || data.scholarship_fields.includes('any')
        };
      case 'nationality_eligibility':
        return {
          eligible_nationalities: data.restrictions,
          no_restrictions: data.restrictions.length === 0
        };
      case 'age_requirement':
        return {
          age_range: `${data.min_age}-${data.max_age}`,
          no_age_limit: data.min_age === 0 && data.max_age === 100
        };
      case 'language_proficiency':
        return {
          required_languages: data.requirements,
          no_language_requirements: Object.keys(data.requirements).length === 0
        };
      case 'financial_need':
        return {
          need_based: data.is_need_based,
          documentation_required: data.is_need_based
        };
      case 'extracurricular_activities':
        return {
          activities_preferred: true,
          leadership_preferred: true
        };
      case 'essay_quality':
        return {
          motivation_statement_required: true,
          career_goals_required: true,
          minimum_length: 200
        };
      default:
        return {};
    }
  }

  // Get factor-specific recommendation
  getFactorRecommendation(data, factor) {
    if (data.score >= 0.8) {
      return `Excellent! You meet this requirement very well.`;
    } else if (data.score >= 0.6) {
      return `Good! You meet this requirement adequately.`;
    } else if (data.score >= 0.4) {
      return `Fair. Consider improving this aspect of your application.`;
    } else {
      switch (factor) {
        case 'academic_performance':
          return `Your GPA is below the requirement. Consider improving your grades or highlighting other academic achievements.`;
        case 'field_match':
          return `Your field of study doesn't match this scholarship. Look for scholarships in your field.`;
        case 'nationality_eligibility':
          return `Your nationality is not eligible for this scholarship.`;
        case 'age_requirement':
          return `Your age doesn't meet the scholarship requirements.`;
        case 'language_proficiency':
          return `You need to improve your language skills or take proficiency tests.`;
        case 'financial_need':
          return `You need to provide comprehensive financial need documentation.`;
        case 'extracurricular_activities':
          return `Get involved in more extracurricular activities to strengthen your profile.`;
        case 'essay_quality':
          return `Improve your motivation statement and career goals essays.`;
        default:
          return `This area needs improvement.`;
      }
    }
  }

  // Get quick success check (without detailed analysis)
  async getQuickSuccessCheck(req, res) {
    try {
      const userId = req.user.id;
      const { scholarshipId } = req.params;

      const prediction = await scholarshipSuccessPredictorService.getSuccessPrediction(userId, scholarshipId);

      const quickResponse = {
        success_probability: prediction.overall_success_probability,
        confidence_level: prediction.confidence_level,
        eligibility_status: this.getEligibilityStatus(prediction.detailed_breakdown),
        top_strengths: this.getTopStrengths(prediction.detailed_breakdown),
        main_concerns: this.getMainConcerns(prediction.detailed_breakdown),
        recommendation: this.getOverallRecommendation(prediction.overall_success_probability)
      };

      res.json({
        success: true,
        data: quickResponse,
        message: `Quick assessment: ${Math.round(prediction.overall_success_probability * 100)}% success probability`
      });
    } catch (error) {
      console.error('Error in getQuickSuccessCheck:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get quick success check'
      });
    }
  }

  // Get eligibility status
  getEligibilityStatus(breakdown) {
    const criticalFactors = ['nationality_eligibility', 'age_requirement'];
    
    for (const factor of criticalFactors) {
      if (breakdown[factor] && breakdown[factor].score === 0) {
        return 'not_eligible';
      }
    }

    return 'eligible';
  }

  // Get top strengths
  getTopStrengths(breakdown) {
    const strengths = [];
    
    for (const [factor, data] of Object.entries(breakdown)) {
      if (data.score >= 0.8) {
        strengths.push({
          factor: this.getFactorDisplayName(factor),
          score: data.score,
          details: data.details[0] || 'Strong performance'
        });
      }
    }

    return strengths.slice(0, 3);
  }

  // Get main concerns
  getMainConcerns(breakdown) {
    const concerns = [];
    
    for (const [factor, data] of Object.entries(breakdown)) {
      if (data.score < 0.4) {
        concerns.push({
          factor: this.getFactorDisplayName(factor),
          score: data.score,
          details: data.details[0] || 'Needs improvement'
        });
      }
    }

    return concerns.slice(0, 3);
  }

  // Get overall recommendation
  getOverallRecommendation(probability) {
    if (probability >= 0.8) {
      return 'Excellent chance! This scholarship is a great match for your profile.';
    } else if (probability >= 0.6) {
      return 'Good chance! You have a solid application with some areas for improvement.';
    } else if (probability >= 0.4) {
      return 'Fair chance. Consider improving your application or looking for better matches.';
    } else {
      return 'Low chance. This scholarship may not be the best fit for your profile.';
    }
  }
}

module.exports = new ScholarshipSuccessPredictorController();
