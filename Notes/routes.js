import * as dao from "./dao.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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
export default function NoteRoutes(app) {
}