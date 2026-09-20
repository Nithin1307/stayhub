const db = require("../db");
const { cloudinary } = require("../upload");

const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "hotel"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        stream.end(file.buffer);
    });
};

const getHotels = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                id,
                name,
                location,
                description,
                image
             FROM hotels
             ORDER BY id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get hotels"
        });
    }
};

const getMyHotel = async (req, res) => {
    try {
        if (!req.user.hotel_id) {
            return res.status(404).json({
                message: "No hotel assigned to this account"
            });
        }
        const result = await db.query(
            `SELECT
                id,
                name,
                location,
                description,
                image,
                admin_id
             FROM hotels
             WHERE id = $1`,
            [req.user.hotel_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get your hotel"
        });
    }
};

const addHotel = async (req, res) => {
    try {
        const { name, location, description } = req.body;
        if (!name || !location) {
            return res.status(400).json({
                message: "Hotel name and location are required"
            });
        }
        if (req.user.role !== "hotel_admin") {
            return res.status(403).json({
                message: "Only hotel admin can create a hotel"
            });
        }
        if (req.user.hotel_id) {
            return res.status(400).json({
                message: "You already have a hotel"
            });
        }
        let image = null;
        if (req.file) {
            image = await uploadImage(req.file);
        }
        const result = await db.query(
            `INSERT INTO hotels
             (name, location, description, image, admin_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, location, description, image`,
            [
                name,
                location,
                description || null,
                image,
                req.user.id
            ]
        );
        await db.query(
            `UPDATE users
             SET hotel_id = $1
             WHERE id = $2`,
            [
                result.rows[0].id,
                req.user.id
            ]
        );
        res.status(201).json({
            message: "Hotel added successfully",
            hotel: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to add hotel"
        });
    }
};

const updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        if (Number(id) !== Number(req.user.hotel_id)) {
            return res.status(403).json({
                message: "You can only update your own hotel"
            });
        }
        const { name, location, description } = req.body;
        if (!name || !location) {
            return res.status(400).json({
                message: "Hotel name and location are required"
            });
        }
        let query;
        let values;
        if (req.file) {
            const image = await uploadImage(req.file);
            query = `
                UPDATE hotels
                SET name = $1,
                    location = $2,
                    description = $3,
                    image = $4
                WHERE id = $5
                RETURNING id, name, location, description, image
            `;
            values = [
                name,
                location,
                description || null,
                image,
                req.user.hotel_id
            ];
        } else {
            query = `
                UPDATE hotels
                SET name = $1,
                    location = $2,
                    description = $3
                WHERE id = $4
                RETURNING id, name, location, description, image
            `;
            values = [
                name,
                location,
                description || null,
                req.user.hotel_id
            ];
        }
        const result = await db.query(query, values);
        if(result.rows.length === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }
        res.json({
            message: "Hotel updated successfully",
            hotel: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to update hotel"
        });
    }
};

module.exports = {
    getHotels,
    getMyHotel,
    addHotel,
    updateHotel
};