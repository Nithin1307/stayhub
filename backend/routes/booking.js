const express = require("express");

const {
    getBookings,
    cancelBooking,
    getAllBookings,
    checkAvailability,
    createReceptionistBooking
} = require("../controllers/booking");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const hotelAdmin = require("../middleware/hotelAdmin");

const router = express.Router();
router.get("/", auth, getBookings);
router.get("/availability", checkAvailability);
router.get("/all",auth,admin,getAllBookings);
router.post("/receptionist",auth,admin,createReceptionistBooking);
router.put("/:id/cancel",auth,cancelBooking);

module.exports = router;