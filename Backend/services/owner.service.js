import ownerModel from "../models/owner.model.js";


export const createUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Please provide an email and password.');
    }

    const hashPassword = await ownerModel.hashPassword(password);

    // Mongo DB commands
    const owner = await ownerModel.create({
        email,
        password: hashPassword
    }
    );

    return owner;
};
