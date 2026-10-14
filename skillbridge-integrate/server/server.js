import "dotenv/config";
import { connectRedis } from "./src/lib/redis.js";
import dns from "dns";

//changing dns because of db not connected
dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function start() {
  try {
    await connectRedis();
    console.log("Redis connected");
  } catch (err) {
    console.error("Redis failed to connect on startup, continuing without it:", err.message);
  }

  // dynamic import — delays evaluating app.js (and everything it imports,
  // including the rate limiters) until AFTER Redis has had a chance to connect
  const { default: app } = await import("./src/app.js");

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();

