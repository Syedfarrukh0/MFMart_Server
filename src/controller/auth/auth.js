import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
    return { accessToken, refreshToken };
}

export const loginCustomer = async (req, res) => {
    try {
        const { phone } = req.body;
        // check user exists or not
        let customer = await Customer.findOne({ phone });
        // default message for existing customer
        let message = 'Login successful'; 
        // if not create new user
        if (!customer) {
            customer = new Customer({
                phone,
                role: 'Customer',
                isActivated: true,
            })
            await customer.save();
            message = 'Customer created and login successful';
        }
        // generate token
        const { accessToken, refreshToken } = generateToken(customer);
        // send token
        return res.send({
            message,
            accessToken,
            refreshToken,
            customer,
        })
    } catch (error) {
        return res.status(500).send({ message: 'An error occurred', error });
    }
}

export const loginDeliveryPartner = async (req, res) => {
    try {
        const { email, password } = req.body;
        // check delivery paetner exists or not
        let deliveryPartner = await DeliveryPartner.findOne({ email });
        // not found
        if (!deliveryPartner) {
            return res.status(404).send({ message: 'Delivery partner not found' });
        }
        // if delivery partner exists so match password
        const isMatch = password === deliveryPartner.password;
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }
        // generate token
        const { accessToken, refreshToken } = generateToken(deliveryPartner);
        // send token
        return res.send({
            message: 'Login successful',
            accessToken,
            refreshToken,
            deliveryPartner,
        })
    } catch (error) {
        return res.status(500).send({ message: 'An error occurred', error });
    }
}

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send({ message: 'Refresh token is required' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        let user;
        if (decoded.role === 'Customer') {
            user = await Customer.findById(decoded.userId);
        }
        else if (decoded.role === 'DeliveryPartner'){
            user = await DeliveryPartner.findById(decoded.userId);
        }
        else{
            return res.status(403).send({ message: 'Invalid role' });
        }
        if (!user) {
            return res.status(403).send({ message: 'Invalid refresh token' });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
        return res.send({
            message: 'Token refreshed successfully',
            accessToken,
            refreshToken: newRefreshToken,
        })
    } catch (error) {
        return res.status(403).send({ message: 'Invalid refresh token', error });
    }
}

export const fetchUser = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let user;
        if (role === 'Customer') {
            user = await Customer.findById(userId);
        }
        else if (role === 'DeliveryPartner'){
            user = await DeliveryPartner.findById(userId);
        }
        else{
            return res.status(403).send({ message: 'Invalid role' });
        }
        if (!user) {
            return res.status(404).send({ message: 'User not found'});
        }
        return res.send({
            message: 'User fetched successfully',
            user,
         });
    } catch (error) {
        return res.status(500).send({ message: 'An error occurred while fetching user', error });
    }
}