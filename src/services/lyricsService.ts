import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function searchSongOnCifraClub(query: string): Promise<Partial<Song> | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Encontre a letra e as cifras da música "${query}" no site Cifra Club. 
      Retorne o título da música, o nome do artista, o BPM (se disponível, senão use 120), a letra completa e as cifras.
      As cifras devem estar integradas na letra ou em um formato legível para músicos.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            chords: { type: Type.STRING, description: "Letra com cifras integradas" },
            lyrics: { type: Type.STRING, description: "Apenas a letra limpa" }
          },
          required: ["title", "artist", "chords"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: result.title,
      artist: result.artist,
      bpm: result.bpm || 120,
      chords: result.chords,
      // Note: We might need to update the Song type to include lyrics
    };
  } catch (error) {
    console.error("Erro ao buscar música:", error);
    return null;
  }
}
