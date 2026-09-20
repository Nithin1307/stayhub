const admin = (req, res, next) => {
    if (
        req.user.role !== "hotel_admin" &&
        req.user.role !== "receptionist"
    ) {
        return res.status(403).json({
            message: "Hotel staff access required"
        });
    }
    next();
};

module.exports = admin;