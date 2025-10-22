/* ========================================= */
/* ===    CHATBOT JS (Bản Test Ép Buộc)   === */
/* ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Lấy các phần tử HTML ---
    const chatWindow = document.getElementById('gcn-chat-window');
    const chatBubble = document.getElementById('chat-bubble');
    const closeBtn = document.getElementById('chat-close-btn');

    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // KIỂM TRA LỖI THẦM LẶNG
    if (!chatBubble) {
        console.error("LỖI: Không tìm thấy bong bóng chat! ID 'chat-bubble' bị sai?");
        return; 
    }
    if (!chatWindow) {
        console.error("LỖI: Không tìm thấy cửa sổ chat! ID 'gcn-chat-window' bị sai?");
        return;
    }

    // --- 2. Xử lý bật/tắt cửa sổ chat (ĐÃ SỬA) ---

    chatBubble.addEventListener('click', () => {
        console.log("Đã nhấp vào bong bóng!"); // Kiểm tra

        // THAY VÌ DÙNG CLASS, HÃY "ÉP" NÓ HIỆN RA
        chatWindow.style.display = 'flex'; // (flex là kiểu hiển thị của cửa sổ chat)
        chatWindow.style.opacity = '1';
        chatWindow.style.transform = 'translateY(-75px)';
        chatWindow.style.visibility = 'visible';
    });

    closeBtn.addEventListener('click', () => {
        console.log("Đã nhấp nút Đóng!"); // Kiểm tra

        // "ÉP" NÓ ẨN ĐI
        chatWindow.style.display = 'none'; // Ẩn đi
        chatWindow.style.opacity = '0';
        chatWindow.style.transform = 'translateY(20px)';
        chatWindow.style.visibility = 'hidden';
    });

    // --- 3. Xử lý gửi tin nhắn (Giữ nguyên) ---
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        // (Code gửi tin nhắn giữ nguyên như cũ...)
        const messageText = chatInput.value.trim();
        if (messageText === '') return;
        addMessageToUI('user', messageText);
        chatInput.value = '';
        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, history: chatHistory }),
            });
            if (!response.ok) throw new Error('Bot không trả lời');
            const data = await response.json();
            const aiReply = data.reply;
            addMessageToUI('bot', aiReply);
            chatHistory.push({ role: "user", parts: [{ text: messageText }] });
            chatHistory.push({ role: "model", parts: [{ text: aiReply }] });
        } catch (error) {
            addMessageToUI('bot', 'Ui, bot bị lag rồi... 😥');
        }
    }

    let chatHistory = [];
    function addMessageToUI(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});