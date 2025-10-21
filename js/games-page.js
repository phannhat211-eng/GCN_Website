document.addEventListener('DOMContentLoaded', () => {
    // Lấy các nút chọn game
    const gameSelectButtons = document.querySelectorAll('.game-select-button');
    // Lấy các khung chứa game
    const caroWrapper = document.getElementById('caro-game-wrapper');
    const snakeWrapper = document.getElementById('snake-game-wrapper');
    const tetrisWrapper = document.getElementById('tetris-game-wrapper'); // <-- LẤY KHUNG TETRIS
    // Lấy khu vực chọn game ban đầu
    const gameSelectionDiv = document.querySelector('.game-selection');

    gameSelectButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Lấy tên game từ nút được nhấp (data-game="...")
            const gameToShow = button.dataset.game;

            // 1. Ẩn khu vực chọn game đi
            gameSelectionDiv.style.display = 'none';

            // 2. Ẩn TẤT CẢ các khung game trước khi hiển thị game mới
            if (caroWrapper) caroWrapper.style.display = 'none';
            if (snakeWrapper) snakeWrapper.style.display = 'none';
            if (tetrisWrapper) tetrisWrapper.style.display = 'none'; // <-- ẨN TETRIS

            // 3. Hiển thị khung game tương ứng
            if (gameToShow === 'caro' && caroWrapper) {
                caroWrapper.style.display = 'block';
            } else if (gameToShow === 'snake' && snakeWrapper) {
                snakeWrapper.style.display = 'block';
                // Game rắn thường tự khởi tạo khi hiển thị, không cần gọi lại
            } else if (gameToShow === 'tetris' && tetrisWrapper) { // <-- THÊM ĐIỀU KIỆN CHO TETRIS
                tetrisWrapper.style.display = 'block';
                // Game Tetris cũng thường tự khởi tạo khi hiển thị
            }
        });
    });

    // Tùy chọn: Thêm chức năng quay lại màn hình chọn game
    // Bạn có thể thêm một nút "Quay lại" vào mỗi game-wrapper
    // và thêm event listener cho nút đó để ẩn game hiện tại
    // và hiện lại gameSelectionDiv.
});