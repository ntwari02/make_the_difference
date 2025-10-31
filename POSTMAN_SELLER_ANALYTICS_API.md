# Seller Analytics API - Postman Testing Guide

## Overview
The Seller Analytics API provides comprehensive analytics data for sellers including sales by period, top selling models, sales by channel, and sales by location.

## Base URL
```
http://localhost:3001/api/seller
```

## Authentication
All endpoints require:
- **Authentication**: Bearer Token (JWT)
- **Authorization**: Role must be `seller` or `admin`

### How to get the token:
1. First, login as a seller user (via `/api/auth/login` or use existing session)
2. Copy the JWT token from the login response
3. In Postman, go to the **Authorization** tab
4. Select type: **Bearer Token**
5. Paste your token in the Token field

---

## Endpoints

### 1. GET /api/seller/analytics
Get comprehensive seller analytics data.

**URL**: `GET http://localhost:3001/api/seller/analytics`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `12m` | Time period: `12m`, `6m`, or `3m` |
| `start_date` | string | No | - | Start date (YYYY-MM-DD format). If provided with `end_date`, overrides `period` |
| `end_date` | string | No | - | End date (YYYY-MM-DD format). Must be provided with `start_date` |

**Example Requests:**

1. **Default (Last 12 months)**
   ```
   GET http://localhost:3001/api/seller/analytics
   ```

2. **Last 6 months**
   ```
   GET http://localhost:3001/api/seller/analytics?period=6m
   ```

3. **Last 3 months**
   ```
   GET http://localhost:3001/api/seller/analytics?period=3m
   ```

4. **Custom date range**
   ```
   GET http://localhost:3001/api/seller/analytics?start_date=2025-01-01&end_date=2025-10-29
   ```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "sales_by_period": [
      {
        "period": "Jan",
        "sales_count": 5,
        "total_revenue": 85000.00
      },
      {
        "period": "Feb",
        "sales_count": 8,
        "total_revenue": 120000.00
      }
      // ... more periods
    ],
    "top_selling_models": [
      {
        "model": "Toyota Corolla",
        "units": 23,
        "revenue": 345000.00
      },
      {
        "model": "Honda Civic",
        "units": 18,
        "revenue": 298000.00
      }
      // ... up to 10 models
    ],
    "sales_by_channel": [
      {
        "channel": "Marketplace",
        "sales": 123
      },
      {
        "channel": "pickup",
        "sales": 45
      }
      // ... more channels (if orders table has data)
    ],
    "sales_by_location": [
      {
        "region": "Rwanda",
        "revenue": 151000.00
      },
      {
        "region": "Uganda",
        "revenue": 36000.00
      }
      // ... up to 10 regions
    ]
  }
}
```

**Error Responses:**

1. **401 Unauthorized** - Missing or invalid token
   ```json
   {
     "success": false,
     "message": "Authentication required"
   }
   ```

2. **403 Forbidden** - User is not a seller
   ```json
   {
     "success": false,
     "message": "Access denied"
   }
   ```

3. **404 Not Found** - Seller profile not found
   ```json
   {
     "success": false,
     "message": "Seller profile not found"
   }
   ```

4. **500 Internal Server Error**
   ```json
   {
     "success": false,
     "message": "Failed to get analytics"
   }
   ```

---

## Testing Checklist

### ✅ Basic Functionality
- [ ] Test with default period (12m)
- [ ] Test with period=6m
- [ ] Test with period=3m
- [ ] Test with custom date range (start_date + end_date)

### ✅ Data Structure Validation
- [ ] Verify `sales_by_period` array exists and has correct structure
- [ ] Verify `top_selling_models` array exists and has correct structure
- [ ] Verify `sales_by_channel` array exists (may be empty if no orders)
- [ ] Verify `sales_by_location` array exists (may be empty if no location data)
- [ ] Verify all numeric fields are numbers (not strings)

### ✅ Edge Cases
- [ ] Test with seller that has no sales (should return empty arrays with 0 values)
- [ ] Test with invalid date format
- [ ] Test with start_date > end_date (should handle gracefully)
- [ ] Test without authentication token (should return 401)
- [ ] Test with non-seller user token (should return 403)

### ✅ Performance
- [ ] Response time should be < 2 seconds for typical data
- [ ] Verify response is properly formatted JSON

---

## Postman Collection Setup

1. **Create a new Collection**: "Seller Analytics API"
2. **Add Environment Variables**:
   - `base_url`: `http://localhost:3001/api`
   - `seller_token`: Your JWT token
3. **Set Collection Authorization**:
   - Type: Bearer Token
   - Token: `{{seller_token}}`
4. **Create Requests**:
   - Get Analytics (Default)
   - Get Analytics (6m)
   - Get Analytics (3m)
   - Get Analytics (Custom Date Range)

---

## Notes

1. **Data Sources**:
   - Sales data comes from `cars` table where `status = 'sold'`
   - Channel data comes from `orders` table if available, otherwise defaults to "Marketplace"
   - Location data tries `orders.delivery_address` first, falls back to `cars.country/state`

2. **Period Format**:
   - `sales_by_period` uses month abbreviations (Jan, Feb, Mar, etc.)
   - Data is grouped by month (`DATE_FORMAT(updated_at, '%Y-%m')`)

3. **Empty Data Handling**:
   - If no sales exist, all arrays will be empty but the structure remains consistent
   - Numeric fields default to 0

4. **Date Range Logic**:
   - If both `start_date` and `end_date` are provided, `period` is ignored
   - Date filtering uses `cars.updated_at` for sales data (when car was marked as sold)

---

## Troubleshooting

**Issue**: Returns empty arrays even though seller has sales
- **Solution**: Check if cars have `status = 'sold'` and `updated_at` within the date range

**Issue**: `sales_by_channel` always shows "Marketplace"
- **Solution**: Check if orders table has data for this seller, or if `delivery_method` is populated

**Issue**: `sales_by_location` shows "Unknown"
- **Solution**: Verify cars have `country` or `state` fields populated, or orders have `delivery_address` JSON

**Issue**: Period names show incorrectly
- **Solution**: Check MySQL date formatting; should use `DATE_FORMAT(updated_at, '%b')` for month abbreviations

---

## Next Steps

After successful Postman testing:
1. ✅ Verify frontend integration in `SellerAnalytics.tsx`
2. ✅ Test all period filters (12m, 6m, 3m)
3. ✅ Test custom date range picker
4. ✅ Verify charts render correctly with real data
5. ✅ Verify CSV export functionality

