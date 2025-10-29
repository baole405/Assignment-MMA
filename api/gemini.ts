// src/api/gemini.ts

import { GoogleGenAI } from '@google/genai';
import Constants from 'expo-constants';

// LƯU Ý QUAN TRỌNG:
// Không commit API keys vào repository. Thay vào đó hãy cấu hình biến môi trường.
// Hỗ trợ đọc key từ 3 nguồn (theo thứ tự):
// 1) process.env.GEMINI_API_KEY (thích hợp cho môi trường node / CI)
// 2) expo config extra (Constants.expoConfig.extra.GEMINI_API_KEY)
// 3) manifest.extra (Constants.manifest.extra.GEMINI_API_KEY) - fallback
const GEMINI_API_KEY =
    (process.env && process.env.GEMINI_API_KEY) ||
    (Constants?.expoConfig?.extra?.GEMINI_API_KEY) ||
    (Constants?.manifest?.extra?.GEMINI_API_KEY) ||
    "";

if (!GEMINI_API_KEY) {
    throw new Error(
        "GEMINI_API_KEY chưa được cấu hình. Vui lòng tạo file .env (local) hoặc thêm vào app.config.js extra.GEMINI_API_KEY."
    );
}

// Khởi tạo Gemini Client (dùng key từ biến môi trường/config)
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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