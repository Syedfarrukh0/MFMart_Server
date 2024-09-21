import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        // Check if the authHeader exists and starts with 'Bearer'
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({message: "Access token required"})
        }        
        const token = authHeader.split(" ")[1];
        // Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        // Pass control to the next middleware
        return true;
    } catch (error) {
        return res.status(403).send({message: "Invalid or expired token"})
    }
}