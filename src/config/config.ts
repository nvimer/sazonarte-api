import { ConfigInterface } from "../interfaces/config.interface";
import "dotenv/config";

const config: ConfigInterface = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
