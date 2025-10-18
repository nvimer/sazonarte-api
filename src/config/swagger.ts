import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import { Application, Request, Response } from "express";
import { logger } from "./logger";

const PORT = process.env.PORT;
const APP_URL = process.env.APP_URL;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SazonArte Restaurant Management API",
      version,
      description:
        "API documentation for SazonArte Restaurant Management System",
      contact: {
        name: "Sazonarte Repo",
        url: "https://github.com/niccommit/sazonarte-api",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: "Development server",
      },
      {
        url: APP_URL,
        description: "Production server",
      },
    ],
  },
  apis: ["./docs/**/*.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);

export default function swaggerDocs(app: Application, port: number) {
  // Serve Swagger UI
  app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "SazonArte API Documentation",
    }),
  );

  // Serve Swagger JSON
  app.get("/api/v1/docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(`Docs available at: http://localhost:${port}/api/v1/docs`);
}
