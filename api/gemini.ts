// src/api/gemini.ts

import { GoogleGenAI } from '@google/genai';

// LƯU Ý QUAN TRỌNG:
// Trong dự án thực tế, KHÔNG hardcode API key như thế này.
// Thay vào đó, hãy sử dụng biến môi trường (ví dụ: process.env.GEMINI_API_KEY)
const GEMINI_API_KEY = "AIzaSyDqWdNQPQcxTFKMk2HuhezHxodoDgtZnNw" ; 

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình. Vui lòng thiết lập biến môi trường.");
}

// Khởi tạo Gemini Client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY});
const MODEL_NAME = "gemini-2.5-flash"; // Chọn model phù hợp

/**
 * Gửi prompt đến Gemini và nhận phản hồi văn bản.
 * @param prompt Câu lệnh/câu hỏi người dùng.
 * @returns Promise<string> Phản hồi dạng văn bản từ model.
 */
export async function generateTextFromGemini(prompt: string): Promise<string> {
    try {
        const result = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                // Định dạng input theo chuẩn user role
                { role: "user", parts: [{ text: prompt }] }
            ]
        });

        // Trả về nội dung văn bản thuần túy
        return result.text as string;

    } catch (error) {
        console.error("Lỗi khi gọi API Gemini:", error);
        // Ném lỗi để component có thể bắt và hiển thị
        throw new Error("Không thể kết nối với Gemini API. Vui lòng kiểm tra console để biết chi tiết.");
    }
}