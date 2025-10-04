import Redis from "ioredis";

const isProduction = process.env.NODE_ENV === "production";

const redis = isProduction
  ? new Redis(process.env.REDIS_URL) // non-TLS for Redis Cloud
  : new Redis("redis://127.0.0.1:6379"); // local dev

redis.on("connect", () => console.log("Redis connected!"));
redis.on("error", (err) => console.error("Redis error:", err));

export default redis;
