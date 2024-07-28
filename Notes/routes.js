import Anthropic from "@anthropic-ai/sdk";
import * as dao from "./dao.js";
import "dotenv/config";
import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';
import { createWorker } from 'tesseract.js';

// RESTful APIs
export default function NoteRoutes(app) {

    const parseClaudeResponse = (response) => {
        const quizzes = [];
        const questions = response.split('\n\n');
        
        questions.forEach((question, index) => {
            const lines = question.split('\n');
            const questionText = lines[0].replace(/^\d+\.\s*/, '');
            const options = lines.slice(1, -1).map(line => line.replace(/^[a-d]\)\s*/, ''));
            const correctAnswer = lines[lines.length - 1].replace('Correct answer: ', '');
            
            quizzes.push({
                question: questionText,
                options: options,
                correctAnswer: correctAnswer
            });
        });
        console.log("Parsing:", quizzes);
        return quizzes;
    };

    const extractPDFContent = async (pdfPath) => {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);

        if (data.text.trim().length > 0) {
            // Text-based PDF
            return data.text;
        } else {
            // Likely image-based PDF, use OCR
            const worker = await createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(pdfPath);
            await worker.terminate();
            return text;
        }
    }

    const generateQuestions = async (content) => {
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    
        const response = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1000,
            temperature: 0.5,
            system: "You are a professor trying to formulate quiz questions for your students.",
            messages: [
                {
                    role: "user",
                    content: `Given the following content, generate 5 multiple-choice questions and give the correct answer as well. Format each question as follows:
                    1. Question text
                    a) Option 1
                    b) Option 2
                    c) Option 3
                    d) Option 4
                    Correct answer: [letter of correct option]
    
                    Repeat this format for all 5 questions.\n\n${content}`
                }
            ]
        });
        return response.content[0].text;
    };

    const processNotesAndGenerateQuestions = async (req, res) => {
        try {
            const noteId = req.params.noteId;
            // Fetch the note document from MongoDB using the noteId
            const note = await dao.findNoteById(noteId);
            if (!note) {
                return res.status(404).json({ error: "Note not found" });
            }
            // Extract the PDF file path from the note's url field
            const pdfPath = path.resolve(process.cwd(), note.url);
            // Extract content from the PDF
            const content = await extractPDFContent(pdfPath);
            // Generate questions using Claude
            const rawQuestions = await generateQuestions(content);
            // Parse the response into quiz objects
            const parsedQuizzes = parseClaudeResponse(rawQuestions);
            // Update the note document with the generated questions
            await dao.updateNoteWithQuiz(noteId, parsedQuizzes);
            // Send the generated questions as the API response
            res.json({ quizzes: parsedQuizzes });
        } catch (error) {
            console.error("Error processing PDF and generating questions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

    app.get("/api/notes/:noteId/generate", processNotesAndGenerateQuestions);
}