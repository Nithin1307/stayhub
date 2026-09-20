const express = require("express");

const {
    getStaff,
    addReceptionist,
    deleteReceptionist
} = require("../controllers/staff");

const auth = require("../middleware/auth");
const hotelAdmin = require("../middleware/hotelAdmin");
const router = express.Router();

router.get("/",auth,hotelAdmin,getStaff);
router.post("/receptionist",auth,hotelAdmin,addReceptionist);
router.delete("/receptionist/:id",auth,hotelAdmin,deleteReceptionist);

module.exports = router;