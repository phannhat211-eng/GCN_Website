document.addEventListener('DOMContentLoaded', () => {
    const gameSelectButtons = document.querySelectorAll('.game-select-button');
    const caroWrapper = document.getElementById('caro-game-wrapper');
    const snakeWrapper = document.getElementById('snake-game-wrapper'); // Thêm game rắn
    const gameSelectionDiv = document.querySelector('.game-selection');

    gameSelectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameToShow = button.dataset.game; 

            // Ẩn khu vực chọn game
            gameSelectionDiv.style.display = 'none';

            // Hiện game tương ứng
            if (gameToShow === 'caro') {
                caroWrapper.style.display = 'block';
                snakeWrapper.style.display = 'none'; 
            } else if (gameToShow === 'snake') { // Thêm điều kiện cho game rắn
                snakeWrapper.style.display = 'block';
                caroWrapper.style.display = 'none'; 
                // Có thể cần gọi hàm khởi tạo game rắn nếu nó không tự chạy
            }
        });
    });
});