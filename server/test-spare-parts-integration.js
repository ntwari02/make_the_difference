#!/usr/bin/env node

/**
 * Test script for spare parts backend integration
 * This script tests the basic CRUD operations for spare parts
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test configuration
const TEST_CONFIG = {
  // You'll need to replace these with actual test credentials
  sellerToken: 'your-seller-jwt-token-here',
  testPartData: {
    name: 'Test Brake Pad Set',
    description: 'High-performance brake pads for testing',
    short_description: 'Test brake pads',
    category_id: 'test-category-id',
    brand_id: 'test-brand-id',
    part_number: 'TEST-BP-001',
    oem_number: 'TEST-OEM-001',
    price: 99.99,
    currency: 'USD',
    condition: 'new',
    stock_quantity: 10,
    warranty_period: 12,
    warranty_type: 'manufacturer',
    is_installable: true,
    installation_difficulty: 'medium',
    features: ['High Performance', 'Test Quality'],
    vehicle_compatibility: [{
      vehicle_make: 'Toyota',
      vehicle_model: 'Camry',
      vehicle_year_from: 2020,
      vehicle_year_to: 2023,
      compatibility_confidence: 1.0
    }]
  }
};

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_CONFIG.sellerToken}`
  }
});

async function testSparePartsAPI() {
  console.log('🧪 Testing Spare Parts Backend Integration...\n');

  try {
    // Test 1: Get categories and brands
    console.log('1️⃣ Testing categories and brands...');
    const [categoriesResponse, brandsResponse] = await Promise.all([
      api.get('/spare-parts/categories'),
      api.get('/spare-parts/brands')
    ]);
    
    console.log('✅ Categories loaded:', categoriesResponse.data?.categories?.length || 0);
    console.log('✅ Brands loaded:', brandsResponse.data?.brands?.length || 0);

    // Test 2: Create a spare part
    console.log('\n2️⃣ Testing spare part creation...');
    const createResponse = await api.post('/spare-parts', TEST_CONFIG.testPartData);
    console.log('✅ Spare part created:', createResponse.data);
    
    const createdPartId = createResponse.data.part_id;

    // Test 3: Get seller's spare parts
    console.log('\n3️⃣ Testing seller spare parts listing...');
    const listResponse = await api.get('/spare-parts/seller/my-parts');
    console.log('✅ Seller parts loaded:', listResponse.data?.parts?.length || 0);

    // Test 4: Update spare part
    console.log('\n4️⃣ Testing spare part update...');
    const updateData = {
      name: 'Updated Test Brake Pad Set',
      price: 109.99,
      stock_quantity: 15
    };
    const updateResponse = await api.put(`/spare-parts/seller/${createdPartId}`, updateData);
    console.log('✅ Spare part updated:', updateResponse.data);

    // Test 5: Get single spare part
    console.log('\n5️⃣ Testing single spare part retrieval...');
    const singleResponse = await api.get(`/spare-parts/${createdPartId}`);
    console.log('✅ Single part retrieved:', singleResponse.data?.name);

    // Test 6: Delete spare part
    console.log('\n6️⃣ Testing spare part deletion...');
    const deleteResponse = await api.delete(`/spare-parts/seller/${createdPartId}`);
    console.log('✅ Spare part deleted:', deleteResponse.data);

    // Test 7: Get seller analytics
    console.log('\n7️⃣ Testing seller analytics...');
    const analyticsResponse = await api.get('/spare-parts/analytics/seller');
    console.log('✅ Analytics retrieved:', analyticsResponse.data ? 'Success' : 'No data');

    console.log('\n🎉 All tests passed! Backend integration is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to set a valid seller JWT token in TEST_CONFIG.sellerToken');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: Check that categories and brands exist in the database');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testSparePartsAPI();
}

module.exports = { testSparePartsAPI };
