# Buyer APIs Summary

## Overview
All buyer endpoints require authentication and the user must have role `buyer` or `admin`.

## Base URL
`/api/ecommerce/cars`

---

## 🔍 PUBLIC APIs (No Authentication Required)

### 1. List All Cars
**GET** `/`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `brand` - Filter by brand
- `model` - Filter by model
- `year_min` - Minimum year
- `year_max` - Maximum year
- `price_min` - Minimum price
- `price_max` - Maximum price
- `fuel_type` - Filter by fuel type
- `transmission` - Filter by transmission
- `body_type` - Filter by body type (sedan, suv, hatchback, coupe, convertible, wagon, pickup, van)
- `car_condition` - Filter by condition (new, used, certified)
- `location` - Filter by location
- `sort_by` (default: 'created_at')
- `sort_order` (default: 'DESC')

**Response:**
```json
{
  "cars": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 2. Search Cars
**GET** `/search`

**Query Parameters:**
- `q` - Search query (searches across title, brand, model, description)
- All filter parameters from List Cars

**Response:** Same as List Cars

---

### 3. Get Single Car Details
**GET** `/:id`

**Response:**
```json
{
  "id": "car_id",
  "title": "2023 Tesla Model 3",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "mileage": 15000,
  "price": 45000,
  "currency": "USD",
  "car_condition": "used",
  "fuel_type": "electric",
  "transmission": "automatic",
  "body_type": "sedan",
  "color": "Pearl White",
  "engine_size": "Electric",
  "horsepower": 346,
  "vin": "VIN_NUMBER",
  "location": "Los Angeles, CA",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "images": ["url1", "url2"],
  "features": ["Autopilot", "Premium Audio"],
  "model_3d_url": "url_to_3d_model",
  "has_3d_model": true,
  "status": "active",
  "is_featured": true,
  "views_count": 1234,
  "seller_id": "seller_id",
  "seller_info": {
    "business_name": "Premium Auto Sales",
    "rating": 4.8,
    "review_count": 245
  },
  "created_at": "2024-10-01T00:00:00Z",
  "updated_at": "2024-10-04T00:00:00Z"
}
```

---

### 4. Get Car Reviews
**GET** `/:id/reviews`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_id",
      "user_id": "user_id",
      "user_name": "John Doe",
      "rating": 5,
      "title": "Great car!",
      "comment": "Excellent condition...",
      "created_at": "2024-10-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## ❤️ BUYER APIs (Authentication Required - Role: buyer, admin)

### 5. Add to Favorites
**POST** `/:id/favorite`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "favorite_id",
  "user_id": "user_id",
  "car_id": "car_id",
  "created_at": "2024-10-04T00:00:00Z"
}
```

---

### 6. Remove from Favorites
**DELETE** `/:id/favorite`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Removed from favorites"
}
```

---

### 7. Get My Favorites
**GET** `/buyer/favorites`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "favorites": [
    {
      "favorite_id": "fav_id",
      "car": {
        // Full car object
      },
      "added_at": "2024-10-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 8. Create Review
**POST** `/:id/review`

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "rating": 5,
  "title": "Great car!",
  "comment": "Excellent condition and service..."
}
```

**Validation:**
- `rating`: Required, must be between 1 and 5
- `title`: Required, max 200 characters
- `comment`: Required, max 2000 characters

**Response:**
```json
{
  "id": "review_id",
  "user_id": "user_id",
  "car_id": "car_id",
  "rating": 5,
  "title": "Great car!",
  "comment": "Excellent condition...",
  "status": "active",
  "created_at": "2024-10-04T00:00:00Z"
}
```

---

## 📊 BUYER PROFILE & ACTIVITY

### Get Buyer Dashboard Stats
While not explicitly defined, these can be calculated from:
- Total favorites count
- Reviews written
- Recent activity
- Saved searches

---

## 🎯 RECOMMENDED BUYER FEATURES TO BUILD

### 1. **Browse/Marketplace Page**
- Vehicle grid/list view
- Advanced filters (price, brand, year, type, etc.)
- Sort options
- Search functionality
- Map view (if lat/long available)

### 2. **Vehicle Details Page**
- Full vehicle information
- Image gallery
- 3D model viewer
- Seller information
- Reviews section
- "Add to Favorites" button
- "Contact Dealer" button
- Similar vehicles

### 3. **Favorites/Saved Vehicles**
- List of saved vehicles
- Remove from favorites
- Compare vehicles
- Get notifications on price drops

### 4. **Search & Filters**
- Advanced search
- Save searches
- Price alerts
- Recently viewed

### 5. **Reviews**
- Write reviews
- View own reviews
- Edit/delete reviews

### 6. **Buyer Dashboard**
- Saved vehicles
- Recent searches
- Recommendations
- Activity history

### 7. **Notifications**
- New listings matching criteria
- Price drops on favorites
- Saved search alerts
- Dealer responses

---

## 🔐 Authentication Endpoints

All authentication endpoints are shared across roles:
- **POST** `/api/auth/register` - Register new user (with role: 'buyer')
- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/refresh` - Refresh token
- **POST** `/api/auth/logout` - Logout

---

## 📝 Car Object Schema

```typescript
interface Car {
  id: string;
  title: string;
  description?: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  car_condition: 'new' | 'used' | 'certified';
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng';
  transmission: 'manual' | 'automatic' | 'semi-automatic';
  body_type: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'pickup' | 'van';
  color: string;
  engine_size?: string;
  horsepower?: number;
  vin?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  features?: string[];
  model_3d_url?: string;
  model_3d_format?: 'gltf' | 'glb' | 'obj' | 'fbx' | 'dae';
  has_3d_model: boolean;
  status: 'active' | 'sold' | 'pending' | 'draft';
  is_featured: boolean;
  views_count: number;
  seller_id: string;
  dealer_id?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🚀 Next Steps for Frontend

1. Create buyer module structure
2. Set up buyer API service file
3. Create buyer Redux store/slices
4. Build buyer pages:
   - Browse/Marketplace
   - Vehicle Details
   - Favorites
   - Search Results
   - Buyer Dashboard
5. Implement filters and search
6. Add 3D model viewer
7. Implement favorites functionality
8. Add review system

