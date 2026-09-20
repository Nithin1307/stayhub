const express = require("express");
const {
    register,
    login
} = require("../controllers/user");
const auth = require("../middleware/auth");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, async (req, res) => {
    try {
        const db = require("../db");
        const result = await db.query(
            `SELECT
                users.id,
                users.name,
                users.email,
                users.role,
                users.hotel_id,
                hotels.name AS hotel_name,
                hotels.location AS hotel_location
             FROM users
             LEFT JOIN hotels
                ON users.hotel_id = hotels.id
             WHERE users.id = $1`,
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get profile"
        });
    }
});

module.exports = router;