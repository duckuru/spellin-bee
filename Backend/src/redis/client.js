import Redis from "ioredis";

// Detect environment
const isProduction = process.env.NODE_ENV === "production";

let redis;

if (isProduction) {
  // Connect to Redis Cloud in production
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASS,
    tls: {} // required for Redis Cloud
  });
} else {
  // Connect to local Redis for development
  redis = new Redis(process.env.LOCAL_REDIS_URL);
}

// Event listeners
redis.on("connect", () => console.log("Redis connected!"));
redis.on("error", (err) => console.error("Redis error:", err));

// Example usage
(async () => {
  try {
    await redis.set("foo", "bar");
    const value = await redis.get("foo");
    console.log("Value from Redis:", value); // >>> "bar"
  } catch (err) {
    console.error("Redis operation error:", err);
  }
})();
