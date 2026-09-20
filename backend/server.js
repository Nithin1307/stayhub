const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/room");
const bookingRoutes = require("./routes/booking");
const hotelRoutes = require("./routes/hotel");
const paymentRoutes = require("./routes/payment");
const invoiceRoutes = require("./routes/invoice");
const dashboardRoutes = require("./routes/dashboard");
const staffRoutes = require("./routes/staff");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/room", roomRoutes);
app.use("/booking", bookingRoutes);
app.use("/hotel", hotelRoutes);
app.use("/payment", paymentRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/staff", staffRoutes);

app.get("/", (req, res) => {
    res.send("Hotel Management API is running");
});

app.get("/test", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({
            message: "Database connected",
            time: result.rows[0].now
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});