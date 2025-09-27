const { executeQuery } = require('../config/database');
const scholarshipService = require('./scholarship.service');
const scholarshipApplicationService = require('./scholarship-application.service');

class OneClickApplyService {
  constructor() {
    this.userProfileCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // One-click apply to multiple scholarships
  async oneClickApply(userId, scholarshipIds, options = {}) {
    try {
      const results = [];
      const errors = [];

      // Get user profile with caching
      const userProfile = await this.getUserProfile(userId);

      for (const scholarshipId of scholarshipIds) {
        try {
          const result = await this.applyToScholarship(userId, scholarshipId, userProfile, options);
          results.push(result);
        } catch (error) {
          errors.push({
            scholarshipId,
            error: error.message
          });
        }
      }

      return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
        message: `Successfully applied to ${results.length} scholarships`
      };
    } catch (error) {
      console.error('Error in one-click apply:', error);
      throw new Error('Failed to process one-click applications');
    }
  }

  // Apply to a single scholarship with auto-fill
  async applyToScholarship(userId, scholarshipId, userProfile, options = {}) {
    try {
      // Get scholarship details
      const scholarship = await scholarshipService.getScholarshipById(scholarshipId);
      if (!scholarship) {
        throw new Error('Scholarship not found');
      }

      // Check eligibility
      const eligibility = await this.checkEligibility(userProfile, scholarship);
      if (!eligibility.eligible) {
        throw new Error(`Not eligible: ${eligibility.reason}`);
      }

      // Auto-fill application data
      const applicationData = await this.autoFillApplication(userProfile, scholarship, options);
      
      // Create application
      const applicationId = await scholarshipApplicationService.createApplication({
        scholarship_id: scholarshipId,
        application_data: applicationData,
        documents: await this.getRequiredDocuments(userId, scholarship),
        status: options.submitImmediately ? 'submitted' : 'draft'
      }, userId);

      return {
        applicationId,
        scholarshipId,
        scholarshipTitle: scholarship.title,
        status: options.submitImmediately ? 'submitted' : 'draft',
        autoFilledFields: Object.keys(applicationData).length
      };
    } catch (error) {
      console.error('Error applying to scholarship:', error);
      throw error;
    }
  }

  // Auto-fill application data from user profile
  async autoFillApplication(userProfile, scholarship, options = {}) {
    const applicationData = {
      personal_info: {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        email: userProfile.email,
        phone: userProfile.phone,
        date_of_birth: userProfile.date_of_birth,
        nationality: userProfile.nationality,
        gender: userProfile.gender
      },
      education: userProfile.education || {},
      work_experience: userProfile.work_experience || {},
      skills: userProfile.skills || [],
      address: userProfile.address || {},
      motivation_statement: options.customMotivation || await this.generateMotivationStatement(userProfile, scholarship),
      career_goals: options.customCareerGoals || await this.generateCareerGoals(userProfile, scholarship),
      financial_need: options.financialNeed || await this.assessFinancialNeed(userProfile),
      additional_info: options.additionalInfo || {}
    };

    // Add scholarship-specific fields
    if (scholarship.is_merit_based) {
      applicationData.academic_achievements = await this.getAcademicAchievements(userProfile);
    }

    if (scholarship.is_need_based) {
      applicationData.financial_documents = await this.getFinancialDocuments(userProfile);
    }

    if (scholarship.is_athletic) {
      applicationData.athletic_achievements = await this.getAthleticAchievements(userProfile);
    }

    if (scholarship.is_artistic) {
      applicationData.artistic_portfolio = await this.getArtisticPortfolio(userProfile);
    }

    return applicationData;
  }

  // Generate personalized motivation statement
  async generateMotivationStatement(userProfile, scholarship) {
    const education = userProfile.education || {};
    const field = education.field_of_study || 'your field of study';
    const country = scholarship.country;
    const university = scholarship.university || 'the institution';

    return `I am writing to express my strong interest in the ${scholarship.title} at ${university} in ${country}. 

As a dedicated student in ${field}, I am committed to pursuing academic excellence and contributing meaningfully to my field. This scholarship would provide me with the financial support necessary to focus entirely on my studies and research.

My academic background in ${field} has prepared me well for this opportunity, and I am excited about the prospect of studying in ${country}, which would expose me to new perspectives and methodologies in my field.

I am confident that with this scholarship, I will be able to achieve my academic goals and contribute to the university community while representing the values and mission of ${scholarship.provider_name}.`;
  }

  // Generate career goals
  async generateCareerGoals(userProfile, scholarship) {
    const education = userProfile.education || {};
    const field = education.field_of_study || 'my field';
    const degreeLevel = scholarship.degree_level;

    const goals = {
      'undergraduate': `Upon completion of my undergraduate studies in ${field}, I plan to pursue graduate education and eventually contribute to research and development in this field.`,
      'graduate': `After completing my graduate studies, I aim to work in industry/research where I can apply my advanced knowledge in ${field} to solve real-world problems.`,
      'phd': `My long-term goal is to become a leading researcher in ${field}, contributing to scientific knowledge and mentoring the next generation of scholars.`
    };

    return goals[degreeLevel] || `I am committed to advancing my career in ${field} and making meaningful contributions to the field.`;
  }

  // Assess financial need
  async assessFinancialNeed(userProfile) {
    // This would integrate with financial assessment tools
    return {
      family_income: 'Not specified',
      financial_difficulties: 'Seeking financial assistance to pursue higher education',
      other_funding_sources: 'Limited',
      estimated_expenses: 'Tuition, living expenses, books, and materials'
    };
  }

  // Get academic achievements
  async getAcademicAchievements(userProfile) {
    const education = userProfile.education || {};
    return {
      gpa: education.gpa || 'Not specified',
      honors: education.honors || [],
      awards: education.awards || [],
      publications: education.publications || [],
      research_experience: education.research_experience || []
    };
  }

  // Get financial documents
  async getFinancialDocuments(userProfile) {
    return {
      bank_statements: 'Required - to be uploaded',
      income_certificates: 'Required - to be uploaded',
      tax_returns: 'Required - to be uploaded',
      sponsorship_letters: 'If applicable'
    };
  }

  // Get athletic achievements
  async getAthleticAchievements(userProfile) {
    return {
      sports: userProfile.sports || [],
      achievements: userProfile.athletic_achievements || [],
      level: userProfile.athletic_level || 'Not specified',
      certifications: userProfile.athletic_certifications || []
    };
  }

  // Get artistic portfolio
  async getArtisticPortfolio(userProfile) {
    return {
      art_forms: userProfile.art_forms || [],
      portfolio_urls: userProfile.portfolio_urls || [],
      exhibitions: userProfile.exhibitions || [],
      awards: userProfile.artistic_awards || []
    };
  }

  // Get required documents for user
  async getRequiredDocuments(userId, scholarship) {
    const requiredDocs = scholarship.required_documents || [];
    const userDocs = await this.getUserDocuments(userId);
    
    const documents = {};
    requiredDocs.forEach(doc => {
      documents[doc] = userDocs[doc] || 'To be uploaded';
    });

    return documents;
  }

  // Get user's uploaded documents
  async getUserDocuments(userId) {
    try {
      const query = `
        SELECT document_type, file_url, uploaded_at
        FROM user_documents
        WHERE user_id = ? AND status = 'verified'
      `;
      
      const documents = await executeQuery(query, [userId]);
      const docMap = {};
      
      documents.forEach(doc => {
        docMap[doc.document_type] = doc.file_url;
      });

      return docMap;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      return {};
    }
  }

  // Check eligibility for scholarship
  async checkEligibility(userProfile, scholarship) {
    const reasons = [];

    // Check nationality restrictions
    if (scholarship.nationality_restrictions && scholarship.nationality_restrictions.length > 0) {
      if (!scholarship.nationality_restrictions.includes(userProfile.nationality)) {
        return { eligible: false, reason: 'Nationality not allowed' };
      }
    }

    // Check age requirements
    const userAge = this.calculateAge(userProfile.date_of_birth);
    if (scholarship.age_limit_min && userAge < scholarship.age_limit_min) {
      return { eligible: false, reason: 'Below minimum age requirement' };
    }
    if (scholarship.age_limit_max && userAge > scholarship.age_limit_max) {
      return { eligible: false, reason: 'Above maximum age requirement' };
    }

    // Check GPA requirements
    const userGPA = parseFloat(userProfile.education?.gpa) || 0;
    if (scholarship.gpa_requirement && userGPA < scholarship.gpa_requirement) {
      return { eligible: false, reason: 'GPA below requirement' };
    }

    // Check if already applied
    const existingApplication = await scholarshipApplicationService.getUserApplication(scholarship.id, userProfile.id);
    if (existingApplication) {
      return { eligible: false, reason: 'Already applied for this scholarship' };
    }

    return { eligible: true, reason: 'Eligible' };
  }

  // Get user profile with caching
  async getUserProfile(userId) {
    const cacheKey = `profile_${userId}`;
    const cached = this.userProfileCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

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
      throw new Error('User profile not found');
    }

    const user = results[0];
    const profile = {
      ...user,
      education: JSON.parse(user.education || '{}'),
      work_experience: JSON.parse(user.work_experience || '{}'),
      skills: JSON.parse(user.skills || '[]'),
      applied_scholarships: user.applied_scholarships ? user.applied_scholarships.split(',') : []
    };

    // Cache the profile
    this.userProfileCache.set(cacheKey, {
      data: profile,
      timestamp: Date.now()
    });

    return profile;
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

  // Bulk apply to recommended scholarships
  async bulkApplyToRecommendations(userId, limit = 5) {
    try {
      const scholarshipMatchingService = require('./scholarship-matching.service');
      
      // Get personalized recommendations
      const recommendations = await scholarshipMatchingService.getPersonalizedRecommendations(userId, limit);
      
      // Filter eligible recommendations
      const eligibleScholarships = recommendations
        .filter(rec => rec.eligibility_status === 'eligible')
        .map(rec => rec.id);

      if (eligibleScholarships.length === 0) {
        return {
          success: 0,
          failed: 0,
          results: [],
          errors: [{ error: 'No eligible scholarships found' }],
          message: 'No eligible scholarships available for bulk application'
        };
      }

      // Apply to all eligible scholarships
      return await this.oneClickApply(userId, eligibleScholarships, {
        submitImmediately: false // Start as drafts
      });
    } catch (error) {
      console.error('Error in bulk apply:', error);
      throw new Error('Failed to process bulk applications');
    }
  }
}

module.exports = new OneClickApplyService();
