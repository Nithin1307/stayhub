const express = require("express");

const {
    getDashboard
} = require("../controllers/dashboard");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", auth, admin, getDashboard);

module.exports = router;