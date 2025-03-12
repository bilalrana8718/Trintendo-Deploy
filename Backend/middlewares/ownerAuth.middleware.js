import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

export const authOwner = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.cookies(token, '');
            return res.status(401).json({ message: 'Access denied. Token is blacklisted.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.Owner = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Access denied. Invalid token.' });
    }

};
