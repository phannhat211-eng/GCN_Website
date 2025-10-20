// Chờ cho toàn bộ trang web được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // Lấy các ô cờ, bảng cờ, nút chơi lại...
    const cells = document.querySelectorAll('[data-cell]');
    const board = document.querySelector('.game-board');
    const statusText = document.getElementById('game-status');
    const restartButton = document.getElementById('restartButton');

    const X_CLASS = 'x';
    const O_CLASS = 'o';
    let oTurn; // Biến theo dõi lượt đi, false = X, true = O

    // Các tổ hợp chiến thắng
    const WINNING_COMBINATIONS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Hàng ngang
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Hàng dọc
        [0, 4, 8], [2, 4, 6]  // Hàng chéo
    ];

    // Bắt đầu game
    startGame();

    // Thêm sự kiện khi nhấn nút "Chơi lại"
    restartButton.addEventListener('click', startGame);

    function startGame() {
        oTurn = false; // X đi trước
        // Xóa hết cờ X, O cũ trên bảng
        cells.forEach(cell => {
            cell.classList.remove(X_CLASS);
            cell.classList.remove(O_CLASS);
            cell.textContent = ''; // Xóa chữ X, O
            cell.removeEventListener('click', handleClick); // Xóa sự kiện cũ
            cell.addEventListener('click', handleClick, { once: true }); 
            // { once: true } -> mỗi ô chỉ được nhấp 1 lần
        });
        statusText.textContent = "Lượt của X";
    }

    // Khi người dùng nhấp vào 1 ô
    function handleClick(e) {
        const cell = e.target;
        const currentClass = oTurn ? O_CLASS : X_CLASS;

        // 1. Đặt cờ (X hoặc O)
        placeMark(cell, currentClass);

        // 2. Kiểm tra thắng
        if (checkWin(currentClass)) {
            endGame(false); // false = không hòa
        // 3. Kiểm tra hòa
        } else if (isDraw()) {
            endGame(true); // true = hòa
        // 4. Đổi lượt
        } else {
            swapTurns();
            statusText.textContent = `Lượt của ${oTurn ? 'O' : 'X'}`;
        }
    }

    // Hàm kết thúc game
    function endGame(draw) {
        if (draw) {
            statusText.textContent = "Hòa!";
        } else {
            statusText.textContent = `${oTurn ? "O" : "X"} Thắng!`;
        }
        // Xóa sự kiện click để không chơi tiếp được
        cells.forEach(cell => {
            cell.removeEventListener('click', handleClick);
        });
    }

    // Hàm kiểm tra hòa (khi tất cả các ô đã được lấp đầy)
    function isDraw() {
        return [...cells].every(cell => {
            return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
        });
    }

    // Hàm đặt cờ (X hoặc O) vào ô
    function placeMark(cell, currentClass) {
        cell.classList.add(currentClass);
        cell.textContent = currentClass.toUpperCase(); // Viết hoa X hoặc O
    }

    // Hàm đổi lượt
    function swapTurns() {
        oTurn = !oTurn;
    }

    // Hàm kiểm tra thắng
    function checkWin(currentClass) {
        // Kiểm tra xem có tổ hợp nào (trong WINNING_COMBINATIONS)
        // mà tất cả 3 ô đều chứa currentClass (X hoặc O) không
        return WINNING_COMBINATIONS.some(combination => {
            return combination.every(index => {
                return cells[index].classList.contains(currentClass);
            });
        });
    }
});