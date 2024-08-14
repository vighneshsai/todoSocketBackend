import express from "express";
import * as dotenv from "dotenv";
import apiRouter from './routes/api.js'
import cors from 'cors';
import io from './webSocket.js';
import cron from 'node-cron';
import { checkDueTodos } from "./DAO/toDo.js";
const app = express();

dotenv.config();
app.use(express.json());

app.use(cors({
   // Allow requests from this origin
    origin: process.env.BASE_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
    credentials: true // Allow cookies to be sent
}));


app.use("/api", apiRouter);

cron.schedule('* * * * *', async () => {
    await checkDueTodos(io);
});

app.listen(18000, (req, res) => {
    console.log("Operation port 18000 port is running");
});
