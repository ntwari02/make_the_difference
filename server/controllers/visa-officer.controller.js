const visaOfficerService = require('../services/visa-officer.service');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

class VisaOfficerController {
  // Get visa officer dashboard
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      const dashboard = await visaOfficerService.getDashboard(userId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all visa applications
  async getVisaApplications(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await visaOfficerService.getVisaApplications(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get visa application by ID
  async getVisaApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const application = await visaOfficerService.getVisaApplicationById(applicationId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Visa application not found'
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Review visa application
  async reviewVisaApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { status, comments, required_actions } = req.body;
      const officerId = req.user.id;

      const reviewed = await visaOfficerService.reviewVisaApplication(
        applicationId,
        officerId,
        status,
        comments,
        required_actions
      );

      if (!reviewed) {
        return res.status(404).json({
          success: false,
          message: 'Visa application not found'
        });
      }

      res.json({
        success: true,
        message: 'Visa application reviewed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Request additional documents
  async requestAdditionalDocuments(req, res) {
    try {
      const { applicationId } = req.params;
      const { required_documents, deadline, message } = req.body;
      const officerId = req.user.id;

      const requested = await visaOfficerService.requestAdditionalDocuments(
        applicationId,
        officerId,
        required_documents,
        deadline,
        message
      );

      if (!requested) {
        return res.status(404).json({
          success: false,
          message: 'Visa application not found'
        });
      }

      res.json({
        success: true,
        message: 'Additional documents requested successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Approve visa application
  async approveVisaApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { approval_details, validity_period, conditions } = req.body;
      const officerId = req.user.id;

      const approved = await visaOfficerService.approveVisaApplication(
        applicationId,
        officerId,
        approval_details,
        validity_period,
        conditions
      );

      if (!approved) {
        return res.status(404).json({
          success: false,
          message: 'Visa application not found'
        });
      }

      res.json({
        success: true,
        message: 'Visa application approved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reject visa application
  async rejectVisaApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { rejection_reason, rejection_code, appeal_instructions } = req.body;
      const officerId = req.user.id;

      const rejected = await visaOfficerService.rejectVisaApplication(
        applicationId,
        officerId,
        rejection_reason,
        rejection_code,
        appeal_instructions
      );

      if (!rejected) {
        return res.status(404).json({
          success: false,
          message: 'Visa application not found'
        });
      }

      res.json({
        success: true,
        message: 'Visa application rejected successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get visa application statistics
  async getVisaApplicationStats(req, res) {
    try {
      const { start_date, end_date, period = 'monthly' } = req.query;

      const stats = await visaOfficerService.getVisaApplicationStats(
        start_date,
        end_date,
        period
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get pending applications
  async getPendingApplications(req, res) {
    try {
      const { page = 1, limit = 20, priority = 'normal' } = req.query;

      const result = await visaOfficerService.getPendingApplications(
        parseInt(page),
        parseInt(limit),
        priority
      );

      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get applications by status
  async getApplicationsByStatus(req, res) {
    try {
      const { status } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await visaOfficerService.getApplicationsByStatus(
        status,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add application notes
  async addApplicationNotes(req, res) {
    try {
      const { applicationId } = req.params;
      const { notes, is_internal = false } = req.body;
      const officerId = req.user.id;

      const added = await visaOfficerService.addApplicationNotes(
        applicationId,
        officerId,
        notes,
        is_internal
      );

      if (!added) {
        return res.status(404).json({
          success: false,
          message: 'Visa application not found'
        });
      }

      res.json({
        success: true,
        message: 'Notes added successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get application history
  async getApplicationHistory(req, res) {
    try {
      const { applicationId } = req.params;

      const history = await visaOfficerService.getApplicationHistory(applicationId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bulk update applications
  async bulkUpdateApplications(req, res) {
    try {
      const { application_ids, status, comments } = req.body;
      const officerId = req.user.id;

      const updated = await visaOfficerService.bulkUpdateApplications(
        application_ids,
        officerId,
        status,
        comments
      );

      res.json({
        success: true,
        message: `${updated} applications updated successfully`,
        data: { updated_count: updated }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get visa officer performance metrics
  async getPerformanceMetrics(req, res) {
    try {
      const { officerId } = req.params;
      const { start_date, end_date } = req.query;

      const metrics = await visaOfficerService.getPerformanceMetrics(
        officerId,
        start_date,
        end_date
      );

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Export applications data
  async exportApplicationsData(req, res) {
    try {
      const { format = 'csv', ...filters } = req.query;

      const exportData = await visaOfficerService.exportApplicationsData(format, filters);

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="visa_applications.${format}"`);

      res.send(exportData);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new VisaOfficerController();
