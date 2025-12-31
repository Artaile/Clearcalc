import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load env from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Actually there isn't a direct listModels on the client instance usually, 
        // it's usually valid on the model manager, but let's try to just hit one we know should exist 
        // or use the unexpected `listModels` if the SDK supports it (it usually does via `check`).
        // Wait, the error message literally said "Call ListModels".
        // In the Node SDK:
        // const genAI = new GoogleGenerativeAI(API_KEY);
        // const model = genAI.getGenerativeModel({ model: "MODEL_NAME" });

        // There isn't a visible listModels on genAI instance in some versions.
        // Let's try to fetch a specific known stable one "gemini-pro" again or "gemini-1.0-pro".

        console.log("Testing gemini-1.5-flash-001...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash-001:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash-001:", error.message);

        try {
            console.log("Testing gemini-pro...");
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello");
            console.log("Success with gemini-pro:", resultPro.response.text());
        } catch (e) {
            console.error("Error with gemini-pro:", e.message);
        }
    }
}

listModels();
