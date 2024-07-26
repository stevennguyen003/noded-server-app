import * as dao from "./dao.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import pdf from "pdf-parse";


// Using Claude AI, generate questions from a PDF
export async function generateQuestions(url) {
    try {
        const response = await axios.post(
            'https://api.anthropic.com/v1/completions',
            {
                model: "claude-3-sonnet-20240229",
                prompt: `Based on the following text, generate 5 multiple-choice questions with 4 options each. Format the output as a JSON array of question objects, each with a 'question' field, an 'options' array, and a 'correctAnswer' field:\n\n${url}`,
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

// RESTful APIs
export default function QuizRoutes(app) {

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

            const noteId = req.params.noteId;
            const createdQuizzes = [];

            for (let question of questions) {
                const quizData = {
                    question: question.question,
                    options: question.options,
                    correctAnswer: question.correctAnswer
                };
                const newQuiz = await dao.addQuizToNote(noteId, quizData);
                createdQuizzes.push(newQuiz);
            }

            fs.unlinkSync(req.file.path);

            res.json(createdQuizzes);
        } catch (error) {
            console.error("Error processing PDF and generating questions:", error);
            res.status(500).send("Error processing PDF and generating questions");
        }
    }
    app.post("/api/quizzes/generate/:userId/:noteId", upload.single("pdf"), handlePdfUploadAndGeneration);
}