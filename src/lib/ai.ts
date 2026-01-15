"use client";

import { getFinancialInsight } from "@/app/actions";

export async function generateInsight(prompt: string) {
    try {
        return await getFinancialInsight(prompt);
    } catch (error) {
        console.error("Client Bridge Error:", error);
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
