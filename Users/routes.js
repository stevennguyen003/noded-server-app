import * as dao from "./dao.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = "uploads/";
        fs.mkdir(uploadsDir, { recursive: true }, (err) => {
            if (err) {
                console.error("Failed to create directory:", err);
                cb(err, uploadsDir);
            } else {
                console.log("Uploads directory ensured:", uploadsDir);
                cb(null, uploadsDir);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});


const upload = multer({ storage: storage });


// RESTful APIs
export default function UserRoutes(app) {

    // Creates a user for the session
    const createUser = async (req, res) => {
        const user = await dao.createUser(req.body);
        // Fetches any updates in user information
        const updatedUser = await dao.findUserById(user._id);
        req.session["currentUser"] = updatedUser;
        res.json(updatedUser);
    };

    // Deletes a user
    const deleteUser = async (req, res) => {
        const status = await dao.deleteUser(req.params.userId);
        res.json(status);
    };

    // Find all users in the database
    const findAllUsers = async (req, res) => {
        const users = await dao.findAllUsers();
        res.json(users);
    };

    // Find user by their unique id
    const findUserById = async (req, res) => {
        const user = await dao.findUserById(req.params.userId);
        res.json(user);
    };

    // Update a user
    const updateUser = async (req, res) => {
        const { userId } = req.params;
        const status = await dao.updateUser(userId, req.body);
        currentUser = await dao.findUserById(userId);
        res.json(status);
    };

    // Signup
    const signup = async (req, res) => {
        try {
            const user = await dao.findUserByUsername(req.body.username);
            if (user) {
                return res.status(400).json({ message: "Username already taken" });
            }

            const currentUser = await dao.createUser(req.body);
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    // Signin with credentials
    const signin = async (req, res) => {
        const { username, password } = req.body;
        const currentUser = await dao.findUserByCredentials(username, password);
        if (currentUser) {
            req.session["currentUser"] = currentUser;
            res.json(currentUser);
        } else {
            res.sendStatus(401);
        }
        console.log(process.env.FRONTEND_URL);
    };

    // Signout of session
    const signout = (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    };

    // Grab the profile info of the current user
    const profile = async (req, res) => {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
            res.sendStatus(401);
            return;
        }
        // Fetch the latest user data from the database
        const updatedUser = await dao.findUserById(currentUser._id);
        // Update the session with the latest data
        req.session["currentUser"] = updatedUser;
        res.json(updatedUser);
    };

    // Upload a profile picture for the user
    const uploadProfilePicture = async (req, res) => {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        try {
            await dao.uploadProfilePicture(req.params.userId, req.file.path);
            // Update the session with the new profile picture
            if (req.session.currentUser) {
                req.session.currentUser.profilePicture = req.file.path;
            }
            res.send(`File uploaded successfully: ${req.file.path}`);
        } catch (err) {
            res.status(500).send("Failed to update user with new profile picture.");
        }
    };

    app.post("/api/users", createUser);
    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
    app.post("/api/users/profile", profile);
    app.post(
        "/api/users/:userId/uploadProfilePicture",
        upload.single("profilePicture"),
        uploadProfilePicture
    );
}