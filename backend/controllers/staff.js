const db = require("../db");
const bcrypt = require("bcrypt");

const getStaff = async (req, res) => {
    try {
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const result = await db.query(
            `SELECT
                id,
                name,
                email,
                role
             FROM users
             WHERE hotel_id = $1
             AND role = 'receptionist'
             ORDER BY id DESC`,
            [req.user.hotel_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get staff"
        });
    }
};

const addReceptionist = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const existingUser = await db.query(
            `SELECT id
             FROM users
             WHERE email = $1`,
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO users
             (name, email, password, role, hotel_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, hotel_id`,
            [
                name,
                email,
                hashedPassword,
                "receptionist",
                req.user.hotel_id
            ]
        );
        res.status(201).json({
            message: "Receptionist added successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to add receptionist"
        });
    }
};

const deleteReceptionist = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const result = await db.query(
            `DELETE FROM users
             WHERE id = $1
             AND hotel_id = $2
             AND role = 'receptionist'`,
            [
                id,
                req.user.hotel_id
            ]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Receptionist not found"
            });
        }
        res.json({
            message: "Receptionist removed successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to remove receptionist"
        });
    }
};

module.exports = {
    getStaff,
    addReceptionist,
    deleteReceptionist
};