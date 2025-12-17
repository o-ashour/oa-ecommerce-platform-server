import mysql from 'mysql2/promise';
import process from 'dotenv';

const dbConnection = await mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
})

export default dbConnection;
