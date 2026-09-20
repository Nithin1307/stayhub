const PDFDocument = require("pdfkit");
const db = require("../db");

const downloadInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT
                bookings.id,
                bookings.check_in,
                bookings.check_out,
                bookings.status,
                users.name AS user_name,
                users.email AS user_email,
                rooms.room_no,
                rooms.type,
                rooms.price,
                hotels.name AS hotel_name,
                hotels.location AS hotel_location,
                payments.amount AS payment_amount,
                payments.status AS payment_status
             FROM bookings
             JOIN users ON bookings.user_id = users.id
             JOIN rooms ON bookings.room_id = rooms.id
             JOIN hotels ON rooms.hotel_id = hotels.id
             LEFT JOIN payments ON bookings.id = payments.booking_id
             WHERE bookings.id = $1
             AND bookings.user_id = $2`,
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        const booking = result.rows[0];
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const nights = Math.ceil(
            (checkOut - checkIn) / (1000 * 60 * 60 * 24)
        );
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=invoice-${booking.id}.pdf`
        );
        doc.pipe(res);
        doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .text("MY HOTEL");
        doc
            .fontSize(11)
            .font("Helvetica")
            .text("Hotel Booking Invoice");
        doc.moveDown();
        doc
            .fontSize(18)
            .font("Helvetica-Bold")
            .text("Booking Invoice");
        doc.moveDown();
        doc
            .fontSize(11)
            .font("Helvetica")
            .text(`Invoice Number: INV-${booking.id}`)
            .text(`Booking ID: ${booking.id}`)
            .text(`Booking Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Customer Details");
        doc
            .fontSize(11)
            .font("Helvetica")
            .text(`Name: ${booking.user_name}`)
            .text(`Email: ${booking.user_email}`);
        doc.moveDown();
        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Hotel Details");
        doc
            .fontSize(11)
            .font("Helvetica")
            .text(`Hotel: ${booking.hotel_name}`)
            .text(`Location: ${booking.hotel_location}`);
        doc.moveDown();
        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("Room Details");
        doc
            .fontSize(11)
            .font("Helvetica")
            .text(`Room Number: ${booking.room_no}`)
            .text(`Room Type: ${booking.type}`)
            .text(`Price Per Night: Rs. ${booking.price}`)
            .text(`Check-in: ${checkIn.toLocaleDateString()}`)
            .text(`Check-out: ${checkOut.toLocaleDateString()}`)
            .text(`Number of Nights: ${nights}`);
        doc.moveDown();
        doc
            .fontSize(16)
            .font("Helvetica-Bold")
            .text(`Total Amount Paid: Rs. ${booking.payment_amount}`);
        doc
            .fontSize(11)
            .font("Helvetica")
            .text(`Payment Status: ${booking.payment_status}`)
            .text(`Booking Status: ${booking.status}`);
        doc.moveDown(2);
        doc
            .fontSize(10)
            .text("Thank you for booking with My Hotel.")
            .text("We hope you have a comfortable and pleasant stay.");
        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to generate invoice"
        });
    }
};

module.exports = {
    downloadInvoice
};