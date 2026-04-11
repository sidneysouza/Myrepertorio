import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function searchSongOnCifraClub(query: string): Promise<Partial<Song> | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Encontre a letra e as cifras da música "${query}" no site Cifra Club. 
      Retorne o título da música, o nome do artista, o BPM (se disponível, senão use 120), a letra completa e as cifras.
      
      IMPORTANTE PARA O FORMATO DAS CIFRAS:
      As cifras devem estar em uma linha SEPARADA acima da letra, exatamente como no Cifra Club. Use espaços para alinhar o acorde com a sílaba correta.
      Exemplo:
      [G]           [D]
      Noite de um dia azul
      
      Use colchetes [Acorde] para que eu possa identificá-los no código.
      Também encontre o ID do vídeo oficial ou áudio oficial desta música no YouTube.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            chords: { type: Type.STRING, description: "Letra com cifras em linhas separadas acima da letra, usando espaços para alinhamento e colchetes para acordes." },
            lyrics: { type: Type.STRING, description: "Apenas a letra limpa" },
            youtubeId: { type: Type.STRING, description: "ID do vídeo do YouTube" }
          },
          required: ["title", "artist", "chords", "youtubeId"]
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
      lyrics: result.lyrics,
      youtubeId: result.youtubeId
    };
  } catch (error) {
    console.error("Erro ao buscar música:", error);
    return null;
  }
}
