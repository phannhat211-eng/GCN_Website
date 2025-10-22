/* ========================================= */
/* ===    CHATBOT JS (Bản Test Ép Buộc)   === */
/* ===    (Đây là bản chạy ổn định)     === */
/* ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const chatWindow = document.getElementById('gcn-chat-window');
    const chatBubble = document.getElementById('chat-bubble');
    const closeBtn = document.getElementById('chat-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatBubble || !chatWindow || !closeBtn) {
        console.error("Lỗi JS: Không tìm thấy ID của chat-bubble, gcn-chat-window, hoặc chat-close-btn");
        return; 
    }

    // --- 2. Xử lý bật/tắt (Dùng "Ép Buộc") ---
    chatBubble.addEventListener('click', () => {
        chatWindow.style.display = 'flex';

        // Fix vị trí "bay" lên (thay thế class .open)
        chatWindow.style.opacity = '1';
        chatWindow.style.transform = 'translateY(-75px)';
        chatWindow.style.visibility = 'visible';
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';

        // Trả về vị trí cũ
        chatWindow.style.opacity = '0';
        chatWindow.style.transform = 'translateY(20px)';
        chatWindow.style.visibility = 'hidden';
    });

    // --- 3. Xử lý gửi tin nhắn (Giữ nguyên) ---
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    let chatHistory = [];
    async function sendMessage() {
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

    function addMessageToUI(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});