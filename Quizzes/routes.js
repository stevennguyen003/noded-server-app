import * as dao from "./dao.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import pdf from "pdf-parse";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = "uploads/pdfs/";
        fs.mkdir(uploadsDir, { recursive: true }, (err) => {
            if (err) {
                console.error("Failed to create directory:", err);
                cb(err, uploadsDir);
            } else {
                console.log("PDF uploads directory ensured:", uploadsDir);
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

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// RESTful APIs
export default function QuizRoutes(app) {
    // Using Claude AI, generate questions from a PDF
    async function generateQuestions(pdfText) {
        try {
            const response = await axios.post(
                'https://api.anthropic.com/v1/completions',
                {
                    model: "claude-3-sonnet-20240229",
                    prompt: `Based on the following text, generate 5 multiple-choice questions with 4 options each. Format the output as a JSON array of question objects, each with a 'question' field, an 'options' array, and a 'correctAnswer' field:\n\n${pdfText}`,
                    max_tokens_to_sample: 1500,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`
                    }
                }
            );
            const questionsText = response.data.completion;
            const questions = JSON.parse(questionsText);
            return questions;
        } catch (error) {
            console.error('Error generating questions:', error);
            throw error;
        }
    }

    // Handling PDF upload before generating questions
    async function handlePdfUploadAndGeneration(req, res) {
        if (!req.file) {
            return res.status(400).send("No PDF file uploaded");
        }
        try {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdf(dataBuffer);
            const pdfText = pdfData.text;

            const questions = await generateQuestions(pdfText);
            const savedQuestions = await dao.saveQuestions(questions, req.params.userId);

            fs.unlinkSync(req.file.path);

            res.json(savedQuestions);
        } catch (error) {
            console.error("Error processing PDF and generating questions:", error);
            res.status(500).send("Error processing PDF and generating questions");
        }
    }

    app.post("/api/quizzes/generate/:userId", upload.single("pdf"), handlePdfUploadAndGeneration);
}