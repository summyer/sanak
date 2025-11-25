import { GoogleGenAI } from "@google/genai";
import { AIComment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a witty, sometimes sarcastic, retro-game AI commentator watching a game of Snake. 
Your goal is to provide a SINGLE SHORT sentence (max 15 words) reacting to the game outcome.
- If the score is very low (< 5), be roasting and sarcastic.
- If the score is decent (5-15), be mildly impressed but critical.
- If the score is high (> 15), be praising and excited.
- Keep it fun and related to snakes, hunger, or walls.
`;

export const generateGameOverCommentary = async (score: number, cause: 'wall' | 'self' | 'obstacle'): Promise<AIComment> => {
  try {
    const causeText = cause === 'wall' ? 'a wall' : cause === 'obstacle' ? 'an obstacle' : 'themselves';
    const prompt = `The player just died by hitting ${causeText}. Final Score: ${score}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 50,
        temperature: 0.9,
      }
    });

    const text = response.text || "Game Over!";
    
    let mood: AIComment['mood'] = 'neutral';
    if (score < 5) mood = 'sarcastic';
    else if (score > 15) mood = 'happy';
    else mood = 'encouraging';

    return { text, mood };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Connection to AI Mainframe lost... but you still lost the game.",
      mood: 'neutral'
    };
  }
};