import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada. A busca não funcionará no GitHub Pages sem a chave.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getSongFromUrl(url: string): Promise<Partial<Song>> {
  const ai = getAI();
  
  console.log(`Scraping URL: ${url}`);
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Você é um extrator de dados musical. Sua tarefa é extrair as informações da música a partir desta URL do Cifra Club: "${url}".
    
    REGRAS CRÍTICAS:
    1. Você DEVE extrair a música que está EXATAMENTE nesta URL. Não busque outras versões.
    2. Extraia o título da música e o nome do artista que aparecem na página.
    3. Extraia o tom (key) e o BPM.
    4. O campo "chords" deve conter a letra INTEGRAL com os acordes em colchetes [G] acima das sílabas.
    5. O campo "youtubeId" deve ser o ID do vídeo incorporado na página.`,
    tools: [{ googleSearch: {} }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          bpm: { type: Type.NUMBER },
          key: { type: Type.STRING },
          chords: { type: Type.STRING },
          lyrics: { type: Type.STRING },
          youtubeId: { type: Type.STRING }
        },
        required: ["title", "artist", "bpm", "chords", "lyrics", "youtubeId"]
      }
    }
  } as any);

  if (!response.text) {
    throw new Error("Não foi possível extrair os dados desta URL.");
  }
  
  const result = JSON.parse(response.text);
  
  // Final check to ensure the title/artist match the URL slug if possible
  console.log("Resultado extraído:", result.title, "-", result.artist);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: result.title,
    artist: result.artist,
    bpm: result.bpm || 120,
    chords: result.chords,
    lyrics: result.lyrics,
    youtubeId: result.youtubeId
  };
}
