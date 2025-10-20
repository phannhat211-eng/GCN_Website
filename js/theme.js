// Chạy ngay khi file được tải, không cần chờ "DOMContentLoaded"
(function() {
    // 1. Lấy các phần tử cần thiết
    const themeToggleButton = document.getElementById('theme-toggle-button');
    // 'localStorage' là một "hộp lưu trữ" nhỏ của trình duyệt
    const currentTheme = localStorage.getItem('theme');

    // 2. Kiểm tra xem người dùng đã từng chọn "dark" chưa
    if (currentTheme === 'dark') {
        // Nếu có, bật chế độ tối ngay lập...
        document.body.classList.add('dark-mode');
        // ...và đổi icon nút thành ☀️
        if (themeToggleButton) {
            themeToggleButton.textContent = '☀️';
        }
    }

    // 3. Lắng nghe sự kiện nhấp chuột vào nút 🌙/☀️
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // Lật (toggle) class 'dark-mode' trên thẻ <body>
            document.body.classList.toggle('dark-mode');

            let theme = 'light'; // Mặc định là sáng

            // Kiểm tra xem sau khi lật, body có class 'dark-mode' không
            if (document.body.classList.contains('dark-mode')) {
                // Nếu CÓ, có nghĩa là đang ở chế độ tối
                theme = 'dark';
                themeToggleButton.textContent = '☀️'; // Đổi icon
            } else {
                // Nếu KHÔNG, có nghĩa là đang ở chế độ sáng
                themeToggleButton.textContent = '🌙'; // Đổi icon
            }

            // 4. Lưu lựa chọn vào "hộp lưu trữ"
            localStorage.setItem('theme', theme);
        });
    }

})();