import express, {
  Request,
  Response,
  Application,
  ErrorRequestHandler,
} from "express";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import { logger } from "./config/logger";
import { requestLogger } from "./middlewares/morgan.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import apiV1Router from "./api/v1/routes";
import { notFoundHandler } from "./middlewares/notFound.middleware";

const app: Application = express();

// GLOBAL MIDDLEWARES

// Body parser in JSON petition and URL Encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors config
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

// API Routes

app.use("/api/v1", apiV1Router);

app.get("/api/v1", (_: Request, res: Response) => {
  logger.info("GET / request received");
  res.send("Restaurant SazonArte API");
});

app.use(notFoundHandler);
app.use(errorHandler as ErrorRequestHandler);

export default app;
