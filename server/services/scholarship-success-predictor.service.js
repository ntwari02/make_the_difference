const { executeQuery } = require('../config/database');
const scholarshipService = require('./scholarship.service');
const scholarshipMatchingService = require('./scholarship-matching.service');

class ScholarshipSuccessPredictorService {
  constructor() {
    this.criteriaWeights = {
      academic_performance: 0.25,
      field_match: 0.20,
      nationality_eligibility: 0.15,
      age_requirement: 0.10,
      language_proficiency: 0.10,
      financial_need: 0.08,
      extracurricular_activities: 0.07,
      essay_quality: 0.05
    };

    this.competitivenessFactors = {
      application_volume: 0.30,
      scholarship_amount: 0.25,
      provider_type: 0.20,
      country_popularity: 0.15,
      deadline_proximity: 0.10
    };
  }

  // Get comprehensive success prediction for a user's application
  async getSuccessPrediction(userId, scholarshipId, applicationData = null) {
    try {
      // Get scholarship details
      const scholarship = await scholarshipService.getScholarshipById(scholarshipId);
      if (!scholarship) {
        throw new Error('Scholarship not found');
      }

      // Get user profile
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get application data if provided
      let application = applicationData;
      if (!application) {
        const applicationService = require('./scholarship-application.service');
        const existingApplication = await applicationService.getUserApplication(scholarshipId, userId);
        application = existingApplication?.application_data || {};
      }

      // Calculate detailed success prediction
      const prediction = await this.calculateDetailedPrediction(userProfile, scholarship, application);

      // Get improvement recommendations
      const recommendations = await this.getImprovementRecommendations(userProfile, scholarship, prediction);

      // Get competitive analysis
      const competitiveAnalysis = await this.getCompetitiveAnalysis(scholarship);

      // Get success factors breakdown
      const successFactors = await this.getSuccessFactorsBreakdown(userProfile, scholarship, application);

      return {
        overall_success_probability: prediction.overallProbability,
        confidence_level: prediction.confidenceLevel,
        success_factors: successFactors,
        competitive_analysis: competitiveAnalysis,
        improvement_recommendations: recommendations,
        detailed_breakdown: prediction.detailedBreakdown,
        scholarship_info: {
          id: scholarship.id,
          title: scholarship.title,
          provider_name: scholarship.provider_name,
          country: scholarship.country,
          amount: scholarship.amount,
          currency: scholarship.currency,
          application_deadline: scholarship.application_deadline
        },
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting success prediction:', error);
      throw new Error('Failed to get success prediction');
    }
  }

  // Calculate detailed success prediction
  async calculateDetailedPrediction(userProfile, scholarship, applicationData) {
    const factors = {};

    // 1. Academic Performance Analysis
    factors.academic_performance = await this.analyzeAcademicPerformance(userProfile, scholarship);

    // 2. Field of Study Match
    factors.field_match = await this.analyzeFieldMatch(userProfile, scholarship);

    // 3. Nationality Eligibility
    factors.nationality_eligibility = await this.analyzeNationalityEligibility(userProfile, scholarship);

    // 4. Age Requirements
    factors.age_requirement = await this.analyzeAgeRequirements(userProfile, scholarship);

    // 5. Language Proficiency
    factors.language_proficiency = await this.analyzeLanguageProficiency(userProfile, scholarship);

    // 6. Financial Need Assessment
    factors.financial_need = await this.analyzeFinancialNeed(userProfile, scholarship, applicationData);

    // 7. Extracurricular Activities
    factors.extracurricular_activities = await this.analyzeExtracurricularActivities(userProfile, scholarship);

    // 8. Essay Quality (if provided)
    factors.essay_quality = await this.analyzeEssayQuality(applicationData);

    // Calculate weighted overall probability
    let overallScore = 0;
    let totalWeight = 0;

    for (const [factor, data] of Object.entries(factors)) {
      const weight = this.criteriaWeights[factor] || 0;
      overallScore += data.score * weight;
      totalWeight += weight;
    }

    const overallProbability = totalWeight > 0 ? overallScore / totalWeight : 0;

    // Calculate confidence level
    const confidenceLevel = this.calculateConfidenceLevel(factors);

    return {
      overallProbability: Math.round(overallProbability * 100) / 100,
      confidenceLevel,
      detailedBreakdown: factors
    };
  }

  // Analyze academic performance
  async analyzeAcademicPerformance(userProfile, scholarship) {
    const education = userProfile.education || {};
    const userGPA = parseFloat(education.gpa) || 0;
    const requiredGPA = parseFloat(scholarship.gpa_requirement) || 0;

    let score = 0;
    let details = [];

    if (requiredGPA === 0) {
      score = 0.8; // No GPA requirement - neutral score
      details.push('No GPA requirement specified');
    } else if (userGPA >= requiredGPA) {
      const excess = userGPA - requiredGPA;
      score = Math.min(1.0, 0.7 + (excess * 0.3));
      details.push(`GPA ${userGPA} exceeds requirement ${requiredGPA}`);
      
      if (excess > 0.5) {
        details.push('Significantly above requirement - strong advantage');
        score = Math.min(1.0, score + 0.1);
      }
    } else {
      const deficit = requiredGPA - userGPA;
      score = Math.max(0.1, 0.5 - (deficit * 0.4));
      details.push(`GPA ${userGPA} below requirement ${requiredGPA}`);
      
      if (deficit > 0.5) {
        details.push('Significantly below requirement - major disadvantage');
        score = Math.max(0.1, score - 0.2);
      }
    }

    // Check for academic honors/awards
    const honors = education.honors || [];
    const awards = education.awards || [];
    
    if (honors.length > 0 || awards.length > 0) {
      score = Math.min(1.0, score + 0.1);
      details.push(`Has ${honors.length + awards.length} academic honors/awards`);
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      user_gpa: userGPA,
      required_gpa: requiredGPA,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Analyze field of study match
  async analyzeFieldMatch(userProfile, scholarship) {
    const education = userProfile.education || {};
    const userField = education.field_of_study || '';
    const scholarshipFields = scholarship.field_of_study || [];

    let score = 0;
    let details = [];

    if (scholarshipFields.length === 0 || scholarshipFields.includes('any')) {
      score = 0.8;
      details.push('Open to all fields of study');
    } else {
      const fieldMatch = scholarshipFields.some(field => 
        userField.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(userField.toLowerCase())
      );

      if (fieldMatch) {
        score = 1.0;
        details.push(`Perfect field match: ${userField}`);
      } else {
        // Check for related fields
        const relatedFields = this.getRelatedFields(userField);
        const hasRelatedMatch = scholarshipFields.some(field => 
          relatedFields.some(related => 
            field.toLowerCase().includes(related.toLowerCase()) ||
            related.toLowerCase().includes(field.toLowerCase())
          )
        );

        if (hasRelatedMatch) {
          score = 0.6;
          details.push(`Related field match: ${userField}`);
        } else {
          score = 0.2;
          details.push(`Field mismatch: ${userField} vs ${scholarshipFields.join(', ')}`);
        }
      }
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      user_field: userField,
      scholarship_fields: scholarshipFields,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Analyze nationality eligibility
  async analyzeNationalityEligibility(userProfile, scholarship) {
    const userNationality = userProfile.nationality || '';
    const restrictions = scholarship.nationality_restrictions || [];

    let score = 0;
    let details = [];

    if (restrictions.length === 0) {
      score = 1.0;
      details.push('No nationality restrictions');
    } else if (restrictions.includes(userNationality)) {
      score = 1.0;
      details.push(`Nationality ${userNationality} is eligible`);
    } else {
      score = 0;
      details.push(`Nationality ${userNationality} not allowed`);
      details.push(`Eligible nationalities: ${restrictions.join(', ')}`);
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      user_nationality: userNationality,
      restrictions: restrictions,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Analyze age requirements
  async analyzeAgeRequirements(userProfile, scholarship) {
    const userAge = this.calculateAge(userProfile.date_of_birth);
    const minAge = scholarship.age_limit_min || 0;
    const maxAge = scholarship.age_limit_max || 100;

    let score = 0;
    let details = [];

    if (minAge === 0 && maxAge === 100) {
      score = 1.0;
      details.push('No age restrictions');
    } else if (userAge >= minAge && userAge <= maxAge) {
      score = 1.0;
      details.push(`Age ${userAge} within range ${minAge}-${maxAge}`);
    } else {
      score = 0;
      details.push(`Age ${userAge} outside range ${minAge}-${maxAge}`);
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      user_age: userAge,
      min_age: minAge,
      max_age: maxAge,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Analyze language proficiency
  async analyzeLanguageProficiency(userProfile, scholarship) {
    const userSkills = userProfile.skills || [];
    const languageRequirements = scholarship.language_requirements || {};

    let score = 0;
    let details = [];

    if (Object.keys(languageRequirements).length === 0) {
      score = 1.0;
      details.push('No language requirements');
    } else {
      let matchedLanguages = 0;
      const totalLanguages = Object.keys(languageRequirements).length;

      for (const [language, level] of Object.entries(languageRequirements)) {
        const userLanguageSkill = userSkills.find(skill => 
          skill.toLowerCase().includes(language.toLowerCase())
        );

        if (userLanguageSkill) {
          matchedLanguages++;
          details.push(`Has ${language} proficiency`);
        } else {
          details.push(`Missing ${language} proficiency (required: ${level})`);
        }
      }

      score = matchedLanguages / totalLanguages;
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      user_skills: userSkills,
      requirements: languageRequirements,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Analyze financial need
  async analyzeFinancialNeed(userProfile, scholarship, applicationData) {
    let score = 0.5; // Default neutral score
    let details = [];

    if (scholarship.is_need_based) {
      // Check if user has provided financial information
      const financialInfo = applicationData?.financial_need || {};
      
      if (financialInfo.family_income && financialInfo.family_income !== 'Not specified') {
        score = 0.8;
        details.push('Financial need documentation provided');
      } else {
        score = 0.3;
        details.push('Financial need documentation missing');
        details.push('Required for need-based scholarship');
      }
    } else {
      score = 0.8;
      details.push('Not a need-based scholarship');
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      is_need_based: scholarship.is_need_based,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Analyze extracurricular activities
  async analyzeExtracurricularActivities(userProfile, scholarship) {
    const workExperience = userProfile.work_experience || {};
    const skills = userProfile.skills || [];
    
    let score = 0.5; // Default neutral score
    let details = [];

    const totalActivities = skills.length + (workExperience.experiences?.length || 0);
    
    if (totalActivities > 5) {
      score = 0.9;
      details.push('Strong extracurricular profile');
    } else if (totalActivities > 2) {
      score = 0.7;
      details.push('Good extracurricular activities');
    } else if (totalActivities > 0) {
      score = 0.5;
      details.push('Some extracurricular activities');
    } else {
      score = 0.3;
      details.push('Limited extracurricular activities');
    }

    // Check for leadership roles
    const hasLeadership = skills.some(skill => 
      skill.toLowerCase().includes('leadership') || 
      skill.toLowerCase().includes('manager') ||
      skill.toLowerCase().includes('president')
    );

    if (hasLeadership) {
      score = Math.min(1.0, score + 0.1);
      details.push('Has leadership experience');
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      total_activities: totalActivities,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Analyze essay quality
  async analyzeEssayQuality(applicationData) {
    let score = 0.5; // Default neutral score
    let details = [];

    const motivationStatement = applicationData?.motivation_statement || '';
    const careerGoals = applicationData?.career_goals || '';

    if (motivationStatement.length > 200 && careerGoals.length > 100) {
      score = 0.8;
      details.push('Comprehensive motivation statement and career goals');
    } else if (motivationStatement.length > 100 || careerGoals.length > 50) {
      score = 0.6;
      details.push('Basic motivation statement provided');
    } else {
      score = 0.3;
      details.push('Limited essay content provided');
    }

    return {
      score: Math.round(score * 100) / 100,
      details,
      motivation_length: motivationStatement.length,
      career_goals_length: careerGoals.length,
      status: score >= 0.8 ? 'excellent' : score >= 0.6 ? 'good' : score >= 0.4 ? 'fair' : 'poor'
    };
  }

  // Get competitive analysis
  async getCompetitiveAnalysis(scholarship) {
    try {
      const query = `
        SELECT 
          COUNT(sa.id) as total_applications,
          COUNT(DISTINCT sa.user_id) as unique_applicants,
          COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) as successful_applications,
          AVG(s.amount) as avg_amount,
          s.max_applications
        FROM scholarships s
        LEFT JOIN scholarship_applications sa ON s.id = sa.scholarship_id
        WHERE s.id = ?
        GROUP BY s.id
      `;

      const result = await executeQuery(query, [scholarship.id]);
      const data = result[0] || {};

      const totalApplications = data.total_applications || 0;
      const maxApplications = scholarship.max_applications || 1000;
      const successRate = totalApplications > 0 ? (data.successful_applications / totalApplications) * 100 : 0;

      let competitiveness = 'low';
      let competitivenessScore = 0.8;

      if (totalApplications > maxApplications * 0.8) {
        competitiveness = 'very high';
        competitivenessScore = 0.2;
      } else if (totalApplications > maxApplications * 0.6) {
        competitiveness = 'high';
        competitivenessScore = 0.4;
      } else if (totalApplications > maxApplications * 0.4) {
        competitiveness = 'medium';
        competitivenessScore = 0.6;
      }

      return {
        total_applications: totalApplications,
        unique_applicants: data.unique_applicants || 0,
        successful_applications: data.successful_applications || 0,
        success_rate: Math.round(successRate * 100) / 100,
        competitiveness_level: competitiveness,
        competitiveness_score: competitivenessScore,
        max_applications: maxApplications,
        application_capacity_used: Math.round((totalApplications / maxApplications) * 100)
      };
    } catch (error) {
      console.error('Error getting competitive analysis:', error);
      return {
        total_applications: 0,
        unique_applicants: 0,
        successful_applications: 0,
        success_rate: 0,
        competitiveness_level: 'unknown',
        competitiveness_score: 0.5,
        max_applications: 1000,
        application_capacity_used: 0
      };
    }
  }

  // Get improvement recommendations
  async getImprovementRecommendations(userProfile, scholarship, prediction) {
    const recommendations = [];

    // Academic performance recommendations
    if (prediction.detailedBreakdown.academic_performance.score < 0.6) {
      recommendations.push({
        category: 'Academic Performance',
        priority: 'high',
        recommendation: 'Improve your GPA or highlight other academic achievements',
        impact: 'High impact on success probability',
        action_items: [
          'Focus on improving grades in current studies',
          'Highlight any academic honors or awards',
          'Consider retaking courses with low grades'
        ]
      });
    }

    // Field match recommendations
    if (prediction.detailedBreakdown.field_match.score < 0.6) {
      recommendations.push({
        category: 'Field of Study',
        priority: 'high',
        recommendation: 'Consider applying to scholarships in your field of study',
        impact: 'High impact on success probability',
        action_items: [
          'Search for scholarships in your specific field',
          'Consider related fields that might be acceptable',
          'Highlight relevant coursework and projects'
        ]
      });
    }

    // Language requirements recommendations
    if (prediction.detailedBreakdown.language_proficiency.score < 0.6) {
      recommendations.push({
        category: 'Language Proficiency',
        priority: 'medium',
        recommendation: 'Improve language skills or take proficiency tests',
        impact: 'Medium impact on success probability',
        action_items: [
          'Take language proficiency tests (IELTS, TOEFL, etc.)',
          'Enroll in language courses',
          'Practice with native speakers'
        ]
      });
    }

    // Extracurricular activities recommendations
    if (prediction.detailedBreakdown.extracurricular_activities.score < 0.6) {
      recommendations.push({
        category: 'Extracurricular Activities',
        priority: 'medium',
        recommendation: 'Get involved in more extracurricular activities',
        impact: 'Medium impact on success probability',
        action_items: [
          'Join student organizations',
          'Volunteer in your community',
          'Take on leadership roles',
          'Participate in competitions or events'
        ]
      });
    }

    // Essay quality recommendations
    if (prediction.detailedBreakdown.essay_quality.score < 0.6) {
      recommendations.push({
        category: 'Application Essays',
        priority: 'medium',
        recommendation: 'Improve your motivation statement and career goals',
        impact: 'Medium impact on success probability',
        action_items: [
          'Write a compelling motivation statement (200+ words)',
          'Clearly articulate your career goals',
          'Get feedback from mentors or advisors',
          'Use specific examples and personal experiences'
        ]
      });
    }

    // Financial need recommendations
    if (scholarship.is_need_based && prediction.detailedBreakdown.financial_need.score < 0.6) {
      recommendations.push({
        category: 'Financial Documentation',
        priority: 'high',
        recommendation: 'Provide comprehensive financial need documentation',
        impact: 'High impact on success probability',
        action_items: [
          'Gather bank statements and income certificates',
          'Prepare tax returns and financial statements',
          'Write a detailed financial need statement',
          'Get official documentation of family income'
        ]
      });
    }

    return recommendations;
  }

  // Get success factors breakdown
  async getSuccessFactorsBreakdown(userProfile, scholarship, applicationData) {
    return {
      academic_performance: {
        weight: this.criteriaWeights.academic_performance,
        importance: 'Very High',
        description: 'Your academic achievements and GPA compared to requirements'
      },
      field_match: {
        weight: this.criteriaWeights.field_match,
        importance: 'High',
        description: 'How well your field of study matches the scholarship focus'
      },
      nationality_eligibility: {
        weight: this.criteriaWeights.nationality_eligibility,
        importance: 'Critical',
        description: 'Whether your nationality is eligible for this scholarship'
      },
      age_requirement: {
        weight: this.criteriaWeights.age_requirement,
        importance: 'Critical',
        description: 'Whether your age meets the scholarship requirements'
      },
      language_proficiency: {
        weight: this.criteriaWeights.language_proficiency,
        importance: 'Medium',
        description: 'Your language skills compared to scholarship requirements'
      },
      financial_need: {
        weight: this.criteriaWeights.financial_need,
        importance: scholarship.is_need_based ? 'High' : 'Low',
        description: 'Your financial need documentation and situation'
      },
      extracurricular_activities: {
        weight: this.criteriaWeights.extracurricular_activities,
        importance: 'Medium',
        description: 'Your involvement in activities outside academics'
      },
      essay_quality: {
        weight: this.criteriaWeights.essay_quality,
        importance: 'Medium',
        description: 'Quality of your motivation statement and career goals'
      }
    };
  }

  // Calculate confidence level
  calculateConfidenceLevel(factors) {
    const scores = Object.values(factors).map(factor => factor.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    
    if (variance < 0.1) {
      return 'high';
    } else if (variance < 0.2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Get related fields
  getRelatedFields(field) {
    const fieldRelations = {
      'computer science': ['software engineering', 'information technology', 'data science', 'cybersecurity'],
      'engineering': ['mechanical engineering', 'electrical engineering', 'civil engineering', 'chemical engineering'],
      'business': ['management', 'marketing', 'finance', 'economics'],
      'medicine': ['health sciences', 'nursing', 'pharmacy', 'public health'],
      'law': ['legal studies', 'criminology', 'political science'],
      'education': ['teaching', 'pedagogy', 'educational psychology'],
      'arts': ['fine arts', 'design', 'music', 'theater'],
      'science': ['biology', 'chemistry', 'physics', 'mathematics']
    };

    const lowerField = field.toLowerCase();
    for (const [mainField, related] of Object.entries(fieldRelations)) {
      if (lowerField.includes(mainField)) {
        return related;
      }
    }

    return [];
  }

  // Calculate age from date of birth
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const query = `
        SELECT u.*, 
               GROUP_CONCAT(DISTINCT sa.scholarship_id) as applied_scholarships
        FROM users u
        LEFT JOIN scholarship_applications sa ON u.id = sa.user_id AND sa.status != 'withdrawn'
        WHERE u.id = ?
        GROUP BY u.id
      `;

      const results = await executeQuery(query, [userId]);
      
      if (results.length === 0) {
        return null;
      }

      const user = results[0];
      return {
        ...user,
        education: JSON.parse(user.education || '{}'),
        work_experience: JSON.parse(user.work_experience || '{}'),
        skills: JSON.parse(user.skills || '[]'),
        applied_scholarships: user.applied_scholarships ? user.applied_scholarships.split(',') : []
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }
}

module.exports = new ScholarshipSuccessPredictorService();
