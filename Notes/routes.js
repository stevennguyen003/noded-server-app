import Anthropic from "@anthropic-ai/sdk";
import * as dao from "./dao.js";
import "dotenv/config";
import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';
import { createWorker } from 'tesseract.js';

// RESTful APIs
export default function NoteRoutes(app) {

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
                    content: `Given the following content, generate 5 multiple-choice questions and give the correct answer as well:\n\n${content}`
                }
            ]
        });
        return response.content[0].text;
    }

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
            const questions = await generateQuestions(content);

            // // Update the note document with the generated questions
            // await dao.updateNoteQuizIds(noteId, questions);

            // Send the generated questions as the API response
            // res.json({ questions });
            console.log(questions);
        } catch (error) {
            console.error("Error processing PDF and generating questions:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

    app.get("/api/notes/:noteId/generate", processNotesAndGenerateQuestions);
}