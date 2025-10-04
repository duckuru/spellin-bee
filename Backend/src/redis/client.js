import Redis from "ioredis";

const isProduction = process.env.NODE_ENV === "production";

const redis = isProduction
  ? new Redis(process.env.REDIS_URL) // Connects via TLS automatically
  : new Redis("redis://127.0.0.1:6379"); // Local dev

redis.on("connect", () => console.log("Redis connected!"));
redis.on("error", (err) => console.error("Redis error:", err));

export default redis;
