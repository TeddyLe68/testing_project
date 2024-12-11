import dotenv from "dotenv";
import express from "express";
import ejs from "ejs";
import path from "path";
import expressLayout from "express-ejs-layouts";
import mongoose from "mongoose";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import passport from "passport";
import { EventEmitter } from "events";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3300;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
import connectDB from "./app/config/db.js";
connectDB();
// Session store
const mongoStore = new MongoStore({
  mongoUrl: process.env.MONGO_CONNECTION_URL,
  collectionName: "sessions",
});

// Event emitter
const eventEmitter = new EventEmitter();
app.set("eventEmitter", eventEmitter);

// Session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hour
  })
);

// Passport config
import passportInit from "./app/config/passport.js";
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// Assets
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});
// set Template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

import webRoutes from "./routes/web.js";
webRoutes(app);
app.use((req, res) => {
  res.status(404).render("errors/404");
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Socket
import { Server } from "socket.io";
const io = new Server(server);
io.on("connection", (socket) => {
  // Join
  socket.on("join", (orderId) => {
    socket.join(orderId);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
