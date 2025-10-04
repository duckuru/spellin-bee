import Redis from "ioredis";

const isProduction = process.env.NODE_ENV === "production";

const redis = new Redis({
  host: isProduction ? process.env.REDIS_HOST : "127.0.0.1",
  port: isProduction ? Number(process.env.REDIS_PORT) : 6379,
  username: isProduction ? process.env.REDIS_USER : undefined,
  password: isProduction ? process.env.REDIS_PASS : undefined,
  tls: isProduction ? {} : undefined
});

redis.on("connect", () => console.log("Redis connected!"));
redis.on("error", (err) => console.error("Redis error:", err));

export default redis;
