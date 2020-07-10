import Redis from "ioredis";
require("dotenv").config();

export const RedisConfigOption = {
  host: process.env.REDIS_DEFAULT_HOST,
  port: process.env.REDIS_DEFAULT_PORT,
  db: process.env.REDIS_DEFAULT_DB_NAME,
  retry_strategy: options => {
    return Math.max(options.attempt * 100, 3000);
  }
};
const redis = new Redis(RedisConfigOption);

export default redis;
