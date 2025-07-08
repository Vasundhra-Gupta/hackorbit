import { app } from './app.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { connectRedis } from './db/connectRedis.js';
import { CORS_OPTIONS } from './constants/options.js';
import { socketAuthenticator } from './middlewares/index.js';

const redisClient = await connectRedis();
const http = createServer(app);
const io = new Server(http, { cors: CORS_OPTIONS });

// middleware for extracting user from socket
io.use((socket, next) => {
    const req = socket.request;
    const res = {};

    cookieParser()(req, res, async (err) => {
        await socketAuthenticator(req, err, socket, next);
    });
});

io.on('connection', async (socket) => {
    try {
        console.log("Socket Connected")
    } catch (err) {
        console.error('Error in socket:', err);
        process.exit(1);
    }
});

export { io, redisClient, http };
