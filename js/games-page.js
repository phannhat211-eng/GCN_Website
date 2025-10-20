document.addEventListener('DOMContentLoaded', () => {
    const gameSelectButtons = document.querySelectorAll('.game-select-button');
    const caroWrapper = document.getElementById('caro-game-wrapper');
    const flappyWrapper = document.getElementById('flappy-game-wrapper');
    const gameSelectionDiv = document.querySelector('.game-selection');

    gameSelectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameToShow = button.dataset.game; // Lấy data-game (caro hoặc flappy)

            // Ẩn khu vực chọn game
            gameSelectionDiv.style.display = 'none';

            // Hiện game tương ứng
            if (gameToShow === 'caro') {
                caroWrapper.style.display = 'block';
                flappyWrapper.style.display = 'none'; // Ẩn game kia
            } else if (gameToShow === 'flappy') {
                flappyWrapper.style.display = 'block';
                caroWrapper.style.display = 'none'; // Ẩn game kia
                // Có thể cần gọi hàm khởi tạo lại Flappy Bird nếu nó bị lỗi sau khi ẩn/hiện
                // restartFlappyBirdGame(); // Giả sử có hàm này trong flappy-bird.js
            }
        });
    });

    // Tùy chọn: Thêm nút "Quay lại chọn game" vào mỗi game-wrapper
    // (Phần này bạn có thể tự thêm nếu muốn)
});