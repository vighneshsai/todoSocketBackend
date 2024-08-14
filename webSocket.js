import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const port = 8080;

// Create an HTTP server using Express
const server = createServer(app);

// Create a Socket.io server using the same HTTP server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.emit('message', 'Welcome to the Socket.io server!');
});

// Express routes can be defined here
app.get('/', (req, res) => {
    res.send('Hello, HTTP client!');
});

// The server listens on port 8080 for both HTTP and WebSocket connections
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default io;
