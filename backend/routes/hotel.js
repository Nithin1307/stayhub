const express = require("express");

const {
    getHotels,
    getMyHotel,
    addHotel,
    updateHotel
} = require("../controllers/hotel");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { upload } = require("../upload");

const router = express.Router();

router.get("/", getHotels);
router.get("/my",auth,admin,getMyHotel);
router.post("/",auth,admin,upload.single("image"),addHotel);
router.put("/:id",auth,admin,upload.single("image"),updateHotel);

module.exports = router;