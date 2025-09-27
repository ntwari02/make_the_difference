const scholarshipService = require('./scholarship.service');
const { executeQuery } = require('../config/database');

class ScholarshipMatchingService {
  constructor() {
    this.matchWeights = {
      field_of_study: 0.25,
      degree_level: 0.20,
      country: 0.15,
      nationality: 0.10,
      gpa: 0.15,
      age: 0.10,
      language_requirements: 0.05
    };
  }

  // Get personalized scholarship recommendations for a user
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      // Get user profile
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get all active scholarships
      const scholarships = await scholarshipService.getScholarships({
        limit: 1000 // Get more scholarships for better matching
      });

      // Calculate match scores for each scholarship
      const scoredScholarships = scholarships.map(scholarship => {
        const matchScore = this.calculateMatchScore(userProfile, scholarship);
        return {
          ...scholarship,
          match_score: matchScore.score,
          match_reasons: matchScore.reasons,
          eligibility_status: matchScore.eligibility
        };
      });

      // Filter eligible scholarships and sort by match score
      const eligibleScholarships = scoredScholarships
        .filter(s => s.eligibility_status === 'eligible')
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit);

      return eligibleScholarships;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw new Error('Failed to get personalized recommendations');
    }
  }

  // Get user profile for matching
  async getUserProfile(userId) {
    try {
      const query = `
        SELECT 
          u.*,
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

  // Calculate match score between user profile and scholarship
  calculateMatchScore(userProfile, scholarship) {
    let totalScore = 0;
    const reasons = [];
    let eligibility = 'eligible';

    // Field of study matching
    const fieldScore = this.matchFieldOfStudy(userProfile, scholarship);
    totalScore += fieldScore.score * this.matchWeights.field_of_study;
    if (fieldScore.score > 0.7) {
      reasons.push(`Strong match in field of study: ${fieldScore.reason}`);
    }

    // Degree level matching
    const degreeScore = this.matchDegreeLevel(userProfile, scholarship);
    totalScore += degreeScore.score * this.matchWeights.degree_level;
    if (degreeScore.score > 0.7) {
      reasons.push(`Perfect degree level match: ${degreeScore.reason}`);
    }

    // Country preference
    const countryScore = this.matchCountry(userProfile, scholarship);
    totalScore += countryScore.score * this.matchWeights.country;
    if (countryScore.score > 0.7) {
      reasons.push(`Target country: ${countryScore.reason}`);
    }

    // Nationality restrictions
    const nationalityCheck = this.checkNationalityRestrictions(userProfile, scholarship);
    if (!nationalityCheck.eligible) {
      eligibility = 'ineligible';
      reasons.push(`Nationality restriction: ${nationalityCheck.reason}`);
    } else {
      totalScore += nationalityCheck.score * this.matchWeights.nationality;
    }

    // GPA requirements
    const gpaScore = this.matchGPARequirements(userProfile, scholarship);
    if (!gpaScore.eligible) {
      eligibility = 'ineligible';
      reasons.push(`GPA requirement not met: ${gpaScore.reason}`);
    } else {
      totalScore += gpaScore.score * this.matchWeights.gpa;
      if (gpaScore.score > 0.7) {
        reasons.push(`GPA exceeds requirements: ${gpaScore.reason}`);
      }
    }

    // Age requirements
    const ageScore = this.matchAgeRequirements(userProfile, scholarship);
    if (!ageScore.eligible) {
      eligibility = 'ineligible';
      reasons.push(`Age requirement not met: ${ageScore.reason}`);
    } else {
      totalScore += ageScore.score * this.matchWeights.age;
    }

    // Language requirements
    const languageScore = this.matchLanguageRequirements(userProfile, scholarship);
    totalScore += languageScore.score * this.matchWeights.language_requirements;
    if (languageScore.score > 0.7) {
      reasons.push(`Language requirements met: ${languageScore.reason}`);
    }

    // Check if user already applied
    if (userProfile.applied_scholarships.includes(scholarship.id)) {
      eligibility = 'already_applied';
      reasons.push('Already applied for this scholarship');
    }

    return {
      score: Math.round(totalScore * 100) / 100,
      reasons: reasons.slice(0, 3), // Top 3 reasons
      eligibility: eligibility
    };
  }

  // Match field of study
  matchFieldOfStudy(userProfile, scholarship) {
    const userEducation = userProfile.education || {};
    const userField = userEducation.field_of_study || '';
    const scholarshipFields = scholarship.field_of_study || [];

    if (scholarshipFields.length === 0 || scholarshipFields.includes('any')) {
      return { score: 0.8, reason: 'Open to all fields' };
    }

    const fieldMatch = scholarshipFields.some(field => 
      userField.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(userField.toLowerCase())
    );

    if (fieldMatch) {
      return { score: 1.0, reason: `Perfect field match: ${userField}` };
    }

    return { score: 0.3, reason: 'Field mismatch' };
  }

  // Match degree level
  matchDegreeLevel(userProfile, scholarship) {
    const userEducation = userProfile.education || {};
    const userDegreeLevel = userEducation.degree_level || '';
    const scholarshipDegreeLevel = scholarship.degree_level;

    if (scholarshipDegreeLevel === 'any') {
      return { score: 1.0, reason: 'Open to all degree levels' };
    }

    if (userDegreeLevel === scholarshipDegreeLevel) {
      return { score: 1.0, reason: `Perfect degree level match: ${userDegreeLevel}` };
    }

    // Check for progression (undergraduate -> graduate -> phd)
    const degreeLevels = ['diploma', 'certificate', 'undergraduate', 'graduate', 'phd'];
    const userIndex = degreeLevels.indexOf(userDegreeLevel);
    const scholarshipIndex = degreeLevels.indexOf(scholarshipDegreeLevel);

    if (userIndex >= scholarshipIndex) {
      return { score: 0.7, reason: `Qualified degree level: ${userDegreeLevel}` };
    }

    return { score: 0.2, reason: 'Degree level mismatch' };
  }

  // Match country preference
  matchCountry(userProfile, scholarship) {
    const userPreferences = userProfile.preferences || {};
    const preferredCountries = userPreferences.preferred_countries || [];
    const scholarshipCountry = scholarship.country;

    if (preferredCountries.length === 0) {
      return { score: 0.5, reason: 'No country preference' };
    }

    if (preferredCountries.includes(scholarshipCountry)) {
      return { score: 1.0, reason: `Preferred country: ${scholarshipCountry}` };
    }

    return { score: 0.3, reason: 'Country not in preferences' };
  }

  // Check nationality restrictions
  checkNationalityRestrictions(userProfile, scholarship) {
    const userNationality = userProfile.nationality || '';
    const restrictions = scholarship.nationality_restrictions || [];

    if (restrictions.length === 0) {
      return { score: 1.0, eligible: true, reason: 'No nationality restrictions' };
    }

    if (restrictions.includes(userNationality)) {
      return { score: 1.0, eligible: true, reason: 'Nationality allowed' };
    }

    return { 
      score: 0, 
      eligible: false, 
      reason: `Nationality ${userNationality} not allowed` 
    };
  }

  // Match GPA requirements
  matchGPARequirements(userProfile, scholarship) {
    const userEducation = userProfile.education || {};
    const userGPA = parseFloat(userEducation.gpa) || 0;
    const requiredGPA = parseFloat(scholarship.gpa_requirement) || 0;

    if (requiredGPA === 0) {
      return { score: 1.0, eligible: true, reason: 'No GPA requirement' };
    }

    if (userGPA >= requiredGPA) {
      const score = Math.min(1.0, userGPA / requiredGPA);
      return { 
        score, 
        eligible: true, 
        reason: `GPA ${userGPA} exceeds requirement ${requiredGPA}` 
      };
    }

    return { 
      score: 0, 
      eligible: false, 
      reason: `GPA ${userGPA} below requirement ${requiredGPA}` 
    };
  }

  // Match age requirements
  matchAgeRequirements(userProfile, scholarship) {
    const userAge = this.calculateAge(userProfile.date_of_birth);
    const minAge = scholarship.age_limit_min || 0;
    const maxAge = scholarship.age_limit_max || 100;

    if (minAge === 0 && maxAge === 100) {
      return { score: 1.0, eligible: true, reason: 'No age restrictions' };
    }

    if (userAge >= minAge && userAge <= maxAge) {
      return { 
        score: 1.0, 
        eligible: true, 
        reason: `Age ${userAge} within range ${minAge}-${maxAge}` 
      };
    }

    return { 
      score: 0, 
      eligible: false, 
      reason: `Age ${userAge} outside range ${minAge}-${maxAge}` 
    };
  }

  // Match language requirements
  matchLanguageRequirements(userProfile, scholarship) {
    const userSkills = userProfile.skills || [];
    const languageRequirements = scholarship.language_requirements || {};

    if (Object.keys(languageRequirements).length === 0) {
      return { score: 1.0, reason: 'No language requirements' };
    }

    let matchedLanguages = 0;
    const totalLanguages = Object.keys(languageRequirements).length;

    for (const [language, level] of Object.entries(languageRequirements)) {
      const userLanguageSkill = userSkills.find(skill => 
        skill.toLowerCase().includes(language.toLowerCase())
      );

      if (userLanguageSkill) {
        matchedLanguages++;
      }
    }

    const score = matchedLanguages / totalLanguages;
    return { 
      score, 
      reason: `Language requirements: ${matchedLanguages}/${totalLanguages} met` 
    };
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

  // Get scholarship success prediction
  async getSuccessPrediction(userId, scholarshipId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const scholarship = await scholarshipService.getScholarshipById(scholarshipId);

      if (!userProfile || !scholarship) {
        throw new Error('User profile or scholarship not found');
      }

      const matchScore = this.calculateMatchScore(userProfile, scholarship);
      
      // Calculate success probability based on various factors
      let successProbability = matchScore.score;

      // Adjust based on scholarship competitiveness
      const applicationCount = scholarship.application_count || 0;
      const maxApplications = scholarship.max_applications || 1000;
      const competitiveness = Math.min(1.0, applicationCount / maxApplications);
      
      // More competitive scholarships have lower success rates
      successProbability *= (1 - competitiveness * 0.3);

      // Adjust based on scholarship type
      if (scholarship.is_merit_based) {
        successProbability *= 0.8; // Merit-based are more competitive
      }
      if (scholarship.is_need_based) {
        successProbability *= 0.9; // Need-based have different criteria
      }

      // Adjust based on provider type
      const providerTypeMultipliers = {
        'university': 0.7,
        'government': 0.6,
        'private_organization': 0.8,
        'foundation': 0.9,
        'corporation': 0.85
      };
      
      successProbability *= providerTypeMultipliers[scholarship.provider_type] || 0.8;

      return {
        success_probability: Math.round(successProbability * 100) / 100,
        match_score: matchScore.score,
        competitiveness_level: competitiveness > 0.7 ? 'high' : competitiveness > 0.4 ? 'medium' : 'low',
        recommendations: this.getSuccessRecommendations(matchScore, scholarship)
      };
    } catch (error) {
      console.error('Error getting success prediction:', error);
      throw new Error('Failed to get success prediction');
    }
  }

  // Get recommendations to improve success chances
  getSuccessRecommendations(matchScore, scholarship) {
    const recommendations = [];

    if (matchScore.score < 0.7) {
      recommendations.push('Consider improving your profile to better match scholarship requirements');
    }

    if (scholarship.gpa_requirement && matchScore.reasons.some(r => r.includes('GPA'))) {
      recommendations.push('Focus on improving your academic performance');
    }

    if (scholarship.language_requirements && Object.keys(scholarship.language_requirements).length > 0) {
      recommendations.push('Consider taking language proficiency tests');
    }

    if (scholarship.is_merit_based) {
      recommendations.push('Highlight your academic achievements and extracurricular activities');
    }

    if (scholarship.is_need_based) {
      recommendations.push('Prepare comprehensive financial documentation');
    }

    return recommendations;
  }
}

module.exports = new ScholarshipMatchingService();
