-- Seller schema adjustments (only modify existing tables; no CREATE TABLE here)

-- cars: columns
ALTER TABLE cars ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'USD';
ALTER TABLE cars ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE cars ADD COLUMN images JSON NOT NULL;
ALTER TABLE cars ADD COLUMN features JSON NOT NULL;
ALTER TABLE cars ADD COLUMN engine_size VARCHAR(20) NULL;
ALTER TABLE cars ADD COLUMN horsepower INT NULL;
ALTER TABLE cars ADD COLUMN vin VARCHAR(17) NULL;

-- cars: indexes
CREATE INDEX idx_cars_seller ON cars (seller_id);
CREATE INDEX idx_cars_status ON cars (status);
CREATE INDEX idx_cars_brand_model ON cars (brand, model);

-- car_favorites: indexes
CREATE UNIQUE INDEX uniq_user_car ON car_favorites (user_id, car_id);
CREATE INDEX idx_car_fav_user ON car_favorites (user_id);
CREATE INDEX idx_car_fav_car ON car_favorites (car_id);

-- car_reviews: columns
ALTER TABLE car_reviews ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved';
ALTER TABLE car_reviews ADD COLUMN admin_reason VARCHAR(255) NULL;

-- car_reviews: indexes
CREATE INDEX idx_car_reviews_car ON car_reviews (car_id);
CREATE INDEX idx_car_reviews_user ON car_reviews (user_id);
