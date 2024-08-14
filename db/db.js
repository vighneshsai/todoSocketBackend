// server/db.js
import { Sequelize } from 'sequelize';
import * as dotenv from "dotenv";
dotenv.config();

const dbConnectionObj = new function() {
    var db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        dialect: "mysql",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
    });
    console.log("db connected successfully")

    return db;
}
export default dbConnectionObj;