const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../db");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
    try {
        if (req.user.role !== "customer") {
            return res.status(403).json({
                message: "Only customers can book rooms"
            });
        }
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Invalid amount"
            });
        }
        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: `hotel_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to create payment order"
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        if (req.user.role !== "customer") {
            return res.status(403).json({
                message: "Only customers can create bookings"
            });
        }
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            room_id,
            check_in,
            check_out,
            amount
        } = req.body;
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !room_id ||
            !check_in ||
            !check_out ||
            !amount
        ) {
            return res.status(400).json({
                message: "Required payment details are missing"
            });
        }
        if (check_in >= check_out) {
            return res.status(400).json({
                message: "Check-out date must be after check-in date"
            });
        }
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification failed"
            });
        }
        const roomResult = await db.query(
            `SELECT
                id,
                price,
                status,
                hotel_id
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
             AND check_out > $2`,
            [
                room_id,
                check_in,
                check_out
            ]
        );
        if (existingBooking.rows.length > 0) {
            return res.status(400).json({
                message: "Room is no longer available for these dates"
            });
        }
        const bookingResult = await db.query(
            `INSERT INTO bookings
             (user_id, room_id, check_in, check_out, status)
             VALUES ($1, $2, $3, $4, 'booked')
             RETURNING id`,
            [
                req.user.id,
                room_id,
                check_in,
                check_out
            ]
        );
        const bookingId = bookingResult.rows[0].id;
        await db.query(
            `INSERT INTO payments
             (booking_id, amount, status)
             VALUES ($1, $2, 'paid')`,
            [
                bookingId,
                amount
            ]
        );
        res.json({
            message: "Payment verified and booking confirmed",
            booking_id: bookingId,
            payment_id: razorpay_payment_id
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Payment verification failed"
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};