import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const ownerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: [10, 'Email must be at least 10 characters']
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'password must be at least 8 characters'],
        select: false
    }
});

ownerSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

ownerSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

ownerSchema.methods.generateJWT = function () {
    return jwt.sign({
        email: this.email
    }, process.env.JWT_SECRET);
};

const Owner = mongoose.model('Owner', ownerSchema);

export default Owner;
