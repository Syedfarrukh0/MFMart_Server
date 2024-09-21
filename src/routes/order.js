import { confirmOrder, createOrder, getOrderById, getOrders, updateOrderStatus } from "../controller/order/order.js"
import { verifyToken } from "../middleware/auth.js"

export const orderRoutes = async (fastify, options) => {
    fastify.addHook('preHandler', async (req, res) => {
        const isAuthenticated = await verifyToken(req, res)
        if (!isAuthenticated) {
            return res.status(401).send({ message: 'Unauthorized' })
        }
    })

    fastify.post('/order', createOrder);
    fastify.get('/order', getOrders);
    fastify.patch('/order/:orderId/status', updateOrderStatus);
    fastify.post('/order/:orderId/confirm', confirmOrder);
    fastify.post('/order/:orderId', getOrderById);
}