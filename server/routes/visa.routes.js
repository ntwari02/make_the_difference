const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { ok, badRequest, notFound, unauthorized } = require('../utils/response');
const visaService = require('../services/visa.service');

// Get all visa services with filters
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const visaServices = await visaService.getVisaServices(filters);

    return ok(res, visaServices);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get visa service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const visaService = await visaService.getVisaServiceById(id);

    if (!visaService) {
      return notFound(res, 'Visa service not found');
    }

    return ok(res, visaService);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Create new visa service (Provider only)
router.post('/', authenticateToken, authorizeRoles(['provider', 'admin']), async (req, res) => {
  try {
    const providerId = req.user.id;
    const visaData = req.body;

    if (!visaData.title || !visaData.description || !visaData.country || !visaData.visa_type) {
      return badRequest(res, 'Title, description, country, and visa type are required');
    }

    const visaServiceId = await visaService.createVisaService(visaData, providerId);

    return ok(res, { 
      visa_service_id: visaServiceId,
      message: 'Visa service created successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update visa service (Provider only)
router.put('/:id', authenticateToken, authorizeRoles(['provider', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;
    const updateData = req.body;

    const result = await visaService.updateVisaService(id, updateData, providerId);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete visa service (Provider only)
router.delete('/:id', authenticateToken, authorizeRoles(['provider', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    const result = await visaService.deleteVisaService(id, providerId);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Create visa application
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { applicationData, documents = {} } = req.body;

    if (!applicationData) {
      return badRequest(res, 'Application data is required');
    }

    const applicationId = await visaService.createApplication({
      visa_service_id: id,
      application_data: applicationData,
      documents,
      status: 'draft'
    }, userId);

    return ok(res, {
      application_id: applicationId,
      message: 'Visa application created successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update visa application
router.put('/application/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const result = await visaService.updateApplication(applicationId, updateData, userId);

    return ok(res, result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get user's visa applications
router.get('/applications/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const applications = await visaService.getUserApplications(userId, filters);

    return ok(res, applications);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get visa service statistics (Provider only)
router.get('/statistics/my', authenticateToken, authorizeRoles(['provider', 'admin']), async (req, res) => {
  try {
    const providerId = req.user.id;
    const statistics = await visaService.getVisaServiceStats(providerId);

    return ok(res, statistics);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get all visa service statistics (Admin only)
router.get('/statistics/all', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const statistics = await visaService.getVisaServiceStats();

    return ok(res, statistics);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
