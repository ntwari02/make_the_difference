const { executeQuery } = require('../config/database');
const crypto = require('crypto');

async function addSampleCars() {
  try {
    // Get the seller user ID
    const users = await executeQuery('SELECT id FROM users WHERE email = ? AND role = ?', ['s@e.com', 'seller']);
    if (users.length === 0) {
      console.log('❌ Seller user not found');
      return;
    }
    const sellerId = users[0].id;
    console.log('✅ Found seller ID:', sellerId);

    // Sample cars data
    const sampleCars = [
      {
        title: '2020 Toyota Camry LE',
        description: 'Well-maintained Toyota Camry with low mileage. Perfect for daily commuting.',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 25000,
        price: 22000,
        currency: 'USD',
        car_condition: 'used',
        fuel_type: 'petrol',
        transmission: 'automatic',
        body_type: 'sedan',
        color: 'Silver',
        engine_size: '2.5L',
        horsepower: 203,
        location: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        images: JSON.stringify(['https://images.unsplash.com/photo-1549317336-206569e8475c?w=800']),
        features: JSON.stringify(['Bluetooth', 'Backup Camera', 'Cruise Control', 'Heated Seats']),
        status: 'active',
        seller_id: sellerId
      },
      {
        title: '2019 Honda Civic Sport',
        description: 'Sporty Honda Civic with excellent fuel economy and modern features.',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        mileage: 32000,
        price: 19500,
        currency: 'USD',
        car_condition: 'used',
        fuel_type: 'petrol',
        transmission: 'manual',
        body_type: 'sedan',
        color: 'Blue',
        engine_size: '1.5L',
        horsepower: 158,
        location: 'Los Angeles, CA',
        latitude: 34.0522,
        longitude: -118.2437,
        images: JSON.stringify(['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800']),
        features: JSON.stringify(['Apple CarPlay', 'Android Auto', 'Lane Departure Warning', 'Adaptive Cruise Control']),
        status: 'active',
        seller_id: sellerId
      },
      {
        title: '2021 Ford F-150 XLT',
        description: 'Powerful pickup truck perfect for work and recreation.',
        brand: 'Ford',
        model: 'F-150',
        year: 2021,
        mileage: 18000,
        price: 45000,
        currency: 'USD',
        car_condition: 'used',
        fuel_type: 'petrol',
        transmission: 'automatic',
        body_type: 'pickup',
        color: 'White',
        engine_size: '3.5L',
        horsepower: 400,
        location: 'Houston, TX',
        latitude: 29.7604,
        longitude: -95.3698,
        images: JSON.stringify(['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800']),
        features: JSON.stringify(['4WD', 'Towing Package', 'Bed Liner', 'Navigation System']),
        status: 'sold',
        seller_id: sellerId
      },
      {
        title: '2020 BMW 3 Series',
        description: 'Luxury sedan with premium features and excellent performance.',
        brand: 'BMW',
        model: '3 Series',
        year: 2020,
        mileage: 22000,
        price: 38000,
        currency: 'USD',
        car_condition: 'used',
        fuel_type: 'petrol',
        transmission: 'automatic',
        body_type: 'sedan',
        color: 'Black',
        engine_size: '2.0L',
        horsepower: 255,
        location: 'Miami, FL',
        latitude: 25.7617,
        longitude: -80.1918,
        images: JSON.stringify(['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800']),
        features: JSON.stringify(['Leather Seats', 'Premium Sound', 'Sunroof', 'Parking Sensors']),
        status: 'active',
        seller_id: sellerId
      },
      {
        title: '2018 Tesla Model 3',
        description: 'Electric vehicle with autopilot and over-the-air updates.',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2018,
        mileage: 45000,
        price: 35000,
        currency: 'USD',
        car_condition: 'used',
        fuel_type: 'electric',
        transmission: 'automatic',
        body_type: 'sedan',
        color: 'Red',
        engine_size: 'Electric',
        horsepower: 283,
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        images: JSON.stringify(['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800']),
        features: JSON.stringify(['Autopilot', 'Supercharging', 'Premium Interior', 'Glass Roof']),
        status: 'sold',
        seller_id: sellerId
      }
    ];

    // Insert sample cars
    for (const car of sampleCars) {
      const carId = crypto.randomUUID();
      const query = `
        INSERT INTO cars (
          id, title, description, brand, model, year, mileage, price, currency,
          car_condition, fuel_type, transmission, body_type, color, engine_size,
          horsepower, location, latitude, longitude, images, features,
          status, seller_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const params = [
        carId, car.title, car.description, car.brand, car.model, car.year,
        car.mileage, car.price, car.currency, car.car_condition, car.fuel_type,
        car.transmission, car.body_type, car.color, car.engine_size, car.horsepower,
        car.location, car.latitude, car.longitude, car.images, car.features,
        car.status, car.seller_id
      ];
      
      await executeQuery(query, params);
      console.log(`✅ Added car: ${car.title}`);
    }

    console.log('🎉 Successfully added 5 sample cars!');
    
    // Add some sample notifications
    const notifications = [
      {
        user_id: sellerId,
        type: 'in_app',
        title: 'New Car Listing Approved',
        message: 'Your 2020 Toyota Camry LE listing has been approved and is now live.',
        data: JSON.stringify({ car_id: 'car1', action: 'approved' })
      },
      {
        user_id: sellerId,
        type: 'in_app',
        title: 'Car Sale Completed',
        message: 'Congratulations! Your Tesla Model 3 has been sold for $35,000.',
        data: JSON.stringify({ car_id: 'car2', sale_price: 35000 })
      },
      {
        user_id: sellerId,
        type: 'in_app',
        title: 'New Inquiry',
        message: 'You have a new inquiry for your BMW 3 Series.',
        data: JSON.stringify({ car_id: 'car3', inquiry_type: 'viewing_request' })
      }
    ];

    for (const notif of notifications) {
      const notifId = crypto.randomUUID();
      const query = `
        INSERT INTO notifications (id, user_id, type, title, message, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await executeQuery(query, [notifId, notif.user_id, notif.type, notif.title, notif.message, notif.data]);
      console.log(`✅ Added notification: ${notif.title}`);
    }

    console.log('🎉 Successfully added sample notifications!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

addSampleCars();
