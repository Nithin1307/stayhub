const db = require("../db");

const getBookings = async (req, res) => {
    try {
        if (req.user.role !== "customer") {
            return res.status(403).json({
                message: "Only customers can access their bookings"
            });
        }
        const result = await db.query(
            `SELECT
                bookings.id,
                bookings.check_in,
                bookings.check_out,
                bookings.status,
                rooms.room_no,
                rooms.type,
                rooms.price,
                rooms.hotel_id,
                hotels.name AS hotel_name,
                hotels.location AS hotel_location,
                payments.amount,
                payments.status AS payment_status
             FROM bookings
             JOIN rooms
                ON bookings.room_id = rooms.id
             JOIN hotels
                ON rooms.hotel_id = hotels.id
             LEFT JOIN payments
                ON payments.booking_id = bookings.id
             WHERE bookings.user_id = $1
             ORDER BY bookings.id DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get bookings"
        });
    }
};

const getAllBookings = async (req, res) => {
    try {
        if (
            req.user.role !== "hotel_admin" &&
            req.user.role !== "receptionist"
        ) {
            return res.status(403).json({
                message: "Hotel staff access required"
            });
        }
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const result = await db.query(
            `SELECT
                bookings.id,
                bookings.check_in,
                bookings.check_out,
                bookings.status,
                rooms.room_no,
                rooms.type,
                rooms.price,
                rooms.hotel_id,
                hotels.name AS hotel_name,
                hotels.location AS hotel_location,
                users.name AS user_name,
                users.email AS user_email,
                payments.amount,
                payments.status AS payment_status
             FROM bookings
             JOIN rooms
                ON bookings.room_id = rooms.id
             JOIN hotels
                ON rooms.hotel_id = hotels.id
             JOIN users
                ON bookings.user_id = users.id
             LEFT JOIN payments
                ON payments.booking_id = bookings.id
             WHERE rooms.hotel_id = $1
             ORDER BY bookings.id DESC`,
            [req.user.hotel_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get hotel bookings"
        });
    }
};

const getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT
                bookings.id,
                bookings.user_id,
                bookings.room_id,
                bookings.check_in,
                bookings.check_out,
                bookings.status,
                rooms.room_no,
                rooms.type,
                rooms.price,
                rooms.hotel_id,
                hotels.name AS hotel_name,
                hotels.location AS hotel_location,
                users.name AS user_name,
                users.email AS user_email,
                payments.amount,
                payments.status AS payment_status
             FROM bookings
             JOIN rooms
                ON bookings.room_id = rooms.id
             JOIN hotels
                ON rooms.hotel_id = hotels.id
             JOIN users
                ON bookings.user_id = users.id
             LEFT JOIN payments
                ON payments.booking_id = bookings.id
             WHERE bookings.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        const booking = result.rows[0];
        if (req.user.role === "customer") {
            if (Number(booking.user_id) !== Number(req.user.id)) {
                return res.status(403).json({
                    message: "You can only access your own booking"
                });
            }
        } else if (
            req.user.role === "hotel_admin" ||
            req.user.role === "receptionist"
        ) {
            if (Number(booking.hotel_id) !== Number(req.user.hotel_id)) {
                return res.status(403).json({
                    message: "You can only access bookings from your hotel"
                });
            }
        } else {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        res.json(booking);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get booking"
        });
    }
};

const checkAvailability = async (req, res) => {
    try {
        const { room_id, check_in, check_out } = req.query;
        if (!room_id || !check_in || !check_out) {
            return res.status(400).json({
                message: "Room, check-in and check-out dates are required"
            });
        }
        if (check_in >= check_out) {
            return res.status(400).json({
                message: "Check-out date must be after check-in date"
            });
        }
        const roomResult = await db.query(
            `SELECT
                id,
                hotel_id,
                status
             FROM rooms
             WHERE id = $1`,
            [room_id]
        );
        if (roomResult.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        const room = roomResult.rows[0];
        if (room.status !== "available") {
            return res.json({
                available: false,
                message: "Room is not available"
            });
        }
        const bookingResult = await db.query(
            `SELECT id
             FROM bookings
             WHERE room_id = $1
             AND status = 'booked'
             AND check_in < $3
             AND check_out > $2
             LIMIT 1`,
            [
                room_id,
                check_in,
                check_out
            ]
        );
        if (bookingResult.rows.length > 0) {
            return res.json({
                available: false,
                message: "Room is already booked for these dates"
            });
        }
        res.json({
            available: true,
            message: "Room is available"
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to check room availability"
        });
    }
};

const createReceptionistBooking = async (req, res) => {
    try {
        if (req.user.role !== "receptionist") {
            return res.status(403).json({
                message: "Only receptionists can create this booking"
            });
        }
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const {
            customer_email,
            room_id,
            check_in,
            check_out,
            payment_status
        } = req.body;
        if (!customer_email || !room_id || !check_in || !check_out) {
            return res.status(400).json({
                message: "Customer email, room and dates are required"
            });
        }
        if (check_in >= check_out) {
            return res.status(400).json({
                message: "Check-out date must be after check-in date"
            });
        }
        const customerResult = await db.query(
            `SELECT
                id,
                name,
                email,
                role
             FROM users
             WHERE email = $1`,
            [customer_email]
        );
        if (customerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Customer account not found"
            });
        }
        const customer = customerResult.rows[0];
        if (customer.role !== "customer") {
            return res.status(400).json({
                message: "The selected email does not belong to a customer"
            });
        }
        const roomResult = await db.query(
            `SELECT
                id,
                room_no,
                type,
                price,
                status,
                hotel_id
             FROM rooms
             WHERE id = $1
             AND hotel_id = $2`,
            [
                room_id,
                req.user.hotel_id
            ]
        );
        if (roomResult.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found in your hotel"
            });
        }
        const room = roomResult.rows[0];
        if (room.status !== "available") {
            return res.status(400).json({
                message: "Room is not available"
            });
        }
        const existingBooking = await db.query(
            `SELECT id
             FROM bookings
             WHERE room_id = $1
             AND status = 'booked'
             AND check_in < $3
             AND check_out > $2
             LIMIT 1`,
            [
                room_id,
                check_in,
                check_out
            ]
        );
        if (existingBooking.rows.length > 0) {
            return res.status(400).json({
                message: "Room is already booked for these dates"
            });
        }
        const bookingResult = await db.query(
            `INSERT INTO bookings
             (user_id, room_id, check_in, check_out, status)
             VALUES ($1, $2, $3, $4, 'booked')
             RETURNING id`,
            [
                customer.id,
                room_id,
                check_in,
                check_out
            ]
        );
        const bookingId = bookingResult.rows[0].id;
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const nights = Math.ceil(
            (checkOutDate - checkInDate) /
            (1000 * 60 * 60 * 24)
        );
        const totalAmount = Number(room.price) * nights;
        await db.query(
            `INSERT INTO payments
             (booking_id, amount, status)
             VALUES ($1, $2, $3)`,
            [
                bookingId,
                totalAmount,
                payment_status || "pending"
            ]
        );
        res.status(201).json({
            message: "Booking created successfully",
            booking_id: bookingId,
            customer: {
                name: customer.name,
                email: customer.email
            },
            room: {
                room_no: room.room_no,
                type: room.type
            },
            nights,
            amount: totalAmount
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to create receptionist booking"
        });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingResult = await db.query(
            `SELECT
                bookings.id,
                bookings.user_id,
                bookings.status,
                rooms.hotel_id
             FROM bookings
             JOIN rooms
                ON bookings.room_id = rooms.id
             WHERE bookings.id = $1`,
            [id]
        );
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        const booking = bookingResult.rows[0];
        if (req.user.role === "customer") {
            if (Number(booking.user_id) !== Number(req.user.id)) {
                return res.status(403).json({
                    message: "You can only cancel your own booking"
                });
            }
        } else if (
            req.user.role === "hotel_admin" ||
            req.user.role === "receptionist"
        ) {
            if (Number(booking.hotel_id) !== Number(req.user.hotel_id)) {
                return res.status(403).json({
                    message: "You can only manage bookings from your hotel"
                });
            }
        } else {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        if (booking.status === "cancelled") {
            return res.status(400).json({
                message: "Booking is already cancelled"
            });
        }
        await db.query(
            `UPDATE bookings
             SET status = 'cancelled'
             WHERE id = $1`,
            [id]
        );
        res.json({
            message: "Booking cancelled successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to cancel booking"
        });
    }
};

module.exports = {
    getBookings,
    getAllBookings,
    getBooking,
    checkAvailability,
    createReceptionistBooking,
    cancelBooking
};