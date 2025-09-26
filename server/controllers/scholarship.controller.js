const scholarshipService = require('../services/scholarship.service');
const scholarshipApplicationService = require('../services/scholarship-application.service');
const scholarshipMatchingService = require('../services/scholarship-matching.service');

class ScholarshipController {
  // Get all scholarships with filters
  async getScholarships(req, res) {
    try {
      const {
        country,
        degree_level,
        field_of_study,
        min_amount,
        max_amount,
        provider_type,
        is_featured,
        deadline_before,
        sort_by,
        limit = 20,
        offset = 0,
        search
      } = req.query;

      let scholarships;

      if (search) {
        scholarships = await scholarshipService.searchScholarships(search, {
          country,
          degree_level,
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
      } else {
        scholarships = await scholarshipService.getScholarships({
          country,
          degree_level,
          field_of_study,
          min_amount: min_amount ? parseFloat(min_amount) : undefined,
          max_amount: max_amount ? parseFloat(max_amount) : undefined,
          provider_type,
          is_featured: is_featured !== undefined ? is_featured === 'true' : undefined,
          deadline_before,
          sort_by,
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
      }

      res.json({
        success: true,
        data: scholarships,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: scholarships.length
        }
      });
    } catch (error) {
      console.error('Error in getScholarships:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch scholarships'
      });
    }
  }

  // Get scholarship by ID
  async getScholarshipById(req, res) {
    try {
      const { id } = req.params;
      const scholarship = await scholarshipService.getScholarshipById(id);

      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: 'Scholarship not found'
        });
      }

      res.json({
        success: true,
        data: scholarship
      });
    } catch (error) {
      console.error('Error in getScholarshipById:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch scholarship'
      });
    }
  }

  // Create new scholarship
  async createScholarship(req, res) {
    try {
      const providerId = req.user.id;
      const scholarshipId = await scholarshipService.createScholarship(req.body, providerId);

      res.status(201).json({
        success: true,
        message: 'Scholarship created successfully',
        data: { id: scholarshipId }
      });
    } catch (error) {
      console.error('Error in createScholarship:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create scholarship'
      });
    }
  }

  // Update scholarship
  async updateScholarship(req, res) {
    try {
      const { id } = req.params;
      const providerId = req.user.id;
      const updated = await scholarshipService.updateScholarship(id, req.body, providerId);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Scholarship not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Scholarship updated successfully'
      });
    } catch (error) {
      console.error('Error in updateScholarship:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update scholarship'
      });
    }
  }

  // Delete scholarship
  async deleteScholarship(req, res) {
    try {
      const { id } = req.params;
      const providerId = req.user.id;
      const deleted = await scholarshipService.deleteScholarship(id, providerId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Scholarship not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Scholarship deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteScholarship:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete scholarship'
      });
    }
  }

  // Get featured scholarships
  async getFeaturedScholarships(req, res) {
    try {
      const { limit = 10 } = req.query;
      const scholarships = await scholarshipService.getFeaturedScholarships(parseInt(limit));

      res.json({
        success: true,
        data: scholarships
      });
    } catch (error) {
      console.error('Error in getFeaturedScholarships:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch featured scholarships'
      });
    }
  }

  // Get trending scholarships
  async getTrendingScholarships(req, res) {
    try {
      const { limit = 10 } = req.query;
      const scholarships = await scholarshipService.getTrendingScholarships(parseInt(limit));

      res.json({
        success: true,
        data: scholarships
      });
    } catch (error) {
      console.error('Error in getTrendingScholarships:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch trending scholarships'
      });
    }
  }

  // Get scholarships by provider
  async getScholarshipsByProvider(req, res) {
    try {
      const providerId = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;
      
      const scholarships = await scholarshipService.getScholarshipsByProvider(providerId, {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: scholarships,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: scholarships.length
        }
      });
    } catch (error) {
      console.error('Error in getScholarshipsByProvider:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch provider scholarships'
      });
    }
  }

  // Get scholarship statistics
  async getScholarshipStats(req, res) {
    try {
      const stats = await scholarshipService.getScholarshipStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getScholarshipStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch scholarship statistics'
      });
    }
  }

  // ========== APPLICATION CONTROLLERS ==========

  // Create scholarship application
  async createApplication(req, res) {
    try {
      const userId = req.user.id;
      const applicationId = await scholarshipApplicationService.createApplication(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: { id: applicationId }
      });
    } catch (error) {
      console.error('Error in createApplication:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create application'
      });
    }
  }

  // Update application
  async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updated = await scholarshipApplicationService.updateApplication(id, req.body, userId);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Application updated successfully'
      });
    } catch (error) {
      console.error('Error in updateApplication:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update application'
      });
    }
  }

  // Get user's applications
  async getUserApplications(req, res) {
    try {
      const userId = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;
      
      const applications = await scholarshipApplicationService.getUserApplications(userId, {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: applications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: applications.length
        }
      });
    } catch (error) {
      console.error('Error in getUserApplications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user applications'
      });
    }
  }

  // Get application by ID
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const application = await scholarshipApplicationService.getApplicationById(id, userId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or access denied'
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error in getApplicationById:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch application'
      });
    }
  }

  // Get scholarship applications (provider view)
  async getScholarshipApplications(req, res) {
    try {
      const { scholarshipId } = req.params;
      const providerId = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;
      
      const applications = await scholarshipApplicationService.getScholarshipApplications(
        scholarshipId, 
        providerId, 
        {
          status,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      );

      res.json({
        success: true,
        data: applications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: applications.length
        }
      });
    } catch (error) {
      console.error('Error in getScholarshipApplications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch scholarship applications'
      });
    }
  }

  // Update application status (provider action)
  async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, review_notes } = req.body;
      const reviewerId = req.user.id;
      const providerId = req.user.id;

      const updated = await scholarshipApplicationService.updateApplicationStatus(
        id, 
        status, 
        review_notes, 
        reviewerId, 
        providerId
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Application status updated successfully'
      });
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update application status'
      });
    }
  }

  // Withdraw application
  async withdrawApplication(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const withdrawn = await scholarshipApplicationService.withdrawApplication(id, userId);

      if (!withdrawn) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Application withdrawn successfully'
      });
    } catch (error) {
      console.error('Error in withdrawApplication:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to withdraw application'
      });
    }
  }

  // Get application statistics
  async getApplicationStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await scholarshipApplicationService.getApplicationStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getApplicationStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch application statistics'
      });
    }
  }

  // ========== AI MATCHING CONTROLLERS ==========

  // Get personalized scholarship recommendations
  async getPersonalizedRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;
      
      const recommendations = await scholarshipMatchingService.getPersonalizedRecommendations(
        userId, 
        parseInt(limit)
      );

      res.json({
        success: true,
        data: recommendations,
        message: `Found ${recommendations.length} personalized recommendations`
      });
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get personalized recommendations'
      });
    }
  }

  // Get scholarship success prediction
  async getSuccessPrediction(req, res) {
    try {
      const userId = req.user.id;
      const { scholarshipId } = req.params;
      
      const prediction = await scholarshipMatchingService.getSuccessPrediction(userId, scholarshipId);

      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      console.error('Error in getSuccessPrediction:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get success prediction'
      });
    }
  }
}

module.exports = new ScholarshipController();
