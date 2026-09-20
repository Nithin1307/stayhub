const db = require("../db");
const { cloudinary } = require("../upload");

const uploadImages = async (files) => {
    const images = [];
    for (const file of files) {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "hotel/rooms"
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            stream.end(file.buffer);
        });
        images.push(result.secure_url);
    }
    return images;
};

const getRooms = async (req, res) => {
    try {
        const { hotel } = req.query;
        let query = `
            SELECT
                rooms.id,
                rooms.room_no,
                rooms.type,
                rooms.price,
                rooms.status,
                rooms.image,
                rooms.hotel_id,
                hotels.name AS hotel_name,
                hotels.location AS hotel_location
            FROM rooms
            JOIN hotels
                ON rooms.hotel_id = hotels.id
        `;
        let values = [];
        if (hotel) {
            query += ` WHERE rooms.hotel_id = $1`;
            values.push(hotel);
        }
        query += ` ORDER BY rooms.id DESC`;
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get rooms"
        });
    }
};

const getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const roomResult = await db.query(
            `SELECT
                rooms.id,
                rooms.room_no,
                rooms.type,
                rooms.price,
                rooms.status,
                rooms.image,
                rooms.hotel_id,
                hotels.name AS hotel_name,
                hotels.location AS hotel_location,
                hotels.description AS hotel_description,
                hotels.image AS hotel_image
             FROM rooms
             JOIN hotels
                ON rooms.hotel_id = hotels.id
             WHERE rooms.id = $1`,
            [id]
        );
        if (roomResult.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        const imageResult = await db.query(
            `SELECT id, image
             FROM room_images
             WHERE room_id = $1
             ORDER BY id ASC`,
            [id]
        );
        const room = roomResult.rows[0];
        room.images = imageResult.rows.map((item) => ({
            id: item.id,
            image: item.image
        }));
        res.json(room);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get room"
        });
    }
};

const getMyRooms = async (req, res) => {
    try {
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const result = await db.query(
            `SELECT
                rooms.id,
                rooms.room_no,
                rooms.type,
                rooms.price,
                rooms.status,
                rooms.image,
                rooms.hotel_id
             FROM rooms
             WHERE rooms.hotel_id = $1
             ORDER BY rooms.id DESC`,
            [req.user.hotel_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get your rooms"
        });
    }
};

const addRoom = async (req, res) => {
    try {
        const { room_no, type, price } = req.body;
        if (!room_no || !type || !price) {
            return res.status(400).json({
                message: "Room number, type and price are required"
            });
        }
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const hotelId = req.user.hotel_id;
        const existingRoom = await db.query(
            `SELECT id
             FROM rooms
             WHERE hotel_id = $1
             AND room_no = $2`,
            [hotelId, room_no]
        );
        if (existingRoom.rows.length > 0) {
            return res.status(400).json({
                message: "This room number already exists in your hotel"
            });
        }
        let mainImage = null;
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = await uploadImages(req.files);
            mainImage = uploadedImages[0];
        }
        const roomResult = await db.query(
            `INSERT INTO rooms
             (room_no, type, price, hotel_id, image)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                room_no,
                type,
                price,
                hotelId,
                mainImage
            ]
        );
        const roomId = roomResult.rows[0].id;
        for (let i = 1; i < uploadedImages.length; i++) {
            await db.query(
                `INSERT INTO room_images
                 (room_id, image)
                 VALUES ($1, $2)`,
                [roomId, uploadedImages[i]]
            );
        }
        res.json({
            message: "Room added successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to add room"
        });
    }
};

const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_no, type, price, status } = req.body;
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const result = await db.query(
            `UPDATE rooms
             SET room_no = $1,
                 type = $2,
                 price = $3,
                 status = $4
             WHERE id = $5
             AND hotel_id = $6`,
            [
                room_no,
                type,
                price,
                status,
                id,
                req.user.hotel_id
            ]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        res.json({
            message: "Room updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to update room"
        });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const result = await db.query(
            `DELETE FROM rooms
             WHERE id = $1
             AND hotel_id = $2`,
            [
                id,
                req.user.hotel_id
            ]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        res.json({
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to delete room"
        });
    }
};
const deleteRoomImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        if (!req.user.hotel_id) {
            return res.status(400).json({
                message: "No hotel assigned to this account"
            });
        }
        const imageResult = await db.query(
            `SELECT room_images.id
             FROM room_images
             JOIN rooms
                ON room_images.room_id = rooms.id
             WHERE room_images.id = $1
             AND rooms.hotel_id = $2`,
            [
                imageId,
                req.user.hotel_id
            ]
        );
        if (imageResult.rows.length === 0) {
            return res.status(404).json({
                message: "Image not found"
            });
        }
        await db.query(
            `DELETE FROM room_images
             WHERE id = $1`,
            [imageId]
        );
        res.json({
            message: "Room image deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to delete room image"
        });
    }
};

module.exports = {
    getRooms,
    getRoom,
    getMyRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    deleteRoomImage
};