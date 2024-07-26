import * as dao from "./dao.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ObjectId } from 'mongodb';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const notesDir = "noteUploads/";
        fs.mkdir(notesDir, { recursive: true }, (err) => {
            if (err) {
                console.error("Failed to create directory:", err);
                cb(err, notesDir);
            } else {
                console.log("Notes directory ensured:", notesDir);
                cb(null, notesDir);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${req.params.groupId}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});


const upload = multer({ storage: storage });

// RESTful APIs
export default function GroupRoutes(app) {

    // Creates a user for the session
    const createGroup = async (req, res) => {
        const group = await dao.createGroup(req.body);
        // Fetches any updates in user information
        const updatedGroup = await dao.findGroupById(group._id);
        res.json(updatedGroup);
    };

    // Deletes a group
    const deleteGroup = async (req, res) => {
        const status = await dao.deleteGroup(req.params.groupId);
        res.json(status);
    };

    // Find all groups in the database
    const findAllGroups = async (req, res) => {
        const groups = await dao.findAllGroups();
        res.json(groups);
    };

    // Find group by their unique id
    const findGroupById = async (req, res) => {
        try {
            const { groupId } = req.params;
            if (!ObjectId.isValid(groupId)) {
                return res.status(400).json({ error: 'Invalid group ID' });
            }
            const group = await dao.findGroupById(new ObjectId(groupId));
            if (!group) {
                return res.status(404).json({ error: 'Group not found' });
            }
            res.json(group);
        } catch (error) {
            console.error('Error finding group:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Find group by their unique invite link
    const findGroupByInviteCode = async (req, res) => {
        const group = await dao.findGroupByInviteCode(req.params.inviteCode);
        res.json(group);
    }

    // Update a group
    const updateGroup = async (req, res) => {
        const status = await dao.updateGroup(req.params.groupId, req.body);
        const currentGroup = await dao.findGroupById(req.params.groupId);
        res.json(status);
    };

    // Upload a profile picture for the group
    const uploadProfilePicture = async (req, res) => {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        try {
            await dao.uploadProfilePicture(req.params.groupId, req.file.path);
            res.send(`File uploaded successfully: ${req.file.path}`);
        } catch (err) {
            res.status(500).send("Failed to update group with new profile picture.");
        }
    };

    // Upload a note for the group
    const uploadNote = async (req, res) => {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        try {
            const noteData = {
                url: req.file.path,
                name: req.file.originalname,
                questionIds: []
            };
            const newNote = await dao.addNoteToGroup(req.params.groupId, noteData);
            console.log("Note uploaded:", newNote);
            res.json(newNote); // Send back the created note as JSON
        } catch (err) {
            console.error("Error uploading note:", err);
            res.status(500).send("Failed to upload note and update group.");
        }
    };

    app.post("/api/groups", createGroup);
    app.get("/api/groups", findAllGroups);
    app.get("/api/groups/id/:groupId", findGroupById);
    app.get("/api/groups/invite/:inviteCode", findGroupByInviteCode);
    app.put("/api/groups/:groupId", updateGroup);
    app.delete("/api/groups/:groupId", deleteGroup);
    app.post(
        "/api/groups/:groupId/uploadProfilePicture",
        upload.single("profilePicture"),
        uploadProfilePicture
    );
    app.post(
        "/api/groups/:groupId/uploadNote",
        upload.single("note"),
        uploadNote
    );
    app.post("/api/notes/upload/:groupId", upload.single("pdf"), async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const noteData = {
                name: req.file.originalname,
                url: req.file.path
            };
            const pdfBuffer = fs.readFileSync(req.file.path);

            const newNote = await dao.addNoteToGroup(groupId, noteData, pdfBuffer);

            res.json(newNote);
        } catch (error) {
            console.error("Error uploading note and generating quiz:", error);
            res.status(500).send("Error uploading note and generating quiz");
        }
    });
}