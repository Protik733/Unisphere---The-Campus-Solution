const jwt = require("jsonwebtoken");

function checkRole(allowedRoles) {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];

            if (!token) {
                return res.status(401).json({ message: "No token found" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: "Access Denied" });
            }

            req.user = decoded;
            next();

        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
}

module.exports = checkRole;