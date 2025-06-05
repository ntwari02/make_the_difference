const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        if (verified.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
};

module.exports = { auth, adminAuth }; 