import "dotenv/config";
import session from "express-session";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Hello from "./Hello.js";

const CONNECTION_STRING = process.env.DB_CONNECTION_STRING
mongoose.connect(CONNECTION_STRING);
const app = express();
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));
const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
};
if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: "none",
        secure: true,
        domain: "http://localhost:4000",
    };
}
app.use(session(sessionOptions));
app.use(express.json());
Hello(app);
app.listen(process.env.PORT || 4000);