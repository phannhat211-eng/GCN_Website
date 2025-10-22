// File: netlify/functions/chat.js (Bản Dứt Điểm - Không có systemInstruction)

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// === "TÍNH CÁCH" CỦA BOT (Dạy qua History) ===
const botPersonality = [
    {
        role: "user",
        parts: [{ text: "Hãy giới thiệu về bản thân bạn." }],
    },
    {
        role: "model",
        parts: [{ text: `Tôi là GCN-Bot, trợ lý AI của 'Góc Của Nhật'. 
            Tôi ở đây để trò chuyện với bạn một cách thân thiện, 
            hài hước và vui vẻ!` }],
    },
];

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message, history } = JSON.parse(event.body);

        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

        // === ĐÃ SỬA LỖI: Xoá systemInstruction ===
        const chat = model.startChat({
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
            },
            // Kết hợp "tính cách" và "lịch sử chat"
            history: [ ...botPersonality, ...(history || []) ], 
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text }),
        };

    } catch (error) {
        console.error(error); // In lỗi ra log Netlify
        return { statusCode: 500, body: "Ui, bot bị lag rồi sếp ơi!" };
    }
};
