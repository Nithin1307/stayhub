-- ============================================================
-- STAYHUB DATABASE
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    hotel_id INT
);


-- ============================================================
-- HOTELS
-- ============================================================

CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    admin_id INT REFERENCES users(id)
);


-- ============================================================
-- USER → HOTEL RELATIONSHIP
-- ============================================================

ALTER TABLE users
ADD CONSTRAINT users_hotel_id_fkey
FOREIGN KEY (hotel_id)
REFERENCES hotels(id);


-- ============================================================
-- ROOMS
-- ============================================================

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_no INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    image VARCHAR(500),
    hotel_id INT REFERENCES hotels(id)
);


-- ============================================================
-- UNIQUE ROOM NUMBER PER HOTEL
-- ============================================================

ALTER TABLE rooms
ADD CONSTRAINT unique_hotel_room
UNIQUE (hotel_id, room_no);


-- ============================================================
-- ROOM IMAGES
-- ============================================================

CREATE TABLE room_images (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    image VARCHAR(500) NOT NULL
);


-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    room_id INT REFERENCES rooms(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'booked'
);


-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_hotel_id
ON users(hotel_id);

CREATE INDEX idx_rooms_hotel_id
ON rooms(hotel_id);

CREATE INDEX idx_room_images_room_id
ON room_images(room_id);

CREATE INDEX idx_bookings_user_id
ON bookings(user_id);

CREATE INDEX idx_bookings_room_id
ON bookings(room_id);

CREATE INDEX idx_payments_booking_id
ON payments(booking_id);


-- ============================================================
-- DATABASE COMPLETE
-- ============================================================