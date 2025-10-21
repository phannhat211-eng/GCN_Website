/* ========================================= */
/* ===    "BỘ NÃO" CHUYỂN THEME (JS)     === */
/* ========================================= */

// Hàm này chạy ngay khi file JS được tải
(function() {
    // 1. Lấy các phần tử cần thiết
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;

    // 2. Icon cho 2 chế độ
    const moonIcon = '🌙';
    const sunIcon = '☀️';

    // 3. Kiểm tra xem người dùng đã lưu theme nào chưa (trong localStorage)
    let currentTheme = localStorage.getItem('theme');

    // 4. Hàm áp dụng theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (themeToggleButton) {
                themeToggleButton.innerHTML = sunIcon; // Đổi icon thành mặt trời
            }
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            if (themeToggleButton) {
                themeToggleButton.innerHTML = moonIcon; // Đổi icon thành mặt trăng
            }
            localStorage.setItem('theme', 'light');
        }
    }

    // 5. Áp dụng theme đã lưu khi tải trang
    // Nếu chưa lưu gì, mặc định là 'light'
    if (!currentTheme) {
        currentTheme = 'light';
    }
    applyTheme(currentTheme);


    // 6. Xử lý khi người dùng NHẤP VÀO NÚT
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // Lấy theme hiện tại TRƯỚC KHI thay đổi
            let newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
            
            // Áp dụng theme mới
            applyTheme(newTheme);
        });
    }

})(); // Kết thúc hàm