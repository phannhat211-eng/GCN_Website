/* ========================================= */
/* === BỘ NÃO CỦA DASHBOARD (JavaScript) === */
/* ========================================= */

// Hàm này chạy ngay khi trang được tải xong HTML
document.addEventListener('DOMContentLoaded', () => {
    // Tìm các phần tử HTML theo ID
    const clockElement = document.getElementById('realtime-clock');
    const greetingElement = document.getElementById('dynamic-greeting');
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author');

    // --- 1. HÀM CẬP NHẬT ĐỒNG HỒ ---
    function updateClock() {
        if (!clockElement) return; // Nếu không tìm thấy, bỏ qua

        const now = new Date();
        // Thêm "0" vào trước số nếu nó < 10 (vd: 7 -> 07)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Hiển thị ra HTML
        clockElement.innerHTML = `${hours}:${minutes}:<span class="clock-seconds">${seconds}</span>`;
    }

    // --- 2. HÀM CẬP NHẬT LỜI CHÀO ---
    function updateGreeting() {
        if (!greetingElement) return; // Nếu không tìm thấy, bỏ qua

        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = 'Chào buổi sáng, Nhật!';
        } else if (hour < 18) {
            greeting = 'Buổi chiều vui vẻ, Nhật!';
        } else {
            greeting = 'Chào buổi tối, Nhật!';
        }
        
        greetingElement.textContent = greeting;
    }

    /* --- 3. HÀM LẤY QUOTE HÀNG NGÀY (CÓ CACHE) --- */
    async function getDailyQuote() {
        if (!quoteTextElement || !quoteAuthorElement) return; // Bỏ qua nếu không tìm thấy

        const today = new Date().toDateString(); // Lấy ngày hôm nay (vd: "Tue Oct 21 2025")
        const cachedQuote = JSON.parse(localStorage.getItem('dailyQuote'));

        // Nếu có quote trong cache VÀ nó là của ngày hôm nay
        if (cachedQuote && cachedQuote.date === today) {
            quoteTextElement.textContent = `"${cachedQuote.content}"`;
            quoteAuthorElement.textContent = `- ${cachedQuote.author}`;
        } else {
            // Nếu không có hoặc quote đã cũ -> gọi API mới
            try {
                // Dùng API miễn phí của Quotable
                const response = await fetch('https://api.quotable.io/random?tags=technology|famous-quotes|wisdom');
                if (!response.ok) throw new Error('API request failed');
                
                const data = await response.json();

                // Hiển thị quote mới
                quoteTextElement.textContent = `"${data.content}"`;
                quoteAuthorElement.textContent = `- ${data.author}`;

                // Lưu quote mới vào cache (localStorage)
                const newQuote = {
                    date: today,
                    content: data.content,
                    author: data.author
                };
                localStorage.setItem('dailyQuote', JSON.stringify(newQuote));

            } catch (error) {
                console.error('Lỗi khi tải quote:', error);
                // Dùng quote dự phòng nếu API lỗi
                quoteTextElement.textContent = '"Cách tốt nhất để dự đoán tương lai là tạo ra nó."';
                quoteAuthorElement.textContent = '- Peter Drucker';
            }
        }
    }

    // --- CHẠY CÁC HÀM ---
    updateClock(); // Chạy đồng hồ lần đầu
    setInterval(updateClock, 1000); // Cập nhật đồng hồ mỗi giây
    
    updateGreeting(); // Cập nhật lời chào
    getDailyQuote();  // Lấy câu quote của ngày
});