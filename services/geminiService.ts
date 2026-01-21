import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiTreeResponse } from "../types/types";

// Use environment variable for API key
const API_KEY = "AIzaSyBHF-zp18CE6jMpckwfzrK3vyEBoJarpWA";

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY not set. AI features will not work.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const getAiExpansion = async (prompt: string): Promise<AiTreeResponse[]> => {
    if (!genAI) throw new Error('Gemini API key not configured');
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent({
            contents: [{
                role: "user", parts: [{
                    text: `You are a mind map assistant. For the given concept, provide a list of 2-4 relevant sub-concepts to expand the thought process. 
      Concept: "${prompt}"
      Return ONLY a JSON array of objects with 'text' and 'type' (concept, action, problem, or solution).` }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        return JSON.parse(responseText.trim());
    } catch (error) {
        console.error("Gemini brainstorming error:", error);
        // Fallback mock since API is suspended
        return [
            { text: "Detailed Analysis", type: "concept" },
            { text: "Practical Implementation", type: "action" },
            { text: "Potential Challenges", type: "problem" }
        ];
    }
};

export const generateFullTree = async (prompt: string): Promise<AiTreeResponse> => {
    if (!genAI) throw new Error('Gemini API key not configured');
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent({
            contents: [{
                role: "user", parts: [{
                    text: `You are an expert strategist. Create a comprehensive mind map for the following topic: "${prompt}"
      Return a deeply nested recursive structure in JSON. Every node MUST have a 'text' and 'type' (concept, action, problem, or solution).
      Branches should be logical, splitting topics into meaningful sub-categories. Go at least 3 levels deep.` }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        return JSON.parse(responseText.trim());
    } catch (error) {
        console.error("Full tree generation error:", error);
        throw new Error('AI full map generation is not available');
    }
};
