const db = require('../db/connection');

// Helper function to safely parse JSON fields from database or API
function safeParseJSON(fieldValue, defaultValue, fieldName) {
  // If already an object/array, return as is
  if (typeof fieldValue === 'object' && fieldValue !== null) {
    return fieldValue;
  }
  
  // If null/undefined, return default
  if (fieldValue === null || fieldValue === undefined) {
    return defaultValue;
  }
  
  // If string starting with '{' or '[', try to parse as JSON
  if (typeof fieldValue === 'string' && (fieldValue.startsWith('{') || fieldValue.startsWith('['))) {
    try {
      return JSON.parse(fieldValue);
    } catch (e) {
      console.warn(`Failed to parse dealer ${fieldName} JSON:`, fieldValue);
      return defaultValue;
    }
  }
  
  // For empty strings or invalid formats, return default
  return defaultValue;
}

class DealerService {
  // Create dealer profile
  async createDealerProfile(userId, dealerData) {
    try {
      const {
        business_name,
        business_type,
        license_number,
        description,
        address,
        city,
        state,
        country,
        postal_code,
        phone,
        email,
        website,
        logo,
        images,
        business_hours,
        services
      } = dealerData;

      const [result] = await db.execute(
        `INSERT INTO dealers (
          user_id, business_name, business_type, license_number, description,
          address, city, state, country, postal_code, phone, email,
          website, logo, images, business_hours, services, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_verification')`,
        [
          userId, business_name, business_type, license_number, description,
          address, city, state, country, postal_code, phone, email,
          website, logo, JSON.stringify(images), JSON.stringify(business_hours), JSON.stringify(services)
        ]
      );

      return {
        id: result.insertId,
        user_id: userId,
        business_name,
        business_type,
        status: 'pending_verification'
      };
    } catch (error) {
      throw new Error(`Failed to create dealer profile: ${error.message}`);
    }
  }

  // Get dealer by ID
  async getDealerById(dealerId) {
    try {
      const [rows] = await db.execute(
        `SELECT d.*, u.email as user_email, u.first_name, u.last_name,
                (SELECT COUNT(*) FROM cars WHERE dealer_id = d.id AND status = 'active') as active_listings,
                (SELECT AVG(rating) FROM dealer_reviews WHERE dealer_id = d.id) as average_rating,
                (SELECT COUNT(*) FROM dealer_reviews WHERE dealer_id = d.id) as review_count
         FROM dealers d 
         JOIN users u ON d.user_id = u.id 
         WHERE d.id = ?`,
        [dealerId]
      );

      if (rows[0]) {
        // Safe JSON parsing with error handling
        try {
          rows[0].images = safeParseJSON(rows[0].images, [], 'images');
        } catch (e) {
          console.warn('Failed to parse images JSON:', rows[0].images);
          rows[0].images = [];
        }
        
        try {
          rows[0].business_hours = safeParseJSON(rows[0].business_hours, {}, 'business_hours');
        } catch (e) {
          console.warn('Failed to parse business_hours JSON:', rows[0].business_hours);
          rows[0].business_hours = {};
        }
        
        try {
          rows[0].services = safeParseJSON(rows[0].services, [], 'services');
        } catch (e) {
          console.warn('Failed to parse services JSON:', rows[0].services);
          rows[0].services = [];
        }
      }

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get dealer: ${error.message}`);
    }
  }

  // Get dealer by user ID
  async getDealerByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT d.*, u.email as user_email, u.first_name, u.last_name,
                (SELECT COUNT(*) FROM cars WHERE dealer_id = d.id AND status = 'active') as active_listings,
                (SELECT COALESCE(AVG(rating), 0) FROM dealer_reviews WHERE dealer_id = d.id) as average_rating,
                (SELECT COUNT(*) FROM dealer_reviews WHERE dealer_id = d.id) as review_count
         FROM dealers d 
         JOIN users u ON d.user_id = u.id 
         WHERE d.user_id = ?`,
        [userId]
      );

      if (rows[0]) {
        // Safe JSON parsing with error handling
        try {
          rows[0].images = safeParseJSON(rows[0].images, [], 'images');
        } catch (e) {
          console.warn('Failed to parse images JSON:', rows[0].images);
          rows[0].images = [];
        }
        
        try {
          rows[0].business_hours = safeParseJSON(rows[0].business_hours, {}, 'business_hours');
        } catch (e) {
          console.warn('Failed to parse business_hours JSON:', rows[0].business_hours);
          rows[0].business_hours = {};
        }
        
        try {
          rows[0].services = safeParseJSON(rows[0].services, [], 'services');
        } catch (e) {
          console.warn('Failed to parse services JSON:', rows[0].services);
          rows[0].services = [];
        }
      }

      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get dealer by user ID: ${error.message}`);
    }
  }

  // Update dealer profile
  async updateDealerProfile(dealerId, updateData) {
    try {
      const allowedFields = [
        'business_name', 'business_type', 'license_number', 'description',
        'address', 'city', 'state', 'country', 'postal_code', 'phone', 'email',
        'website', 'logo', 'images', 'business_hours', 'services'
      ];

      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (['images', 'business_hours', 'services'].includes(key)) {
            updateFields.push(`${key} = ?`);
            // Only stringify if it's an actual object/array, not already a string
            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
            updateValues.push(jsonValue);
          } else {
            updateFields.push(`${key} = ?`);
            updateValues.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(dealerId);

      const [result] = await db.query(
        `UPDATE dealers SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update dealer profile: ${error.message}`);
    }
  }

  // Verify dealer
  async verifyDealer(dealerId, status, verificationDocuments) {
    try {
      const [result] = await db.execute(
        `UPDATE dealers 
         SET is_verified = ?, verification_documents = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status === 'verified', JSON.stringify(verificationDocuments), dealerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to verify dealer: ${error.message}`);
    }
  }

  // Update dealer status
  async updateDealerStatus(dealerId, status, reason) {
    try {
      const [result] = await db.execute(
        `UPDATE dealers 
         SET status = ?, status_reason = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, reason, dealerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update dealer status: ${error.message}`);
    }
  }

  // Get all dealers with pagination
  async getAllDealers(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      if (filters.business_type) {
        whereClause += ' AND d.business_type = ?';
        queryParams.push(filters.business_type);
      }

      if (filters.status) {
        whereClause += ' AND d.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.is_verified !== undefined) {
        whereClause += ' AND d.is_verified = ?';
        queryParams.push(filters.is_verified === 'true' ? 1 : 0);
      }

      if (filters.city) {
        whereClause += ' AND d.city = ?';
        queryParams.push(filters.city);
      }

      if (filters.state) {
        whereClause += ' AND d.state = ?';
        queryParams.push(filters.state);
      }

      if (filters.search) {
        whereClause += ' AND (d.business_name LIKE ? OR d.description LIKE ?)';
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const [rows] = await db.execute(
        `SELECT d.*, u.email as user_email, u.first_name, u.last_name,
                (SELECT COUNT(*) FROM cars WHERE dealer_id = d.id AND status = 'active') as active_listings,
                (SELECT AVG(rating) FROM dealer_reviews WHERE dealer_id = d.id) as average_rating,
                (SELECT COUNT(*) FROM dealer_reviews WHERE dealer_id = d.id) as review_count
         FROM dealers d 
         JOIN users u ON d.user_id = u.id 
         ${whereClause}
         ORDER BY d.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Parse JSON fields with smart error handling
      rows.forEach(row => {
        // Helper function to safely parse JSON fields
        const safeParseField = (fieldValue, defaultValue, fieldName) => {
          // If already an object/array, return as is
          if (typeof fieldValue === 'object' && fieldValue !== null) {
            return fieldValue;
          }
          
          // If null/undefined, return default
          if (fieldValue === null || fieldValue === undefined) {
            return defaultValue;
          }
          
          // If string starting with '{' or '[', try to parse as JSON
          if (typeof fieldValue === 'string' && (fieldValue.startsWith('{') || fieldValue.startsWith('['))) {
            try {
              return JSON.parse(fieldValue);
            } catch (e) {
              console.warn(`Failed to parse dealer ${fieldName} JSON:`, fieldValue);
              return defaultValue;
            }
          }
          
          // For empty strings or invalid formats, return default
          return defaultValue;
        };
        
        row.images = safeParseField(row.images, [], 'images');
        row.business_hours = safeParseField(row.business_hours, {}, 'business_hours');
        row.services = safeParseField(row.services, [], 'services');
      });

      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM dealers d ${whereClause}`,
        queryParams
      );

      return {
        dealers: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dealers: ${error.message}`);
    }
  }

  // Search dealers
  async searchDealers(page = 1, limit = 20, filters = {}) {
    return this.getAllDealers(page, limit, filters);
  }

  // Get dealer statistics
  async getDealerStats(dealerId) {
    try {
      const [inventoryStats] = await db.execute(
        `SELECT 
           COUNT(*) as total_vehicles,
           COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active_listings,
           COALESCE(SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END), 0) as sold_vehicles,
           COALESCE(AVG(price), 0) as average_price
         FROM cars 
         WHERE dealer_id = ?`,
        [dealerId]
      );

      const [salesStats] = await db.execute(
        `SELECT 
           COUNT(*) as total_sales,
           COALESCE(SUM(price), 0) as total_revenue,
           COALESCE(AVG(price), 0) as average_sale_price
         FROM cars 
         WHERE dealer_id = ? AND status = 'sold'`,
        [dealerId]
      );

      const [recentSales] = await db.execute(
        `SELECT id, brand as make, model, year, price, created_at as sold_at
         FROM cars 
         WHERE dealer_id = ? AND status = 'sold'
         ORDER BY created_at DESC 
         LIMIT 5`,
        [dealerId]
      );

      const [monthlySales] = await db.execute(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m') as month,
           COUNT(*) as sales_count,
           SUM(price) as monthly_revenue
         FROM cars 
         WHERE dealer_id = ? 
           AND status = 'sold'
           AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month DESC`,
        [dealerId]
      );

      // Ensure we have valid data for return
      const inventoryData = inventoryStats[0] || {
        total_vehicles: 0,
        active_listings: 0,
        sold_vehicles: 0,
        average_price: 0
      };

      const salesData = salesStats[0] || {
        total_sales: 0,
        total_revenue: 0,
        average_sale_price: 0
      };

      return {
        inventory: inventoryData,
        sales: salesData,
        recent_sales: recentSales || [],
        monthly_sales: monthlySales || []
      };
    } catch (error) {
      console.error('Dealer stats error:', error);
      throw new Error(`Failed to get dealer stats: ${error.message}`);
    }
  }

  // Get dealer inventory
  async getDealerInventory(dealerId, page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE dealer_id = ?';
      const queryParams = [dealerId];

      if (filters.status) {
        whereClause += ' AND status = ?';
        queryParams.push(filters.status);
      }

      // Handle search filter (searches across brand, model)
      if (filters.search && filters.search.trim()) {
        whereClause += ' AND (brand LIKE ? OR model LIKE ? OR title LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.make) {
        whereClause += ' AND brand = ?';
        queryParams.push(filters.make);
      }

      if (filters.model) {
        whereClause += ' AND model = ?';
        queryParams.push(filters.model);
      }

      if (filters.min_price) {
        whereClause += ' AND price >= ?';
        queryParams.push(filters.min_price);
      }

      if (filters.max_price) {
        whereClause += ' AND price <= ?';
        queryParams.push(filters.max_price);
      }

      if (filters.year_from) {
        whereClause += ' AND year >= ?';
        queryParams.push(filters.year_from);
      }

      if (filters.year_to) {
        whereClause += ' AND year <= ?';
        queryParams.push(filters.year_to);
      }

      const finalParams = queryParams.concat([parseInt(limit), parseInt(offset)]);
      
      const [rows] = await db.query(
        `SELECT * FROM cars 
         ${whereClause}
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        finalParams
      );

      // Parse JSON fields with error handling
      rows.forEach(row => {
        try {
          row.images = safeParseJSON(row.images, [], 'images');
        } catch (e) {
          console.warn('Failed to parse car images JSON:', row.images);
          row.images = [];
        }
        
        try {
          row.features = JSON.parse(row.features || '[]');
        } catch (e) {
          console.warn('Failed to parse car features JSON:', row.features);
          row.features = [];
        }
        
        try {
          row.specifications = JSON.parse(row.specifications || '{}');
        } catch (e) {
          console.warn('Failed to parse car specifications JSON:', row.specifications);
          row.specifications = {};
        }
      });

      // Get total count (no LIMIT/OFFSET for count)
      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM cars ${whereClause}`,
        queryParams
      );

      return {
        inventory: rows || [],
        pagination: {
          page,
          limit,
          total: countResult[0]?.total || 0,
          totalPages: Math.ceil((countResult[0]?.total || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Dealer inventory error:', error);
      throw new Error(`Failed to get dealer inventory: ${error.message}`);
    }
  }

  // Add vehicle to inventory
  async addVehicleToInventory(dealerId, vehicleData) {
    try {
      const {
        make, model, year, price, mileage, fuel_type, transmission,
        body_type, color, condition, description, images, features,
        specifications, vin, engine_size, horsepower, torque
      } = vehicleData;

      const [result] = await db.execute(
        `INSERT INTO cars (
          dealer_id, make, model, year, price, mileage, fuel_type, transmission,
          body_type, color, condition, description, images, features,
          specifications, vin, engine_size, horsepower, torque, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          dealerId, make, model, year, price, mileage, fuel_type, transmission,
          body_type, color, condition, description, JSON.stringify(images), JSON.stringify(features),
          JSON.stringify(specifications), vin, engine_size, horsepower, torque
        ]
      );

      return {
        id: result.insertId,
        dealer_id: dealerId,
        make,
        model,
        year,
        price,
        status: 'active'
      };
    } catch (error) {
      throw new Error(`Failed to add vehicle to inventory: ${error.message}`);
    }
  }

  // Update vehicle in inventory
  async updateVehicleInInventory(dealerId, vehicleId, updateData) {
    try {
      const allowedFields = [
        'make', 'model', 'year', 'price', 'mileage', 'fuel_type', 'transmission',
        'body_type', 'color', 'condition', 'description', 'images', 'features',
        'specifications', 'vin', 'engine_size', 'horsepower', 'torque', 'status'
      ];

      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (['images', 'features', 'specifications'].includes(key)) {
            updateFields.push(`${key} = ?`);
            updateValues.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            updateValues.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(vehicleId, dealerId);

      const [result] = await db.execute(
        `UPDATE cars SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND dealer_id = ?`,
        updateValues
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update vehicle in inventory: ${error.message}`);
    }
  }

  // Remove vehicle from inventory
  async removeVehicleFromInventory(dealerId, vehicleId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM cars WHERE id = ? AND dealer_id = ?',
        [vehicleId, dealerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to remove vehicle from inventory: ${error.message}`);
    }
  }

  // Get dealer reviews
  async getDealerReviews(dealerId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const [rows] = await db.execute(
        `SELECT dr.*, u.first_name, u.last_name, u.profile_image
         FROM dealer_reviews dr
         JOIN users u ON dr.user_id = u.id
         WHERE dr.dealer_id = ?
         ORDER BY dr.created_at DESC
         LIMIT ? OFFSET ?`,
        [dealerId, limit, offset]
      );

      // Get total count
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM dealer_reviews WHERE dealer_id = ?',
        [dealerId]
      );

      return {
        reviews: rows,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dealer reviews: ${error.message}`);
    }
  }

  // Get dealer sales analytics
  async getDealerSalesAnalytics(dealerId, startDate, endDate, period = 'monthly') {
    try {
      let dateFormat = '%Y-%m';
      if (period === 'daily') {
        dateFormat = '%Y-%m-%d';
      } else if (period === 'weekly') {
        dateFormat = '%Y-%u';
      } else if (period === 'yearly') {
        dateFormat = '%Y';
      }

      // Build WHERE clause dynamically
      let whereClause = 'WHERE dealer_id = ? AND status = ?';
      const queryParams = [dealerId, 'sold'];

      if (startDate) {
        whereClause += ' AND created_at >= ?';
        queryParams.push(startDate);
      } else {
        // Default to last 12 months if no start date
        whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
      }

      if (endDate) {
        whereClause += ' AND created_at <= ?';
        queryParams.push(endDate);
      }

      const [salesData] = await db.execute(
        `SELECT 
           DATE_FORMAT(created_at, '${dateFormat}') as period,
           COUNT(*) as sales_count,
           COALESCE(SUM(price), 0) as total_revenue,
           COALESCE(AVG(price), 0) as average_price,
           COALESCE(MIN(price), 0) as min_price,
           COALESCE(MAX(price), 0) as max_price
         FROM cars 
         ${whereClause}
         GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
         ORDER BY period DESC`,
        queryParams
      );

      const [topSellingModels] = await db.execute(
        `SELECT 
           brand as make, model, COUNT(*) as sales_count,
           COALESCE(SUM(price), 0) as total_revenue,
           COALESCE(AVG(price), 0) as average_price
         FROM cars 
         ${whereClause}
         GROUP BY brand, model
         ORDER BY sales_count DESC
         LIMIT 10`,
        queryParams
      );

      // Ensure we return valid data even if empty
      return {
        sales_by_period: salesData || [],
        top_selling_models: topSellingModels || []
      };
    } catch (error) {
      console.error('Dealer analytics error:', error);
      throw new Error(`Failed to get dealer sales analytics: ${error.message}`);
    }
  }
}

module.exports = new DealerService();
