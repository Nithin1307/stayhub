const express = require("express");

const {
    downloadInvoice
} = require("../controllers/invoice");

const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:id", auth, downloadInvoice);

module.exports = router;