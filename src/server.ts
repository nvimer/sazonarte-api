import express, { Request, Response, Application } from "express";
import config from "./config/config";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import { logger } from "./config/logger";
import { requestLogger } from "./middlewares/morgan.middleware";

const app: Application = express();

const whitelist = ["http://localhost:3000"];

const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, origin?: boolean) => void,
  ) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

if (process.env.NODE_ENV === "production") {
  app.use(cors(corsOptions));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      xPermittedCrossDomainPolicies: false,
    }),
  );
} else {
  app.use(cors());
}

requestLogger(app);
app.get("/api/v1", (_: Request, res: Response) => {
  logger.info("GET / request received");
  res.send("Restaurant SazonArte API");
});

app.listen(config.port, () =>
  logger.info(`Server is running on port: http://localhost:${config.port}`),
);
