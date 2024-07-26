import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pdf from 'pdf-parse';
import { generateQuestions } from './routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLatestFile(directory) {
    const files = fs.readdirSync(directory);
    return files.reduce((latest, file) => {
        return file > latest ? file : latest;
    });
}

async function testGenerateQuestions() {
    const noteUploadsDir = path.join(__dirname, 'noteUploads');
    const latestPdfFile = getLatestFile(noteUploadsDir);
    const pdfPath = path.join(noteUploadsDir, latestPdfFile);

    try {
        console.log('Attempting to read file:', pdfPath);
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdf(dataBuffer);
        const pdfText = pdfData.text;

        const questions = await generateQuestions(pdfText);
        console.log('Generated questions:', JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error('Error testing generateQuestions:', error);
    }
}

testGenerateQuestions();