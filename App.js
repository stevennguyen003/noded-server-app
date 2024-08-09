import "dotenv/config";
import session from "express-session";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Hello from "./Hello.js";
import UserRoutes from "./Users/routes.js";
import GroupRoutes from "./Groups/routes.js";
import NoteRoutes from "./Notes/routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
mongoose.connect(CONNECTION_STRING);

const app = express();

app.use(cors({
    credentials: true,
    origin: ["https://noded.netlify.app", "http://localhost:3000"]
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
        domain: "https://noded-server-app.onrender.com"
    };
}

// Serve files from the 'uploads' directory
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/notes', express.static(path.join(__dirname, 'notes')));

app.use(session(sessionOptions));
app.use(express.json());
GroupRoutes(app);
UserRoutes(app);
NoteRoutes(app);
Hello(app);

app.listen(process.env.PORT || 4000);