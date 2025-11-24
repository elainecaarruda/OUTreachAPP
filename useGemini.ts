import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

export const useGemini = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            const res = reader.result as string;
            if (res) {
              const data = res.split(',')[1];
              resolve(data);
            } else {
              reject("Empty result");
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                parts: [
                    { text: "Transcribe the following audio content into text. Return only the transcription without any introductory text." },
                    {
                        inlineData: {
                            mimeType: audioBlob.type.includes('mp4') ? 'audio/mp4' : 'audio/webm', 
                            data: base64Data
                        }
                    }
                ]
            }
        ]
      });

      return response.text || "";
    } catch (error) {
      console.error("Transcription failed:", error);
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  const improveText = async (text: string, language: string = 'Portuguese'): Promise<string> => {
    setIsProcessing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const langMap: Record<string, string> = {
          'pt-BR': 'Brazilian Portuguese',
          'pt-PT': 'European Portuguese',
          'en': 'English',
          'de': 'German'
        };
        
        const targetLang = langMap[language] || language;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: `Improve the following text for clarity, grammar, coherence and impact while maintaining the original meaning and tone. Return only the improved text in ${targetLang}.\n\nText: "${text}"` }] }]
        });
        return response.text || text;
    } catch (error) {
        console.error("AI Improvement failed:", error);
        return text;
    } finally {
        setIsProcessing(false);
    }
  };

  const generateTestimonySummary = async (data: any, teamName?: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const decisions = data.people_profiles?.map((p: any) => {
          const name = p.name ? `${p.name} (${p.profile_type})` : p.profile_type;
          const decs = p.decisions?.join(', ');
          return decs ? `${name} decidiu: ${decs}` : null;
      }).filter(Boolean).join('; ');

      const prompt = `
        You are an expert writer for a Christian outreach ministry.
        Create a compelling, inspiring, and coherent summary of the following evangelism testimony in Portuguese.
        
        Input Data:
        - Date: ${data.date}
        - Team: ${teamName || 'Evangelism Team'}
        - Title: ${data.testimony_title}
        - Context: ${data.initial_context}
        - Approach Description: ${data.during_approach}
        - Supernatural Events: ${data.events_during?.join(', ')}
        - Personal Witness Account: ${data.testimony_witnessed}
        - Spiritual Outcomes: ${decisions}

        Guidelines:
        - Write in Portuguese (PT-BR).
        - Use an encouraging and faithful tone.
        - Structure the narrative logically: Context -> Encounter -> Impact -> Result.
        - Highlight specific miracles or decisions.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', // Using Flash for complex creative writing
        contents: [{ parts: [{ text: prompt }] }]
      });
      return response.text || "Não foi possível gerar o resumo.";
    } catch (error) {
      console.error("Summary generation failed:", error);
      return "Erro ao gerar resumo com IA.";
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePrayerAgenda = async (topic: string): Promise<any> => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Create a weekly prayer agenda for a church outreach ministry based on the specific topic: "${topic}".
        
        Return the result strictly as a JSON object with the following structure:
        {
          "title": "Inspiring Title related to ${topic}",
          "vision": "A short inspiring vision statement",
          "objective": "A specific spiritual objective",
          "days": [
            { "id": "mon", "label": "SEGUNDA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "tue", "label": "TERÇA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "wed", "label": "QUARTA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "thu", "label": "QUINTA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "fri", "label": "SEXTA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "weekend", "label": "FIM-DE-SEMANA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" }
          ]
        }
        Language: Portuguese.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', // Using Flash for structured creative generation
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      if (response.text) {
          return JSON.parse(response.text);
      }
      return null;
    } catch (error) {
      console.error("Agenda generation failed:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const translateText = async (text: string, targetLangCode: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Map app codes to prompt codes
      const langMap: Record<string, string> = {
        'pt-BR': 'PT-BR',
        'pt-PT': 'PT-PT',
        'en': 'EN',
        'de': 'DE'
      };
      const targetLanguage = langMap[targetLangCode] || 'PT-BR';

      const prompt = `
Você é um tradutor especializado e parte integrante de um aplicativo multilíngue chamado "OUTreach". Sua única função é traduzir o texto de entrada para o idioma de destino solicitado. Mantenha o tom profissional e direto. Se o texto for uma lista ou tiver formatação, preserve a estrutura original (parágrafos, bullet points, quebras de linha, etc.).

**Linguagem de Saída Requerida:** ${targetLanguage}

**Texto de Entrada Original:**
"""
${text}
"""
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }]
      });

      return response.text || text;
    } catch (error) {
      console.error("Translation failed:", error);
      return text;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, transcribeAudio, improveText, generateTestimonySummary, generatePrayerAgenda, translateText };
};
