
import { GoogleGenAI, Type } from "@google/genai";
import { STORY_CONTENT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getStoryAnalysis = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Hãy phân tích tác phẩm "Gió lạnh đầu mùa" của Thạch Lam dựa trên nội dung sau:\n\n${STORY_CONTENT}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn cốt truyện" },
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "description"]
            }
          },
          themes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          literaryValue: { type: Type.STRING, description: "Giá trị nghệ thuật và nhân đạo" }
        },
        required: ["summary", "characters", "themes", "literaryValue"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const chatWithAI = async (history: { role: 'user' | 'model', content: string }[], userMessage: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Bạn là một chuyên gia văn học Việt Nam. Hãy giúp người dùng hiểu sâu hơn về tác phẩm "Gió lạnh đầu mùa" của Thạch Lam. Hãy trả lời một cách ấm áp, sâu sắc và tinh tế giống như phong cách của Thạch Lam.`,
    },
  });

  // Since chat.sendMessage only takes 'message' and not the full history in the simple way, 
  // we'll simulate the conversation by prepending context.
  const context = `Nội dung tác phẩm: ${STORY_CONTENT}\n\nLịch sử trò chuyện:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\nUser: ${userMessage}`;
  
  const response = await chat.sendMessage({ message: context });
  return response.text;
};
