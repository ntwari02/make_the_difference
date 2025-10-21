const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

// Simple working spare parts endpoint
router.get('/working', authenticateToken, authorizeRoles(['seller', 'admin']), async (req, res) => {
  try {
    console.log('=== WORKING ENDPOINT ===');
    console.log('User:', req.user);
    
    // Create a simple response that will always work
    const mockSpareParts = [
      {
        id: 'mock-1',
        sku: 'MOCK-SKU-001',
        name: 'Mock Brake Pads',
        description: 'High-quality brake pads for testing',
        category_id: 'cat1',
        brand_id: 'brand1',
        price: 99.99,
        currency: 'USD',
        seller_id: req.user.id,
        status: 'active',
        quantity_available: 10,
        quantity_reserved: 0,
        reorder_point: 5,
        max_stock_level: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_name: 'Brake System',
        brand_name: 'Bosch',
        images: [],
        last_restocked_at: null,
        last_sold_at: null
      },
      {
        id: 'mock-2',
        sku: 'MOCK-SKU-002',
        name: 'Mock Engine Oil Filter',
        description: 'Premium engine oil filter',
        category_id: 'cat2',
        brand_id: 'brand2',
        price: 29.99,
        currency: 'USD',
        seller_id: req.user.id,
        status: 'active',
        quantity_available: 25,
        quantity_reserved: 0,
        reorder_point: 10,
        max_stock_level: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_name: 'Engine & Lubrication',
        brand_name: 'Continental',
        images: [],
        last_restocked_at: null,
        last_sold_at: null
      }
    ];
    
    res.json({
      success: true,
      data: mockSpareParts,
      pagination: {
        page: 1,
        limit: 50,
        total: mockSpareParts.length,
        total_pages: 1,
        has_next: false,
        has_prev: false
      },
      message: 'Using mock data - database connection may have issues'
    });
    
  } catch (error) {
    console.error('Working endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Even the working endpoint failed: ' + error.message
    });
  }
});

// Simple categories endpoint
router.get('/working-categories', async (req, res) => {
  try {
    const mockCategories = [
      { id: 'cat1', name: 'Brake System', description: 'Brake components' },
      { id: 'cat2', name: 'Engine & Lubrication', description: 'Engine parts' },
      { id: 'cat3', name: 'Electrical', description: 'Electrical components' },
      { id: 'cat4', name: 'Suspension', description: 'Suspension parts' },
      { id: 'cat5', name: 'Exhaust System', description: 'Exhaust components' }
    ];
    
    res.json({
      success: true,
      data: mockCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Simple brands endpoint
router.get('/working-brands', async (req, res) => {
  try {
    const mockBrands = [
      { id: 'brand1', name: 'Bosch', description: 'German automotive parts' },
      { id: 'brand2', name: 'Continental', description: 'German technology company' },
      { id: 'brand3', name: 'Delphi', description: 'American parts manufacturer' },
      { id: 'brand4', name: 'Denso', description: 'Japanese parts manufacturer' },
      { id: 'brand5', name: 'Mann-Filter', description: 'German filtration systems' }
    ];
    
    res.json({
      success: true,
      data: mockBrands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
