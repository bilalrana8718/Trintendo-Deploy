import ownerModel from "../models/owner.model.js";
import redisClient from "../services/redis.service.js";
import * as ownerService from "../services/owner.service.js";
import { validationResult } from 'express-validator';


export const createOwnerController = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const owner = await ownerService.createUser(req.body);
        const token = owner.generateJWT();

        const userWithoutPassword = owner.toObject();
        delete userWithoutPassword.password;

        res.status(200).send({ owner: userWithoutPassword, token });
    }
    catch (error) {
        res.status(400).send({ error: error.message });
    }

}


export const loginOwnerController = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const owner = await ownerModel.findOne({ email: email }).select('+password');

        if (!owner) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await owner.validatePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = await owner.generateJWT();

        const ownerWithoutPassword = owner.toObject(); 
        delete ownerWithoutPassword.password; 

        res.status(200).send({ owner: ownerWithoutPassword, token: token });
    }
    catch (error) {
        res.status(400).send({ error: error.message });
    }
};

export const getOwnerProfileController = async (req, res) => {

    console.log(req.owner);
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        if (!req.owner) {
            return res.status(401).json({ message: 'User not found' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }

    res.status(200).send({ owner: req.owner });

};

export const logoutOwnerController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
};