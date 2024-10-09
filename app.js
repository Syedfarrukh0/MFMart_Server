import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

const start = async () => {
    await connectDB(process.env.MONGO_URI);
    const app = Fastify();
    app.register(fastifySocketIO, {
        cors: {
            origin: "*",
        },
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ["websocket"]
    })

    // Simple route to return a message in the browser
    app.get('/', async (request, reply) => {
        return { message: "Server is running on port " + PORT };
    });
    
    await registerRoutes(app);
    await buildAdminRouter(app);
    app.listen({ port: PORT, host: '0.0.0.0' }, (err, addr) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(`MFMart started on http://localhost:${PORT}${admin.options.rootPath}`)
        }
    })
    app.ready().then(() => {
        app.io.on('connection', (socket) => {
            console.log('User connected')

            socket.on('joinRoom', (orderId)=>{
                socket.join(orderId);
                console.log(`User Joined room ${orderId}`)
            })

            socket.on('disconnect', () => {
                console.log('User disconnected')
            })
        })
    })
}

start();
