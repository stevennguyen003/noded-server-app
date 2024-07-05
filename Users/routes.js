import * as dao from "./dao.js";

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
        const user = await dao.findUserByUsername(req.body.username);
        if (user) {
            res.status(400).json(
                { message: "Username already taken" });
        }
        const currentUser = await dao.createUser(req.body);
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
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

    app.post("/api/users", createUser);
    app.get("/api/users", findAllUsers);
    app.get("/api/users/:userId", findUserById);
    app.put("/api/users/:userId", updateUser);
    app.delete("/api/users/:userId", deleteUser);
    app.post("/api/users/signup", signup);
    app.post("/api/users/signin", signin);
    app.post("/api/users/signout", signout);
}