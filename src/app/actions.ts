"use server";

import Groq from "groq-sdk";

export async function getFinancialInsight(prompt: string) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return "API Key missing. Please add GROQ_API_KEY to your environment variables.";
    }

    try {
        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 150,
        });

        return completion.choices[0]?.message?.content || "No insight generated.";

    } catch (error: any) {
        console.error("Groq AI Error:", error);

        if (error.status === 429) {
            return "AI Usage Limit Reached. Please wait a moment.";
        }

        if (error.status === 401) {
            return "Invalid API Key. Please check your Groq configuration.";
        }

        return "AI Service Unavailable. Please try again later.";
    }
}
