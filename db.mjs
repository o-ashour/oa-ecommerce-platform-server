import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConnection = await mysql.createConnection(process.env.MYSQL_PUBLIC_URL);

export default dbConnection;
