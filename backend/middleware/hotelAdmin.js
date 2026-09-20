const hotelAdmin = (req, res, next) => {
    if (req.user.role !== "hotel_admin") {
        return res.status(403).json({
            message: "Hotel admin access required"
        });
    }
    next();
};

module.exports = hotelAdmin;