import { Customer, DeliveryPartner } from "../../models/index.js";

export const updateUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from the request
        console.log(userId, '1');
        
        const updateData = req.body; // Extract update data from request body
        console.log(updateData, '2');
        
        // Attempt to find the user in both collections
        let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);
        console.log(user, '3');

        if (!user) {
            console.log('4 user not found');
            return res.status(404).send({ message: 'User not found' });
        }

        let UserModel;
        // Determine the correct model based on user role
        if (user.role === 'Customer') {
            UserModel = Customer;
        } else if (user.role === 'DeliveryPartner') {
            UserModel = DeliveryPartner;
        } else {
            return res.status(400).send({ message: 'Invalid role' });
        }

        // Update the user in the database
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(400).send({ message: 'User update failed' });
        }

        // Successfully updated user
        return res.status(200).send({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).send({ message: 'Failed to update user', error });
    }
}