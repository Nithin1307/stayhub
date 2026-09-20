const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                message: "Access denied"
            });
        }
        const tokenValue = token.split(" ")[1];
        const user = jwt.verify(
            tokenValue,
            process.env.JWT_SECRET
        );
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = auth;