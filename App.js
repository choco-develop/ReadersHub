const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./Utils/swaggerConfig");
const bookRouter = require(`${__dirname}/Routers/bookRouter.js`);
const moviesRouter = require(`${__dirname}/Routers/movieRouter.js`);
const userRouter = require("./Routers/userRouter");
const authorRouter = require("./Routers/authorRouter");
const reviewRouter = require("./Routers/reviewRouter");
const ApiError = require("./Utils/apiError");
const errorHandler = require("./Controllers/errorController");

const app = express();

// GLOBAL MIDDLEWARE

// parse json from req.body
app.use(express.json());

// set security header in response
app.use(helmet());
// sanitize request from $ an other symbols which can SQL injections
app.use(mongoSanitize());
// xss --cross site scripting sanitization
app.use(xss());
//Prevent parameter pollution-- allow only whitelisted fields to have multiple queries
app.use(
  hpp({
    whitelist: ["title", "writer", "genre", "pages", "rating"],
  }),
);
// Allow queries to be attached to request
app.set("query parser", "extended");
// Response formatting
app.set("json spaces", 2);
// logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Attach time to request
app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

// set rate-limit
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: "Too many requests, try again in 5 mins",
});
app.use("/api", globalLimiter);

// SWAGGER UI route

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

const router = express.Router();

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/authors", authorRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use((req, res, next) => {
  const err = new ApiError(`No resource exist at ${req.originalUrl}`, 404);
  next(err);
});

// Error handling
app.use(errorHandler);

app.use(router);

module.exports = app;
