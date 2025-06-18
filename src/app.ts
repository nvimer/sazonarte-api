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
import passport from "passport";
import { jwtStrategy } from "./strategies/passport-jwt.strategy";
import swaggerDocs from "./config/swagger";
import { config } from "./config";

const port = config.port;

const app: Application = express();

// GLOBAL MIDDLEWARES

// Body parser in JSON petition and URL Encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors config
const whitelist = [
  `http://localhost:${port}`,
  config.appUrl,
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, origin?: boolean) => void,
  ) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

if (process.env.NODE_ENV === "production") {
  app.use(cors(corsOptions));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      xPermittedCrossDomainPolicies: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: { policy: "unsafe-none" },
    }),
  );
} else {
  app.use(cors());
}

// Swagger Documentation
swaggerDocs(app, port);
// Logger for capting errors
requestLogger(app);

// Strategies for auth users
passport.use(jwtStrategy);
app.use(passport.initialize());

// API Routes
app.use("/api/v1", apiV1Router);

app.get("/api/v1", (_: Request, res: Response) => {
  logger.info("GET / request received");
  res.send("Restaurant SazonArte API");
});

// Health check endpoint
app.get("/api/health", (_: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      whitelist,
      origin: process.env.CORS_ORIGIN,
    },
  });
});

// middlewares for handler Error and NotFound routes
app.use(notFoundHandler);
app.use(errorHandler as ErrorRequestHandler);

export default app;
