const db = require("../db");

const getDashboard = async (req, res) => {
    try {
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const hotelId = req.user.hotel_id;
        const rooms = await db.query(
            `SELECT COUNT(*) AS count
             FROM rooms
             WHERE hotel_id = $1`,
            [hotelId]
        );
        const bookings = await db.query(
            `SELECT COUNT(*) AS count
             FROM bookings
             JOIN rooms
                ON bookings.room_id = rooms.id
             WHERE rooms.hotel_id = $1`,
            [hotelId]
        );
        const activeBookings = await db.query(
            `SELECT COUNT(*) AS count
             FROM bookings
             JOIN rooms
                ON bookings.room_id = rooms.id
             WHERE rooms.hotel_id = $1
             AND bookings.status = 'booked'`,
            [hotelId]
        );
        const revenue = await db.query(
            `SELECT COALESCE(SUM(payments.amount), 0) AS total
             FROM payments
             JOIN bookings
                ON payments.booking_id = bookings.id
             JOIN rooms
                ON bookings.room_id = rooms.id
             WHERE rooms.hotel_id = $1
             AND payments.status = 'paid'`,
            [hotelId]
        );
        res.json({
            rooms: Number(rooms.rows[0].count),
            bookings: Number(bookings.rows[0].count),
            activeBookings: Number(activeBookings.rows[0].count),
            revenue: Number(revenue.rows[0].total)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get dashboard data"
        });
    }
};

module.exports = {
    getDashboard
};