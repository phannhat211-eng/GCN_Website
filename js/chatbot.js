/* ========================================= */
/* ===    "DÂY THẦN KINH" CHATBOT (JS)   === */
/* ===    (Bản Chuẩn - Dùng class)     === */
/* ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const chatWindow = document.getElementById('gcn-chat-window');
    const chatBubble = document.getElementById('chat-bubble');
    const closeBtn = document.getElementById('chat-close-btn');

    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    let chatHistory = [];

    // Lỗi thầm lặng (nếu ID sai)
    if (!chatBubble || !chatWindow || !closeBtn) {
        console.error("Lỗi: Không tìm thấy 1 trong các ID: chat-bubble, gcn-chat-window, chat-close-btn");
        return;
    }

    // --- 2. Xử lý bật/tắt (Dùng class "open") ---
    chatBubble.addEventListener('click', () => {
        chatWindow.classList.add('open'); 
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open'); 
    });

    // --- 3. Xử lý gửi tin nhắn ---
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return; 
        addMessageToUI('user', messageText);
        chatInput.value = '';

        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: messageText,
                    history: chatHistory 
                }),
            });

            if (!response.ok) throw new Error('Bot không trả lời');
            const data = await response.json();
            const aiReply = data.reply;
            addMessageToUI('bot', aiReply);

            chatHistory.push({ role: "user", parts: [{ text: messageText }] });
            chatHistory.push({ role: "model", parts: [{ text: aiReply }] });

        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            addMessageToUI('bot', 'Ui, bot bị lag mất rồi... 😥');
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