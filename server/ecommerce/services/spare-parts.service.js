const { executeQuery } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

class SparePartsService {
  constructor() {
    this.tableName = 'spare_parts';
    this.categoriesTable = 'spare_parts_categories';
    this.brandsTable = 'spare_parts_brands';
    this.inventoryTable = 'spare_parts_inventory';
    this.compatibilityTable = 'spare_parts_vehicle_compatibility';
    this.priceComparisonTable = 'spare_parts_price_comparison';
    this.bundlesTable = 'spare_parts_bundles';
    this.bundleItemsTable = 'spare_parts_bundle_items';
    this.installationServicesTable = 'spare_parts_installation_services';
    this.warehousesTable = 'warehouses';
  }

  // Validate image paths - ensure they are file paths, not base64 data
  validateImagePaths(images) {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter(imagePath => {
      if (typeof imagePath !== 'string') {
        console.warn('Invalid image path type:', typeof imagePath);
        return false;
      }

      // Reject base64 data URLs
      if (imagePath.startsWith('data:image/')) {
        console.warn('Base64 image data detected and rejected. Use file upload endpoints instead.');
        return false;
      }

      // Accept file paths (local or external URLs)
      if (imagePath.startsWith('/uploads/') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return true;
      }

      console.warn('Invalid image path format:', imagePath);
      return false;
    });
  }

  // ==================== CORE CRUD OPERATIONS ====================

  async createSparePart(sparePartData) {
    const {
      sku,
      name,
      description,
      category_id,
      brand_id,
      price,
      currency = 'USD',
      seller_id,
      images = [],
      vehicle_compatibility = [],
      inventory_data = {},
      installation_services = [],
      quantity_available = 0,
      quantity_reserved = 0,
      reorder_point = 10,
      max_stock_level = null,
      cost_price = null,
      markup_percentage = null,
      weight = null,
      dimensions = null,
      warranty_period_months = 12,
      requires_installation = false
    } = sparePartData;

    // Validate images - ensure they are file paths, not base64 data
    const validatedImages = this.validateImagePaths(images);
    
    // Helper function to parse integer values (convert empty strings to default)
    const parseInteger = (value, defaultValue = 0) => {
      if (value === '' || value === null || value === undefined || value === 'null' || value === 'undefined') return defaultValue;
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };
    
    // Parse and sanitize only the fields actually used by client
    const parsedQuantityAvailable = parseInteger(quantity_available, 0);
    const parsedQuantityReserved = parseInteger(quantity_reserved, 0);
    const parsedReorderPoint = parseInteger(reorder_point, 10);
    const parsedWarrantyPeriod = parseInteger(warranty_period_months, 12);

    try {
      // Generate SKU if not provided
      const finalSku = sku || await this.generateSKU(name, brand_id);
      
      // Create spare part - only using fields actually sent by client
      const sparePartId = uuidv4();
      const insertQuery = `
        INSERT INTO ${this.tableName} 
        (id, sku, name, description, category_id, brand_id, price, currency, seller_id, images, 
         quantity_available, quantity_reserved, reorder_point, warranty_period_months, requires_installation,
         status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `;
      
      await executeQuery(insertQuery, [
        sparePartId, finalSku, name, description, category_id, brand_id, price, currency, seller_id, JSON.stringify(validatedImages),
        parsedQuantityAvailable, 
        parsedQuantityReserved, 
        parsedReorderPoint, 
        parsedWarrantyPeriod, 
        requires_installation
      ]);

      // Add vehicle compatibility
      if (vehicle_compatibility.length > 0) {
        await this.addVehicleCompatibility(sparePartId, vehicle_compatibility);
      }

      // Add inventory data (for additional inventory tracking if needed)
      if (Object.keys(inventory_data).length > 0) {
        await this.updateInventory(sparePartId, inventory_data);
      }

      // Add installation services
      if (installation_services.length > 0) {
        await this.addInstallationServices(sparePartId, installation_services);
      }

      return await this.getSparePartById(sparePartId);
    } catch (error) {
      console.error('Error creating spare part:', error);
      throw new Error(`Failed to create spare part: ${error.message}`);
    }
  }

  async getSparePartById(id) {
    try {
      const query = `
        SELECT 
          sp.*,
          c.name as category_name,
          c.parent_category_id as category_parent_id,
          b.name as brand_name,
          b.logo_url as brand_logo,
          s.business_name as seller_name,
          s.rating as seller_rating,
          s.review_count as seller_review_count
        FROM ${this.tableName} sp
        LEFT JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        LEFT JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN sellers s ON sp.seller_id = s.id
        WHERE sp.id = ?
      `;
      
      const result = await executeQuery(query, [id]);
      if (result.length === 0) {
        throw new Error('Spare part not found');
      }

      const sparePart = result[0];
      
      // Get vehicle compatibility
      sparePart.vehicle_compatibility = await this.getVehicleCompatibility(id);
      
      // Get price comparisons
      sparePart.price_comparisons = await this.getPriceComparisons(id);
      
      // Get installation services
      sparePart.installation_services = await this.getInstallationServices(id);

      return sparePart;
    } catch (error) {
      console.error('Error getting spare part:', error);
      throw new Error(`Failed to get spare part: ${error.message}`);
    }
  }

  async updateSparePart(id, updateData) {
    try {
      const {
        name,
        description,
        category_id,
        brand_id,
        price,
        currency,
        status,
        images,
        vehicle_compatibility,
        inventory_data,
        installation_services,
        quantity_available,
        quantity_reserved,
        reorder_point,
        max_stock_level,
        cost_price,
        markup_percentage,
        weight,
        dimensions,
        warranty_period_months,
        requires_installation
      } = updateData;

      // Update basic fields
      const updateFields = [];
      const updateValues = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (category_id !== undefined) {
        updateFields.push('category_id = ?');
        updateValues.push(category_id);
      }
      if (brand_id !== undefined) {
        updateFields.push('brand_id = ?');
        updateValues.push(brand_id);
      }
      if (price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(price);
      }
      if (currency !== undefined) {
        updateFields.push('currency = ?');
        updateValues.push(currency);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      if (images !== undefined) {
        updateFields.push('images = ?');
        updateValues.push(JSON.stringify(this.validateImagePaths(images || [])));
      }
      if (quantity_available !== undefined) {
        updateFields.push('quantity_available = ?');
        updateValues.push(quantity_available);
      }
      if (quantity_reserved !== undefined) {
        updateFields.push('quantity_reserved = ?');
        updateValues.push(quantity_reserved);
      }
      if (reorder_point !== undefined) {
        updateFields.push('reorder_point = ?');
        updateValues.push(reorder_point);
      }
      if (max_stock_level !== undefined) {
        updateFields.push('max_stock_level = ?');
        updateValues.push(max_stock_level);
      }
      if (cost_price !== undefined) {
        updateFields.push('cost_price = ?');
        updateValues.push(cost_price);
      }
      if (markup_percentage !== undefined) {
        updateFields.push('markup_percentage = ?');
        updateValues.push(markup_percentage);
      }
      if (weight !== undefined) {
        updateFields.push('weight = ?');
        updateValues.push(weight ? JSON.stringify(weight) : null);
      }
      if (dimensions !== undefined) {
        updateFields.push('dimensions = ?');
        updateValues.push(dimensions ? JSON.stringify(dimensions) : null);
      }
      if (warranty_period_months !== undefined) {
        updateFields.push('warranty_period_months = ?');
        updateValues.push(warranty_period_months);
      }
      if (requires_installation !== undefined) {
        updateFields.push('requires_installation = ?');
        updateValues.push(requires_installation);
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        const updateQuery = `
          UPDATE ${this.tableName} 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `;
        await executeQuery(updateQuery, updateValues);
      }

      // Update vehicle compatibility
      if (vehicle_compatibility !== undefined) {
        await this.updateVehicleCompatibility(id, vehicle_compatibility);
      }

      // Update inventory
      if (inventory_data !== undefined) {
        await this.updateInventory(id, inventory_data);
      }

      // Update installation services
      if (installation_services !== undefined) {
        await this.updateInstallationServices(id, installation_services);
      }

      return await this.getSparePartById(id);
    } catch (error) {
      console.error('Error updating spare part:', error);
      throw new Error(`Failed to update spare part: ${error.message}`);
    }
  }

  async deleteSparePart(id) {
    try {
      // First, check if the spare part exists
      const checkQuery = `SELECT id, name FROM ${this.tableName} WHERE id = ?`;
      const existingPart = await executeQuery(checkQuery, [id]);
      
      if (!existingPart || existingPart.length === 0) {
        throw new Error('Spare part not found');
      }

      console.log(`Deleting spare part: ${existingPart[0].name} (ID: ${id})`);

      // Delete related records in other tables
      // 1. Delete vehicle compatibility records
      const deleteCompatibilityQuery = `DELETE FROM ${this.compatibilityTable} WHERE spare_part_id = ?`;
      await executeQuery(deleteCompatibilityQuery, [id]);
      console.log('Deleted vehicle compatibility records');

      // 2. Delete from bundles items
      const deleteBundleItemsQuery = `DELETE FROM ${this.bundleItemsTable} WHERE spare_part_id = ?`;
      await executeQuery(deleteBundleItemsQuery, [id]);
      console.log('Deleted bundle items');

      // 3. Delete inventory records
      const deleteInventoryQuery = `DELETE FROM ${this.inventoryTable} WHERE spare_part_id = ?`;
      await executeQuery(deleteInventoryQuery, [id]);
      console.log('Deleted inventory records');

      // 4. Delete price comparison records
      const deletePriceComparisonQuery = `DELETE FROM ${this.priceComparisonTable} WHERE spare_part_id = ?`;
      await executeQuery(deletePriceComparisonQuery, [id]);
      console.log('Deleted price comparison records');

      // 5. Delete installation services
      const deleteInstallationQuery = `DELETE FROM ${this.installationServicesTable} WHERE spare_part_id = ?`;
      await executeQuery(deleteInstallationQuery, [id]);
      console.log('Deleted installation services');

      // 6. Delete the spare part images from disk
      const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
      const partDir = path.join(uploadsRoot, 'spare-parts', id);
      
      try {
        if (fs.existsSync(partDir)) {
          fs.rmSync(partDir, { recursive: true, force: true });
          console.log('Deleted image directory');
        }
      } catch (fsError) {
        console.warn('Could not delete image directory:', fsError.message);
      }

      // 7. Finally, delete the spare part record itself
      const deleteQuery = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const result = await executeQuery(deleteQuery, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Failed to delete spare part');
      }

      console.log(`Successfully deleted spare part: ${existingPart[0].name}`);
      return { success: true, message: `Spare part "${existingPart[0].name}" deleted successfully` };
    } catch (error) {
      console.error('Error deleting spare part:', error);
      throw new Error(`Failed to delete spare part: ${error.message}`);
    }
  }

  // ==================== ADVANCED SEARCH AND FILTERING ====================

  async searchSpareParts(searchParams) {
    try {
      // Ensure MySQL sort buffer is optimized for large queries
      try {
        await executeQuery('SET SESSION sort_buffer_size = 8388608'); // 8MB
        await executeQuery('SET SESSION read_rnd_buffer_size = 4194304'); // 4MB
        await executeQuery('SET SESSION join_buffer_size = 4194304'); // 4MB
      } catch (e) { 
        console.warn('Could not set MySQL session variables:', e.message);
      }

      // Ensure supporting indexes exist (best-effort, runs once per process)
      if (!this._indexesEnsured) {
        try {
          // Create composite index for seller_id + created_at (most important for sorting)
          const sellerCreatedIdx = await executeQuery(
            `SELECT COUNT(1) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = 'idx_spare_parts_seller_created'`,
            [this.tableName]
          );
          if ((sellerCreatedIdx[0]?.cnt || 0) === 0) {
            await executeQuery(`CREATE INDEX idx_spare_parts_seller_created ON ${this.tableName} (seller_id, created_at DESC)`);
          }
        } catch (e) { /* ignore */ }
        try {
          // Create composite index for seller_id + quantity + created_at
          const idxCheck = await executeQuery(
            `SELECT COUNT(1) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = 'idx_spare_parts_seller_qty_created'`,
            [this.tableName]
          );
          if ((idxCheck[0]?.cnt || 0) === 0) {
            await executeQuery(`CREATE INDEX idx_spare_parts_seller_qty_created ON ${this.tableName} (seller_id, quantity_available, created_at DESC)`);
          }
        } catch (e) { /* ignore */ }
        try {
          const catIdx = await executeQuery(
            `SELECT COUNT(1) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = 'idx_spare_parts_category'`,
            [this.tableName]
          );
          if ((catIdx[0]?.cnt || 0) === 0) {
            await executeQuery(`CREATE INDEX idx_spare_parts_category ON ${this.tableName} (category_id)`);
          }
        } catch (e) { /* ignore */ }
        try {
          const brandIdx = await executeQuery(
            `SELECT COUNT(1) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = 'idx_spare_parts_brand'`,
            [this.tableName]
          );
          if ((brandIdx[0]?.cnt || 0) === 0) {
            await executeQuery(`CREATE INDEX idx_spare_parts_brand ON ${this.tableName} (brand_id)`);
          }
        } catch (e) { /* ignore */ }
        try {
          // Create index for status filtering
          const statusIdx = await executeQuery(
            `SELECT COUNT(1) AS cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = 'idx_spare_parts_status'`,
            [this.tableName]
          );
          if ((statusIdx[0]?.cnt || 0) === 0) {
            await executeQuery(`CREATE INDEX idx_spare_parts_status ON ${this.tableName} (status)`);
          }
        } catch (e) { /* ignore */ }
        this._indexesEnsured = true;
      }
      const {
        query,
        category_id,
        brand_id,
        seller_id,
        price_min,
        price_max,
        vehicle_make,
        vehicle_model,
        vehicle_year_from,
        vehicle_year_to,
        engine_type,
        fuel_type,
        transmission_type,
        availability_status = 'in_stock',
        sort_by = 'relevance',
        sort_order = 'DESC',
        page = 1,
        limit = 20,
        location_radius,
        user_latitude,
        user_longitude
      } = searchParams;

      const offset = (page - 1) * limit;
      const conditions = [];
      const queryParams = [];
      

      // Basic search conditions
      if (query) {
        conditions.push(`(sp.name LIKE ? OR sp.description LIKE ? OR sp.sku LIKE ?)`);
        const searchTerm = `%${query}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (category_id) {
        conditions.push(`sp.category_id = ?`);
        queryParams.push(category_id);
      }

      if (brand_id) {
        conditions.push(`sp.brand_id = ?`);
        queryParams.push(brand_id);
      }

      if (seller_id && seller_id !== 'undefined' && seller_id !== 'null') {
        conditions.push(`sp.seller_id = ?`);
        queryParams.push(seller_id);
      }

      if (price_min !== undefined) {
        conditions.push(`sp.price >= ?`);
        queryParams.push(price_min);
      }

      if (price_max !== undefined) {
        conditions.push(`sp.price <= ?`);
        queryParams.push(price_max);
      }

      // Vehicle compatibility conditions
      if (vehicle_make || vehicle_model || vehicle_year_from || vehicle_year_to || engine_type || fuel_type || transmission_type) {
        const vehicleConditions = [];
        
        if (vehicle_make) {
          vehicleConditions.push(`vc.vehicle_make = ?`);
          queryParams.push(vehicle_make);
        }
        
        if (vehicle_model) {
          vehicleConditions.push(`vc.vehicle_model = ?`);
          queryParams.push(vehicle_model);
        }
        
        if (vehicle_year_from) {
          vehicleConditions.push(`vc.vehicle_year_to >= ?`);
          queryParams.push(vehicle_year_from);
        }
        
        if (vehicle_year_to) {
          vehicleConditions.push(`vc.vehicle_year_from <= ?`);
          queryParams.push(vehicle_year_to);
        }
        
        if (engine_type) {
          vehicleConditions.push(`vc.engine_type = ?`);
          queryParams.push(engine_type);
        }
        
        if (fuel_type) {
          vehicleConditions.push(`vc.fuel_type = ?`);
          queryParams.push(fuel_type);
        }
        
        if (transmission_type) {
          vehicleConditions.push(`vc.transmission_type = ?`);
          queryParams.push(transmission_type);
        }

        if (vehicleConditions.length > 0) {
          conditions.push(`sp.id IN (
            SELECT DISTINCT spare_part_id 
            FROM ${this.compatibilityTable} vc 
            WHERE ${vehicleConditions.join(' AND ')}
          )`);
        }
      }

      // Availability status - only add if explicitly requested
      if (availability_status === 'in_stock') {
        conditions.push(`sp.quantity_available > 0`);
      } else if (availability_status === 'low_stock') {
        conditions.push(`sp.quantity_available > 0 AND sp.quantity_available <= sp.reorder_point`);
      } else if (availability_status === 'out_of_stock') {
        conditions.push(`(sp.quantity_available = 0 OR sp.quantity_available IS NULL)`);
      }
      // Note: Removed default availability condition to prevent parameter mismatches

      // Location-based filtering is disabled since warehouses table was dropped
      if (location_radius && user_latitude && user_longitude) {
        console.warn('Location-based filtering is not available - warehouses table not found');
      }

      // Build the main query
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Sorting
      let orderBy = 'sp.created_at DESC';
      let orderByParams = [];
      
      if (sort_by === 'price') {
        orderBy = `sp.price ${sort_order}`;
      } else if (sort_by === 'name') {
        orderBy = `sp.name ${sort_order}`;
      } else if (sort_by === 'rating') {
        orderBy = `d.rating ${sort_order}`;
      } else if (sort_by === 'relevance' && query) {
        orderBy = `
          CASE 
            WHEN sp.name LIKE ? THEN 1
            WHEN sp.description LIKE ? THEN 2
            WHEN sp.sku LIKE ? THEN 3
            ELSE 4
          END, sp.created_at DESC
        `;
        // Add parameters for the ORDER BY CASE statement
        const searchTerm = `%${query}%`;
        orderByParams = [searchTerm, searchTerm, searchTerm];
      }

      // Build the main query with proper parameter handling
      const searchQuery = `
        SELECT
          sp.id,
          sp.sku,
          sp.name,
          sp.description,
          sp.category_id,
          sp.brand_id,
          sp.images,
          sp.price,
          sp.currency,
          sp.seller_id,
          sp.status,
          sp.created_at,
          sp.updated_at,
          c.name as category_name,
          b.name as brand_name,
          sp.quantity_available,
          sp.quantity_reserved,
          sp.reorder_point,
          sp.max_stock_level,
          sp.last_restocked_at,
          sp.last_sold_at
        FROM ${this.tableName} sp
        LEFT JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        LEFT JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        ${whereClause}
        GROUP BY sp.id
        ORDER BY ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Combine all parameters in the correct order
      // First add WHERE clause parameters, then ORDER BY parameters (LIMIT/OFFSET now use string interpolation)
      const finalQueryParams = [...queryParams];
      if (orderByParams.length > 0) {
        finalQueryParams.push(...orderByParams);
      }
      
      // COMPREHENSIVE PARAMETER VALIDATION AND DEBUGGING
      console.log('=== COMPREHENSIVE MYSQL DEBUG ===');
      console.log('Search params:', JSON.stringify(searchParams, null, 2));
      console.log('Conditions:', conditions);
      console.log('Where clause:', whereClause);
      console.log('Order by:', orderBy);
      console.log('QueryParams (WHERE):', queryParams);
      console.log('OrderByParams:', orderByParams);
      console.log('Final Parameters:', finalQueryParams);
      console.log('Parameter count:', finalQueryParams.length);
      
      // Count placeholders in the query
      const placeholderCount = (searchQuery.match(/\?/g) || []).length;
      console.log('Placeholder count in query:', placeholderCount);
      console.log('Parameter vs Placeholder match:', finalQueryParams.length === placeholderCount ? '✅ MATCH' : '❌ MISMATCH');
      
      // Validate each parameter
      finalQueryParams.forEach((param, index) => {
        console.log(`Parameter ${index}:`, typeof param, param === null ? 'NULL' : param === undefined ? 'UNDEFINED' : param);
      });
      
      console.log('Final query:', searchQuery);
      console.log('================================');
      
      // PARAMETER VALIDATION AND SANITIZATION
      const sanitizedParams = finalQueryParams.map(param => {
        if (param === null || param === undefined) {
          console.warn('Found null/undefined parameter, converting to empty string');
          return '';
        }
        if (typeof param === 'string' && (param === 'undefined' || param === 'null')) {
          console.warn('Found string "undefined"/"null", converting to empty string');
          return '';
        }
        return param;
      });
      
      // PARAMETER COUNT VALIDATION
      if (sanitizedParams.length !== placeholderCount) {
        console.error('PARAMETER MISMATCH DETECTED!');
        console.error('Expected parameters:', placeholderCount);
        console.error('Actual parameters:', sanitizedParams.length);
        console.error('Query:', searchQuery);
        console.error('Parameters:', sanitizedParams);
        
        // Try to fix the mismatch by adjusting parameters
        if (sanitizedParams.length < placeholderCount) {
          console.log('Adding missing parameters...');
          while (sanitizedParams.length < placeholderCount) {
            sanitizedParams.push('');
          }
        } else if (sanitizedParams.length > placeholderCount) {
          console.log('Removing excess parameters...');
          sanitizedParams.splice(placeholderCount);
        }
        console.log('Adjusted parameters:', sanitizedParams);
      }
      
      // MULTIPLE EXECUTION ATTEMPTS WITH FALLBACKS
      let results;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Execution attempt ${attempts}/${maxAttempts}`);
          
          // Attempt 1: Use sanitized parameters
          if (attempts === 1) {
            results = await executeQuery(searchQuery, sanitizedParams);
          }
          // Attempt 2: Use original parameters with additional validation
          else if (attempts === 2) {
            const validatedParams = finalQueryParams.filter(param => 
              param !== null && param !== undefined && param !== 'undefined' && param !== 'null'
            );
            console.log('Attempt 2 - Validated parameters:', validatedParams);
            results = await executeQuery(searchQuery, validatedParams);
          }
          // Attempt 3: Use a simplified query without complex conditions
          else if (attempts === 3) {
            console.log('Attempt 3 - Using simplified query');
            const simpleQuery = `
              SELECT
                sp.id,
                sp.sku,
                sp.name,
                sp.description,
                sp.category_id,
                sp.brand_id,
                sp.images,
                sp.price,
                sp.currency,
                sp.seller_id,
                sp.status,
                sp.created_at,
                sp.updated_at,
                c.name as category_name,
                b.name as brand_name,
                sp.quantity_available,
                sp.quantity_reserved,
                sp.reorder_point,
                sp.max_stock_level,
                sp.last_restocked_at,
                sp.last_sold_at
              FROM ${this.tableName} sp
              LEFT JOIN ${this.categoriesTable} c ON sp.category_id = c.id
              LEFT JOIN ${this.brandsTable} b ON sp.brand_id = b.id
              WHERE sp.seller_id = ?
              GROUP BY sp.id
              ORDER BY sp.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `;
            const simpleParams = [seller_id || ''];
            console.log('Simple query parameters:', simpleParams);
            results = await executeQuery(simpleQuery, simpleParams);
          }
          
          console.log(`✅ Query executed successfully on attempt ${attempts}`);
          break;
          
        } catch (error) {
          console.error(`❌ Attempt ${attempts} failed:`, error.message);
          if (attempts === maxAttempts) {
            console.error('All execution attempts failed');
            throw error;
          }
          console.log('Retrying with different approach...');
        }
      }

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ${this.tableName} sp
        ${whereClause}
      `;

      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult[0].total;

      return {
        spare_parts: results,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
          has_next: page * limit < total,
          has_prev: page > 1
        }
      };
    } catch (error) {
      console.error('Error searching spare parts:', error);
      throw new Error(`Failed to search spare parts: ${error.message}`);
    }
  }

  // ==================== INVENTORY MANAGEMENT ====================

  // Simple method to update stock in main spare_parts table
  async updateStock(sparePartId, quantity) {
    try {
      const updateQuery = `
        UPDATE ${this.tableName} 
        SET quantity_available = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, [quantity, sparePartId]);
      
      return {
        success: true,
        message: `Stock updated to ${quantity} units`,
        spare_part_id: sparePartId,
        quantity_available: quantity
      };
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  }

  // Increase stock (existing + new purchases) directly on main table
  async restockStock(sparePartId, quantityAdded, costPerUnit = null) {
    try {
      const updateQuery = `
        UPDATE ${this.tableName}
        SET quantity_available = quantity_available + ?,
            last_restocked_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [quantityAdded, sparePartId]);

      return {
        success: true,
        message: `Restocked ${quantityAdded} units`,
        spare_part_id: sparePartId,
        quantity_added: quantityAdded
      };
    } catch (error) {
      console.error('Error restocking:', error);
      throw new Error(`Failed to restock: ${error.message}`);
    }
  }

  async updateInventory(sparePartId, inventoryData) {
    try {
      const {
        warehouse_id,
        quantity_available,
        quantity_reserved = 0,
        quantity_on_order = 0,
        reorder_point,
        reorder_quantity
      } = inventoryData;

      // Check if inventory record exists
      const existingQuery = `
        SELECT id FROM ${this.inventoryTable} 
        WHERE spare_part_id = ? AND warehouse_id = ?
      `;
      const existing = await executeQuery(existingQuery, [sparePartId, warehouse_id]);

      if (existing.length > 0) {
        // Update existing inventory
        const updateQuery = `
          UPDATE ${this.inventoryTable} 
          SET quantity_available = ?, 
              quantity_reserved = ?, 
              quantity_on_order = ?, 
              reorder_point = ?, 
              reorder_quantity = ?,
              updated_at = NOW()
          WHERE spare_part_id = ? AND warehouse_id = ?
        `;
        await executeQuery(updateQuery, [
          quantity_available, quantity_reserved, quantity_on_order, 
          reorder_point, reorder_quantity, sparePartId, warehouse_id
        ]);
      } else {
        // Create new inventory record
        const insertQuery = `
          INSERT INTO ${this.inventoryTable} 
          (id, spare_part_id, warehouse_id, quantity_available, quantity_reserved, 
           quantity_on_order, reorder_point, reorder_quantity, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        await executeQuery(insertQuery, [
          uuidv4(), sparePartId, warehouse_id, quantity_available, 
          quantity_reserved, quantity_on_order, reorder_point, reorder_quantity
        ]);
      }

      return { success: true, message: 'Inventory updated successfully' };
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw new Error(`Failed to update inventory: ${error.message}`);
    }
  }

  async reserveInventory(sparePartId, warehouseId, quantity) {
    try {
      // Update basic fields
        // Check available quantity
        const checkQuery = `
          SELECT quantity_available, quantity_reserved 
          FROM ${this.inventoryTable} 
          WHERE spare_part_id = ? AND warehouse_id = ?
        `;
        const inventory = await executeQuery(checkQuery, [sparePartId, warehouseId]);

        if (inventory.length === 0) {
          throw new Error('Inventory record not found');
        }

        const { quantity_available, quantity_reserved } = inventory[0];
        const newReserved = quantity_reserved + quantity;

        if (newReserved > quantity_available) {
          throw new Error('Insufficient inventory available');
        }

        // Update reserved quantity
        const updateQuery = `
          UPDATE ${this.inventoryTable} 
          SET quantity_reserved = ?, updated_at = NOW()
          WHERE spare_part_id = ? AND warehouse_id = ?
        `;
        await executeQuery(updateQuery, [newReserved, sparePartId, warehouseId]);

        return { success: true, reserved_quantity: newReserved };
    } catch (error) {
      console.error('Error reserving inventory:', error);
      throw new Error(`Failed to reserve inventory: ${error.message}`);
    }
  }

  async releaseInventory(sparePartId, warehouseId, quantity) {
    try {
      const updateQuery = `
        UPDATE ${this.inventoryTable} 
        SET quantity_reserved = GREATEST(0, quantity_reserved - ?),
            updated_at = NOW()
        WHERE spare_part_id = ? AND warehouse_id = ?
      `;
      
      const result = await executeQuery(updateQuery, [quantity, sparePartId, warehouseId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Inventory record not found');
      }

      return { success: true, message: 'Inventory released successfully' };
    } catch (error) {
      console.error('Error releasing inventory:', error);
      throw new Error(`Failed to release inventory: ${error.message}`);
    }
  }

  async sellInventory(sparePartId, warehouseId, quantity) {
    try {
      // Update basic fields
        // Check available quantity
        const checkQuery = `
          SELECT quantity_available, quantity_reserved 
          FROM ${this.inventoryTable} 
          WHERE spare_part_id = ? AND warehouse_id = ?
        `;
        const inventory = await executeQuery(checkQuery, [sparePartId, warehouseId]);

        if (inventory.length === 0) {
          // Fallback: decrement from main spare_parts table if no per-warehouse inventory
          const fallbackQuery = `
            UPDATE ${this.tableName}
            SET quantity_available = GREATEST(0, quantity_available - ?),
                last_sold_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
          `;
          await executeQuery(fallbackQuery, [quantity, sparePartId]);
          return { success: true };
        }

        const { quantity_available, quantity_reserved } = inventory[0];
        const newAvailable = quantity_available - quantity;

        if (newAvailable < 0) {
          throw new Error('Insufficient inventory available');
        }

        // Update inventory
        const updateQuery = `
          UPDATE ${this.inventoryTable} 
          SET quantity_available = ?, 
              last_sold_at = NOW(),
              updated_at = NOW()
          WHERE spare_part_id = ? AND warehouse_id = ?
        `;
        await executeQuery(updateQuery, [newAvailable, sparePartId, warehouseId]);

        // Also keep the main table in sync with total available
        const syncMainQuery = `
          UPDATE ${this.tableName}
          SET quantity_available = GREATEST(0, quantity_available - ?),
              last_sold_at = NOW(),
              updated_at = NOW()
          WHERE id = ?
        `;
        await executeQuery(syncMainQuery, [quantity, sparePartId]);

        return { success: true, remaining_quantity: newAvailable };
    } catch (error) {
      console.error('Error selling inventory:', error);
      throw new Error(`Failed to sell inventory: ${error.message}`);
    }
  }

  async getLowStockItems(sellerId = null) {
    try {
      let whereClause = 'si.quantity_available <= si.reorder_point';
      const queryParams = [];

      if (sellerId) {
        whereClause += ' AND sp.seller_id = ?';
        queryParams.push(sellerId);
      }

      const query = `
        SELECT 
          sp.id,
          sp.sku,
          sp.name,
          sp.price,
          sp.currency,
          b.name as brand_name,
          c.name as category_name,
          si.quantity_available,
          si.reorder_point,
          si.reorder_quantity,
          w.name as warehouse_name,
          w.city as warehouse_city
        FROM ${this.tableName} sp
        JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.warehousesTable} w ON si.warehouse_id = w.id
        WHERE ${whereClause}
        ORDER BY si.quantity_available ASC
      `;

      return await executeQuery(query, queryParams);
    } catch (error) {
      console.error('Error getting low stock items:', error);
      throw new Error(`Failed to get low stock items: ${error.message}`);
    }
  }

  // ==================== VEHICLE COMPATIBILITY ====================

  async addVehicleCompatibility(sparePartId, compatibilityData) {
    try {
      const insertQuery = `
        INSERT INTO ${this.compatibilityTable} 
        (id, spare_part_id, vehicle_make, vehicle_model, vehicle_year_from, vehicle_year_to,
         engine_type, engine_size, fuel_type, transmission_type, body_type, trim_level,
         notes, compatibility_confidence, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      for (const compatibility of compatibilityData) {
        await executeQuery(insertQuery, [
          uuidv4(),
          sparePartId,
          compatibility.vehicle_make,
          compatibility.vehicle_model,
          compatibility.vehicle_year_from,
          compatibility.vehicle_year_to,
          compatibility.engine_type || null,
          compatibility.engine_size || null,
          compatibility.fuel_type || null,
          compatibility.transmission_type || null,
          compatibility.body_type || null,
          compatibility.trim_level || null,
          compatibility.notes || null,
          compatibility.compatibility_confidence || 1.0
        ]);
      }

      return { success: true, message: 'Vehicle compatibility added successfully' };
    } catch (error) {
      console.error('Error adding vehicle compatibility:', error);
      throw new Error(`Failed to add vehicle compatibility: ${error.message}`);
    }
  }

  async getVehicleCompatibility(sparePartId) {
    try {
      const query = `
        SELECT * FROM ${this.compatibilityTable} 
        WHERE spare_part_id = ?
        ORDER BY compatibility_confidence DESC, vehicle_year_from ASC
      `;
      return await executeQuery(query, [sparePartId]);
    } catch (error) {
      console.error('Error getting vehicle compatibility:', error);
      throw new Error(`Failed to get vehicle compatibility: ${error.message}`);
    }
  }

  async updateVehicleCompatibility(sparePartId, compatibilityData) {
    try {
      // Update basic fields
        // Delete existing compatibility records
        const deleteQuery = `DELETE FROM ${this.compatibilityTable} WHERE spare_part_id = ?`;
        await executeQuery(deleteQuery, [sparePartId]);

        // Add new compatibility records
        if (compatibilityData.length > 0) {
          await this.addVehicleCompatibility(sparePartId, compatibilityData);
        }

        return { success: true, message: 'Vehicle compatibility updated successfully' };
    } catch (error) {
      console.error('Error updating vehicle compatibility:', error);
      throw new Error(`Failed to update vehicle compatibility: ${error.message}`);
    }
  }

  async findCompatibleParts(vehicleData) {
    try {
      const {
        vehicle_make,
        vehicle_model,
        vehicle_year,
        engine_type,
        fuel_type,
        transmission_type
      } = vehicleData;

      const conditions = [];
      const queryParams = [];

      conditions.push(`vc.vehicle_make = ?`);
      queryParams.push(vehicle_make);

      if (vehicle_model) {
        conditions.push(`vc.vehicle_model = ?`);
        queryParams.push(vehicle_model);
      }

      if (vehicle_year) {
        conditions.push(`vc.vehicle_year_from <= ? AND vc.vehicle_year_to >= ?`);
        queryParams.push(vehicle_year, vehicle_year);
      }

      if (engine_type) {
        conditions.push(`vc.engine_type = ?`);
        queryParams.push(engine_type);
      }

      if (fuel_type) {
        conditions.push(`vc.fuel_type = ?`);
        queryParams.push(fuel_type);
      }

      if (transmission_type) {
        conditions.push(`vc.transmission_type = ?`);
        queryParams.push(transmission_type);
      }

      const query = `
        SELECT
          sp.*,
          c.name as category_name,
          b.name as brand_name,
          vc.compatibility_confidence,
          vc.vehicle_year_from,
          vc.vehicle_year_to,
          vc.engine_type,
          vc.fuel_type,
          vc.transmission_type,
          si.quantity_available
        FROM ${this.tableName} sp
        JOIN ${this.compatibilityTable} vc ON sp.id = vc.spare_part_id
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        WHERE ${conditions.join(' AND ')}
        AND sp.status = 'active'
        GROUP BY sp.id
        ORDER BY vc.compatibility_confidence DESC, sp.price ASC
      `;

      return await executeQuery(query, queryParams);
    } catch (error) {
      console.error('Error finding compatible parts:', error);
      throw new Error(`Failed to find compatible parts: ${error.message}`);
    }
  }

  // ==================== PRICE COMPARISON ====================

  async addPriceComparison(sparePartId, comparisonData) {
    try {
      const {
        competitor_name,
        competitor_url,
        competitor_price,
        competitor_currency,
        shipping_cost = 0,
        availability_status = 'unknown'
      } = comparisonData;

      const totalCost = competitor_price + shipping_cost;

      const insertQuery = `
        INSERT INTO ${this.priceComparisonTable} 
        (id, spare_part_id, competitor_name, competitor_url, competitor_price,
         competitor_currency, last_checked_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
      `;

      await executeQuery(insertQuery, [
        uuidv4(), sparePartId, competitor_name, competitor_url, competitor_price,
        competitor_currency
      ]);

      return { success: true, message: 'Price comparison added successfully' };
    } catch (error) {
      console.error('Error adding price comparison:', error);
      throw new Error(`Failed to add price comparison: ${error.message}`);
    }
  }

  async getPriceComparisons(sparePartId) {
    try {
      const query = `
        SELECT * FROM ${this.priceComparisonTable} 
        WHERE spare_part_id = ?
        ORDER BY competitor_price ASC, last_checked_at DESC
      `;
      return await executeQuery(query, [sparePartId]);
    } catch (error) {
      console.error('Error getting price comparisons:', error);
      throw new Error(`Failed to get price comparisons: ${error.message}`);
    }
  }

  async getPriceAnalysis(sparePartId) {
    try {
      const query = `
        SELECT 
          sp.price as our_price,
          sp.currency as our_currency,
          AVG(pc.competitor_price) as avg_competitor_price,
          MIN(pc.competitor_price) as min_competitor_price,
          MAX(pc.competitor_price) as max_competitor_price,
          COUNT(pc.id) as competitor_count
        FROM ${this.tableName} sp
        LEFT JOIN ${this.priceComparisonTable} pc ON sp.id = pc.spare_part_id
        WHERE sp.id = ?
        GROUP BY sp.id, sp.price, sp.currency
      `;

      const result = await executeQuery(query, [sparePartId]);
      if (result.length === 0) {
        throw new Error('Spare part not found');
      }

      const analysis = result[0];
      
      // Calculate price competitiveness
      if (analysis.avg_competitor_price) {
        analysis.price_difference = analysis.our_price - analysis.avg_competitor_price;
        analysis.price_difference_percentage = (analysis.price_difference / analysis.avg_competitor_price) * 100;
        analysis.is_competitive = analysis.price_difference_percentage <= 10; // Within 10% is competitive
      }

      return analysis;
    } catch (error) {
      console.error('Error getting price analysis:', error);
      throw new Error(`Failed to get price analysis: ${error.message}`);
    }
  }

  // ==================== BUNDLE MANAGEMENT ====================

  async createBundle(bundleData) {
    try {
      const {
        name,
        description,
        bundle_type,
        total_price,
        bundle_discount,
        currency = 'USD',
        target_vehicle_make,
        target_vehicle_model,
        target_vehicle_year_from,
        target_vehicle_year_to,
        installation_included = false,
        installation_cost = 0,
        warranty_period,
        seller_id,
        items = []
      } = bundleData;

      // Update basic fields
        // Create bundle
        const bundleId = uuidv4();
        const insertQuery = `
          INSERT INTO ${this.bundlesTable} 
          (id, name, description, bundle_type, total_price, bundle_discount, currency,
           target_vehicle_make, target_vehicle_model, target_vehicle_year_from, target_vehicle_year_to,
           installation_included, installation_cost, warranty_period, seller_id, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
        `;

        await executeQuery(insertQuery, [
          bundleId, name, description, bundle_type, total_price, bundle_discount, currency,
          target_vehicle_make, target_vehicle_model, target_vehicle_year_from, target_vehicle_year_to,
          installation_included, installation_cost, warranty_period, seller_id
        ]);

        // Add bundle items
        if (items.length > 0) {
          await this.addBundleItems(bundleId, items);
        }

        return await this.getBundleById(bundleId);
    } catch (error) {
      console.error('Error creating bundle:', error);
      throw new Error(`Failed to create bundle: ${error.message}`);
    }
  }

  async addBundleItems(bundleId, items) {
    try {
      const insertQuery = `
        INSERT INTO ${this.bundleItemsTable} 
        (id, bundle_id, spare_part_id, quantity, unit_price, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      for (const item of items) {
        await executeQuery(insertQuery, [
          uuidv4(), bundleId, item.spare_part_id, item.quantity, item.unit_price
        ]);
      }

      return { success: true, message: 'Bundle items added successfully' };
    } catch (error) {
      console.error('Error adding bundle items:', error);
      throw new Error(`Failed to add bundle items: ${error.message}`);
    }
  }

  async getBundleById(bundleId) {
    try {
      const query = `
        SELECT 
          b.*,
          s.business_name as seller_name,
          s.rating as seller_rating
        FROM ${this.bundlesTable} b
        LEFT JOIN sellers s ON b.seller_id = s.id
        WHERE b.id = ?
      `;

      const result = await executeQuery(query, [bundleId]);
      if (result.length === 0) {
        throw new Error('Bundle not found');
      }

      const bundle = result[0];

      // Get bundle items
      const itemsQuery = `
        SELECT 
          bi.*,
          sp.name as spare_part_name,
          sp.sku as spare_part_sku,
          sp.description as spare_part_description,
          b.name as brand_name,
          c.name as category_name
        FROM ${this.bundleItemsTable} bi
        JOIN ${this.tableName} sp ON bi.spare_part_id = sp.id
        JOIN ${this.brandsTable} b ON sp.brand_id = b.id
        JOIN ${this.categoriesTable} c ON sp.category_id = c.id
        WHERE bi.bundle_id = ?
        ORDER BY bi.created_at ASC
      `;

      bundle.items = await executeQuery(itemsQuery, [bundleId]);

      return bundle;
    } catch (error) {
      console.error('Error getting bundle:', error);
      throw new Error(`Failed to get bundle: ${error.message}`);
    }
  }

  // ==================== INSTALLATION SERVICES ====================

  async addInstallationServices(sparePartId, services) {
    try {
      const insertQuery = `
        INSERT INTO ${this.installationServicesTable} 
        (id, spare_part_id, service_name, service_description,
         service_price, currency, estimated_duration_hours, is_available, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `;

      for (const service of services) {
        await executeQuery(insertQuery, [
          uuidv4(), sparePartId, service.service_name,
          service.service_description, service.service_price || service.base_price, service.currency || 'USD',
          service.estimated_duration_hours || service.estimated_duration, service.is_available !== false
        ]);
      }

      return { success: true, message: 'Installation services added successfully' };
    } catch (error) {
      console.error('Error adding installation services:', error);
      throw new Error(`Failed to add installation services: ${error.message}`);
    }
  }

  async getInstallationServices(sparePartId) {
    try {
      const query = `
        SELECT 
          ins.*
        FROM ${this.installationServicesTable} ins
        WHERE ins.spare_part_id = ? AND ins.is_available = 1
        ORDER BY ins.service_price ASC
      `;
      return await executeQuery(query, [sparePartId]);
    } catch (error) {
      console.error('Error getting installation services:', error);
      throw new Error(`Failed to get installation services: ${error.message}`);
    }
  }

  async updateInstallationServices(sparePartId, services) {
    try {
      // Update basic fields
        // Delete existing services
        const deleteQuery = `DELETE FROM ${this.installationServicesTable} WHERE spare_part_id = ?`;
        await executeQuery(deleteQuery, [sparePartId]);

        // Add new services
        if (services.length > 0) {
          await this.addInstallationServices(sparePartId, services);
        }

        return { success: true, message: 'Installation services updated successfully' };
    } catch (error) {
      console.error('Error updating installation services:', error);
      throw new Error(`Failed to update installation services: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  async generateSKU(name, brandId) {
    try {
      // Get brand abbreviation
      const brandQuery = `SELECT name FROM ${this.brandsTable} WHERE id = ?`;
      const brandResult = await executeQuery(brandQuery, [brandId]);
      const brandName = brandResult.length > 0 ? brandResult[0].name : 'UNK';

      // Generate SKU: BRAND-NAME-YYYYMMDD-HHMMSS
      const brandAbbr = brandName.substring(0, 3).toUpperCase();
      const nameAbbr = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 12);

      return `${brandAbbr}-${nameAbbr}-${timestamp}`;
    } catch (error) {
      console.error('Error generating SKU:', error);
      return `SP-${Date.now()}`;
    }
  }

  async getCategories() {
    try {
      const query = `
        SELECT * FROM ${this.categoriesTable} 
        WHERE is_active = 1
        ORDER BY sort_order ASC, name ASC
      `;
      return await executeQuery(query);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async getBrands() {
    try {
      const query = `
        SELECT * FROM ${this.brandsTable} 
        WHERE is_active = 1
        ORDER BY name ASC
      `;
      return await executeQuery(query);
    } catch (error) {
      console.error('Error getting brands:', error);
      throw new Error(`Failed to get brands: ${error.message}`);
    }
  }

  async getSellerStats(sellerId) {
    try {
      const query = `
        SELECT 
          COUNT(sp.id) as total_parts,
          COUNT(CASE WHEN sp.status = 'active' THEN 1 END) as active_parts,
          COUNT(CASE WHEN sp.status = 'inactive' THEN 1 END) as inactive_parts,
          AVG(sp.price) as avg_price,
          SUM(si.quantity_available) as total_inventory,
          COUNT(CASE WHEN si.quantity_available <= si.reorder_point THEN 1 END) as low_stock_items
        FROM ${this.tableName} sp
        LEFT JOIN ${this.inventoryTable} si ON sp.id = si.spare_part_id
        WHERE sp.seller_id = ?
      `;

      const result = await executeQuery(query, [sellerId]);
      return result[0];
    } catch (error) {
      console.error('Error getting seller stats:', error);
      throw new Error(`Failed to get seller stats: ${error.message}`);
    }
  }
}

module.exports = new SparePartsService();
