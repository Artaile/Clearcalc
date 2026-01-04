"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Ideally this should be in a server action to hide the key, but for this client-side demo we might use it here or proxy.
// Given Requirements: "Logic: Pure JavaScript", "AI: Google AI Studio".
// If we use pure JS client-side, the key is exposed. 
// I will create a server action to proxy the request if possible, or use a simple API route.
// For now, I'll create a simple function that can be updated.

export async function generateInsight(prompt: string) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("Gemini API Key missing");
            return "AI Insight unavailable (Missing Key)";
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Switching to gemini-2.5-flash-lite as requested by user.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI Error:", error);
        if (error.message?.includes("429") || error.status === 429) {
            return "AI Usage Limit Reached. Please try again later.";
        }
        return "AI Insight currently unavailable.";
    }
}

export function constructPrompt(type: string, inputs: Record<string, any>, result: any) {
    return `
    You are a friendly financial assistant.
    Calculator Type: ${type}
    Inputs: ${JSON.stringify(inputs)}
    Result: ${JSON.stringify(result)}
    
    Explain the result in simple language.
    Warn if risky (e.g. high EMI).
    Give a financial suggestion.
    Max 2-3 short sentences.
    Tone: Professional but friendly, max 1 emoji.
    IMPORTANT: Always use '₹' (Indian Rupee symbol) for ANY money values. NEVER use '$'.
    No advisor approach/disclaimers.
  `;
}
