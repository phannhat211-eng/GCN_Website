/* ========================================= */
/* ===    "DÂY THẦN KINH" CHATBOT (JS)   === */
/* ========================================= */

// Chạy code khi toàn bộ trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Lấy các phần tử HTML ---
    const chatWindow = document.getElementById('gcn-chat-window');
    const chatBubble = document.getElementById('chat-bubble');
    const closeBtn = document.getElementById('chat-close-btn');

    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Biến lưu lịch sử (để AI "nhớ")
    let chatHistory = [];

    // --- 2. Xử lý bật/tắt cửa sổ chat ---

    // Mở chat khi nhấn bong bóng
    chatBubble.addEventListener('click', () => {
        chatWindow.classList.add('open'); // Thêm class .open (CSS sẽ làm hiệu ứng)
    });

    // Đóng chat khi nhấn nút X
    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open'); // Xoá class .open
    });

    // --- 3. Xử lý gửi tin nhắn ---
    sendBtn.addEventListener('click', sendMessage);

    // Gửi khi nhấn Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return; // Không gửi tin nhắn rỗng

        // 1. Hiển thị tin nhắn của User lên UI
        addMessageToUI('user', messageText);

        // Xoá ô nhập liệu
        chatInput.value = '';

        try {
            // 2. Gọi "Người Trung Gian" (chat.js trên Netlify)
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: messageText,
                    history: chatHistory // Gửi kèm lịch sử
                }),
            });

            if (!response.ok) {
                throw new Error('Bot không trả lời, lỗi server');
            }

            const data = await response.json();
            const aiReply = data.reply;

            // 3. Hiển thị tin nhắn của Bot lên UI
            addMessageToUI('bot', aiReply);

            // 4. Cập nhật lịch sử (để AI nhớ)
            chatHistory.push({ role: "user", parts: [{ text: messageText }] });
            chatHistory.push({ role: "model", parts: [{ text: aiReply }] });

        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            addMessageToUI('bot', 'Ui, bot bị lag mất rồi... 😥 Thử lại sau nha.');
        }
    }

    // --- 4. Hàm trợ giúp: Thêm tin nhắn vào UI ---
    function addMessageToUI(sender, text) {
        const messageElement = document.createElement('div');
        // Thêm class .message và .user-message (hoặc .bot-message)
        messageElement.classList.add('message', `${sender}-message`);

        // Chuyển đổi text để hiển thị xuống hàng (nếu AI trả lời)
        messageElement.innerHTML = text.replace(/\n/g, '<br>');

        chatMessages.appendChild(messageElement);

        // Tự động cuộn xuống tin nhắn mới nhất
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});