import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const options = {
  host: process.env.TIDB_HOST || "127.0.0.1",
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER || "root",
  password: process.env.TIDB_PASSWORD || "",
  database: process.env.TIDB_DATABASE || "test",
  ssl:
    process.env.TIDB_ENABLE_SSL === "true"
      ? {
          minVersion: "TLSv1.2",
          ca: process.env.TIDB_CA_PATH
            ? fs.readFileSync(process.env.TIDB_CA_PATH)
            : undefined,
        }
      : null,
};

const pool = createPool(options);

export default pool;
