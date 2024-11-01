import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token || req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
    }

    // If using Bearer token in Authorization header
    const extractedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    jwt.verify(extractedToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }
        req.user = decoded;
        next();
    });
};
