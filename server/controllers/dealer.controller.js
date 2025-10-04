const dealerService = require('../services/dealer.service');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

class DealerController {
  // Create dealer profile
  async createDealerProfile(req, res) {
    try {
      const userId = req.user.id;
      const dealerData = req.body;

      const dealer = await dealerService.createDealerProfile(userId, dealerData);

      res.status(201).json({
        success: true,
        data: dealer,
        message: 'Dealer profile created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get dealer profile
  async getDealerProfile(req, res) {
    try {
      const { dealerId } = req.params;
      const dealer = await dealerService.getDealerById(dealerId);

      if (!dealer) {
        return res.status(404).json({
          success: false,
          message: 'Dealer not found'
        });
      }

      res.json({
        success: true,
        data: dealer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get my dealer profile
  async getMyDealerProfile(req, res) {
    try {
      const userId = req.user.id;
      const dealer = await dealerService.getDealerByUserId(userId);

      if (!dealer) {
        return res.status(404).json({
          success: false,
          message: 'Dealer profile not found'
        });
      }

      res.json({
        success: true,
        data: dealer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update dealer profile
  async updateDealerProfile(req, res) {
    try {
      const { dealerId } = req.params;
      const updateData = req.body;
      
      console.log('🔍 Update Profile Debug:');
      console.log('- Dealer ID:', dealerId);
      console.log('- User ID:', req.user?.id);
      console.log('- User Role:', req.user?.role);
      console.log('- Update Data:', JSON.stringify(updateData, null, 2));

      const updated = await dealerService.updateDealerProfile(dealerId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Dealer not found'
        });
      }

      res.json({
        success: true,
        message: 'Dealer profile updated successfully'
      });
    } catch (error) {
      console.error('❌ Update Profile Error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      res.status(400).json({
        success: false,
        message: error.message,
        details: error.response?.data || error.details || null
      });
    }
  }

  // Get dealer statistics
  async getDealerStats(req, res) {
    try {
      const { dealerId } = req.params;
      const stats = await dealerService.getDealerStats(dealerId);

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

  // Get dealer inventory
  async getDealerInventory(req, res) {
    try {
      const { dealerId } = req.params;
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await dealerService.getDealerInventory(
        dealerId,
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.inventory,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add vehicle to inventory
  async addVehicleToInventory(req, res) {
    try {
      const { dealerId } = req.params;
      const vehicleData = req.body;

      const vehicle = await dealerService.addVehicleToInventory(dealerId, vehicleData);

      res.status(201).json({
        success: true,
        data: vehicle,
        message: 'Vehicle added to inventory successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update vehicle in inventory
  async updateVehicleInInventory(req, res) {
    try {
      const { dealerId, vehicleId } = req.params;
      const updateData = req.body;

      const updated = await dealerService.updateVehicleInInventory(dealerId, vehicleId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found in inventory'
        });
      }

      res.json({
        success: true,
        message: 'Vehicle updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Remove vehicle from inventory
  async removeVehicleFromInventory(req, res) {
    try {
      const { dealerId, vehicleId } = req.params;

      const removed = await dealerService.removeVehicleFromInventory(dealerId, vehicleId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found in inventory'
        });
      }

      res.json({
        success: true,
        message: 'Vehicle removed from inventory successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get dealer reviews
  async getDealerReviews(req, res) {
    try {
      const { dealerId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await dealerService.getDealerReviews(
        dealerId,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get dealer sales analytics
  async getDealerSalesAnalytics(req, res) {
    try {
      const { dealerId } = req.params;
      const { start_date, end_date, period = 'monthly' } = req.query;

      const analytics = await dealerService.getDealerSalesAnalytics(
        dealerId,
        start_date,
        end_date,
        period
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search dealers
  async searchDealers(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await dealerService.searchDealers(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.dealers,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin Functions
  async getAllDealers(req, res) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;

      const result = await dealerService.getAllDealers(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json({
        success: true,
        data: result.dealers,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async verifyDealer(req, res) {
    try {
      const { dealerId } = req.params;
      const { status, verification_documents } = req.body;

      const verified = await dealerService.verifyDealer(
        dealerId,
        status,
        verification_documents
      );

      if (!verified) {
        return res.status(404).json({
          success: false,
          message: 'Dealer not found'
        });
      }

      res.json({
        success: true,
        message: `Dealer ${status} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateDealerStatus(req, res) {
    try {
      const { dealerId } = req.params;
      const { status, reason } = req.body;

      const updated = await dealerService.updateDealerStatus(dealerId, status, reason);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Dealer not found'
        });
      }

      res.json({
        success: true,
        message: `Dealer status updated to ${status} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new DealerController();
