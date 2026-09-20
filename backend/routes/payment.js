const express = require("express");

const {
    createOrder,
    verifyPayment
} = require("../controllers/payment");

const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);

module.exports = router;