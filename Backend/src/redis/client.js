import Redis from "ioredis";
import { ENV } from "../lib/env.js";

const redis = new Redis(ENV.REDIS_URL,{
  tls: {},
});

export default redis;
