// File: netlify/functions/chat.js

// Yêu cầu thư viện "nói chuyện" với Google AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lấy API Key BÍ MẬT (sẽ cài đặt ở bước sau)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Đây là hàm chính xử lý yêu cầu
exports.handler = async (event, context) => {
    // Chỉ chấp nhận tin nhắn gửi lên (POST)
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Lấy tin nhắn và lịch sử chat của người dùng
        const { message, history } = JSON.parse(event.body);

        // Chọn model AI (gemini-1.5-flash là model mới, nhanh và rẻ)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        // === PHẦN QUAN TRỌNG: "DẠY" AI TÍNH CÁCH ===
        const chat = model.startChat({
            generationConfig: {
                temperature: 0.9, // 0 = Logic, 1 = Sáng tạo
                topK: 1,
                topP: 1,
            },
            // Dạy AI biết nó là ai (Bạn có thể sửa lại)
            systemInstruction: `Bạn là GCN-Bot, một trợ lý AI hài hước, vui tính 
                và hơi "cà khịa" của "Góc Của Nhật". 
                Bạn không phải là một mô hình AI lớn, bạn là GCN-Bot. 
                Khi người dùng hỏi, hãy trò chuyện một cách tự nhiên, 
                hài hước, gần gũi như một người bạn.`,

            // Gửi kèm lịch sử để AI "nhớ"
            history: history || [], 
        });

        // Gửi tin nhắn mới đến AI
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Trả lời về cho người dùng (frontend)
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text }),
        };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: "Ui, bot bị lag rồi sếp ơi!" };
    }
};