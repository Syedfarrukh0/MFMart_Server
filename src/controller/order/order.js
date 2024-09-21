import { Branch, Customer, DeliveryPartner, Order } from "../../models/index.js";

export const createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(userId, '0')

        const { items, branch, totalPrice } = req.body;
        console.log(items, branch, totalPrice, '0.5')

        const customerData = await Customer.findById(userId);
        console.log(customerData, '1');

        const branchData = await Branch.findById(branch);
        console.log(branchData, '2')

        if (!customerData) {
            return res.status(404).send({ message: 'Customer not found' })
        }

        // Automatically select a delivery partner (you can add your own logic here)
        const deliveryPartner = await DeliveryPartner.findOne(); // Here, you can add filters or logic to assign a specific delivery partner
        console.log(deliveryPartner, '3');

        if (!deliveryPartner) {
            return res.status(404).send({ message: 'No available delivery partner found' });
        }

        const newOrder = new Order({
            customer: userId,
            deliveryPartner: deliveryPartner._id, // Automatically assigning deliveryPartner
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || 'No address provided'
            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || 'No address provided'
            },
        })
        const saveOrder = await newOrder.save();
        return res.status(201).send({ message: 'Order created successfully', saveOrder })
    } catch (error) {
        return res.status(500).send({ message: 'Faild to create order', error })
    }
}

// export const createOrder = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         console.log(userId, '0')

//         const { items, branch, totalPrice, deliveryPartner } = req.body;

//         // Input validation
//         if (!items || !branch || !totalPrice) {
//             return res.status(400).send({ message: 'Invalid input data' });
//         }

//         const customerData = await Customer.findById(userId);
//         if (!customerData) {
//             return res.status(404).send({ message: 'Customer not found' });
//         }

//         const branchData = await Branch.findById(branch);
//         if (!branchData) {
//             return res.status(404).send({ message: 'Branch not found' });
//         }

//         // Generate a unique orderId if it's required but not provided
//         const orderId = Math.floor(Math.random() * 1000000); // Example order ID generation

//         const newOrder = new Order({
//             customer: userId,
//             orderId, // Include generated orderId or get it from req.body
//             deliveryPartner: deliveryPartner || 'Default Delivery Partner', // Provide a default value if missing
//             items: items.map((item) => ({
//                 id: item.id,
//                 item: item.item,
//                 count: item.count
//             })),
//             branch,
//             totalPrice,
//             deliveryLocation: {
//                 latitude: customerData.liveLocation?.latitude,
//                 longitude: customerData.liveLocation?.longitude,
//                 address: customerData.address || 'No address provided'
//             },
//             pickupLocation: {
//                 latitude: branchData.location?.latitude,
//                 longitude: branchData.location?.longitude,
//                 address: branchData.address || 'No address provided'
//             },
//         });

//         const saveOrder = await newOrder.save();
//         return res.status(201).send({ message: 'Order created successfully', saveOrder });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({ message: 'Failed to create order', error });
//     }
// }



export const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation } = req.body;
        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return res.status(404).send({ message: 'Delivery person not found' });
        }
        const order = await Order.findById(orderId); 
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
        if (order.status !== 'availabel') {
            return res.status(400).send({ message: 'Order is not available for confirmation' });
        }
        order.status = 'confirmed';
        order.deliveryPartner = userId;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation?.longitude,
            address: deliveryPersonLocation?.address || ''
        }
        await order.save();
        return res.status(200).send({ message: 'Order confirmed successfully', order })
    } catch (error) {
        return res.status(500).send({ message: 'Faild to confirm order', error})
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, deliveryPersonLocation } = req.body;
        const userId = req.user;
        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return res.status(404).send({ message: 'Delivery person not found' });
        }
        const order = await Order.findById(orderId); 
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
        if (['cancelled', 'delivered'].includes(order.status)) {
            return res.status(400).send({ message: 'Order can not be updated' });
        }
        if (order.deliveryPartner.toString() !== userId) {
            return res.status(403).send({ message: 'You are not authorized to update this order' });
        }
        order.status = status;
        order.deliveryPersonLocation = deliveryPersonLocation;
        await order.save();
        return res.status(200).send({ message: 'Order updated successfully', order })
    } catch (error) {
        return res.status(500).send({ message: 'Faild to update order status', error})
    }
}

export const getOrders = async (req, res) => {
    try {
        const { status, customerId, deliveryPartnerId, branchId } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }
        if (customerId) {
            query.customer = customerId;
        } 
        if (deliveryPartnerId) {
            query.deliveryPartner = status;
            query.branch = branchId;
        }
        const orders = await Order.find(query).populate('Customer branch items.item deliveryPartner');
        return res.status(200).send({ message: 'Orders fetched successfully', orders })
    } catch (error) {
        return res.status(500).send({ message: 'Faild to get orders', error})
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('Customer branch items.item deliveryPartner');
        if (!order) {
            return res.status(404).send({ message: 'Order not found' })
        }
        return res.status(200).send({ message: 'Order fetch successfully', order })
    } catch (error) {
        return res.status(500).send({ message: 'Faild to get order', error})
    }
}