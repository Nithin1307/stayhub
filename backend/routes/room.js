const express = require("express");

const {
    getRooms,
    getRoom,
    getMyRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    deleteRoomImage
} = require("../controllers/room");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { upload } = require("../upload");

const router = express.Router();

router.get("/", getRooms);
router.get("/my", auth, admin, getMyRooms);
router.get("/:id", getRoom);
router.post("/",auth,admin,upload.array("images", 5),addRoom);
router.put("/:id",auth,admin,updateRoom);
router.delete("/image/:imageId",auth,admin,deleteRoomImage);
router.delete("/:id",auth,admin,deleteRoom);

module.exports = router;