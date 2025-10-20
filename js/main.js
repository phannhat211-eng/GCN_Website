// Chờ cho toàn bộ trang web được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CÀI ĐẶT GAME ---
    const BOARD_SIZE = 15; // Bảng 15x15
    const WIN_CONDITION = 5; // Thắng 5 ô liên tiếp
    const X_CLASS = 'x';
    const O_CLASS = 'o';

    // Lấy các thành phần HTML
    const boardElement = document.getElementById('caro-board');
    const statusText = document.getElementById('game-status');
    const restartButton = document.getElementById('restartButton');

    let oTurn; // Biến theo dõi lượt đi (false = X, true = O)
    let gameActive; // Biến xem game còn chơi được không

    // Tạo một "bảng cờ ảo" (mảng 2 chiều) để lưu nước đi
    // Ví dụ: boardState[0][1] = 'x'
    let boardState = []; 

    // --- 2. HÀM BẮT ĐẦU GAME ---
    function startGame() {
        oTurn = false; // X đi trước
        gameActive = true;
        statusText.textContent = "Lượt của X";

        // Xóa sạch bảng cờ (cả ảo và thật)
        boardElement.innerHTML = ''; 
        boardState = [];

        // Vẽ bảng cờ
        for (let r = 0; r < BOARD_SIZE; r++) {
            const rowState = []; // Tạo hàng cho bảng cờ ảo
            for (let c = 0; c < BOARD_SIZE; c++) {
                rowState.push(null); // Ô ảo ban đầu trống

                // Vẽ ô cờ thật (cell)
                const cell = document.createElement('div');
                cell.classList.add('caro-cell');
                // Lưu tọa độ (hàng, cột) vào chính ô đó
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Thêm sự kiện click
                cell.addEventListener('click', handleClick, { once: true });
                boardElement.appendChild(cell);
            }
            boardState.push(rowState); // Thêm hàng vào bảng cờ ảo
        }
    }

    // --- 3. HÀM XỬ LÝ KHI CLICK ---
    function handleClick(e) {
        if (!gameActive) return; // Nếu game kết thúc thì không làm gì

        const cell = e.target;
        const currentClass = oTurn ? O_CLASS : X_CLASS;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // 1. Cập nhật bảng cờ ảo và thật
        placeMark(cell, row, col, currentClass);

        // 2. Kiểm tra thắng
        if (checkWin(row, col, currentClass)) {
            endGame(false, currentClass); // false = không hòa
        // 3. Kiểm tra hòa (nếu tất cả ô đã đầy)
        } else if (isDraw()) {
            endGame(true);
        // 4. Đổi lượt
        } else {
            swapTurns();
            statusText.textContent = `Lượt của ${oTurn ? 'O' : 'X'}`;
        }
    }

    // --- 4. HÀM ĐẶT CỜ ---
    function placeMark(cell, row, col, currentClass) {
        boardState[row][col] = currentClass; // Cập nhật bảng ảo
        cell.classList.add(currentClass); // Cập nhật bảng thật (hiện X, O)
        cell.textContent = currentClass.toUpperCase();
    }

    // --- 5. HÀM ĐỔI LƯỢT ---
    function swapTurns() {
        oTurn = !oTurn;
    }

    // --- 6. HÀM KẾT THÚC GAME ---
    function endGame(draw, winnerClass) {
        gameActive = false; // Dừng game
        if (draw) {
            statusText.textContent = "Hòa!";
        } else {
            statusText.textContent = `${winnerClass.toUpperCase()} Thắng!`;
        }
        // Xóa tất cả sự kiện click trên bảng
        boardElement.querySelectorAll('.caro-cell').forEach(cell => {
            cell.removeEventListener('click', handleClick);
        });
    }

    // --- 7. HÀM KIỂM TRA HÒA ---
    function isDraw() {
        // Kiểm tra xem mọi ô trong mọi hàng có bị 'null' không
        return boardState.every(row => {
            return row.every(cellState => cellState !== null);
        });
    }

    // --- 8. "BỘ NÃO" KIỂM TRA THẮNG (Phức tạp nhất) ---
    function checkWin(row, col, currentClass) {
        // Hàm này sẽ kiểm tra 4 chiều từ ô (row, col) vừa đánh
        // 1. Chiều Ngang (-)
        // 2. Chiều Dọc (|)
        // 3. Chiều Chéo \
        // 4. Chiều Chéo /

        // Hàm con: đếm số ô liên tiếp
        const countConsecutive = (rStep, cStep) => {
            let count = 0;
            // Đếm tiến
            for (let i = 1; i < WIN_CONDITION; i++) {
                const r = row + i * rStep;
                const c = col + i * cStep;
                // Nếu ra ngoài bảng hoặc ô không đúng, dừng đếm
                if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || boardState[r][c] !== currentClass) {
                    break;
                }
                count++;
            }
            // Đếm lùi
            for (let i = 1; i < WIN_CONDITION; i++) {
                const r = row - i * rStep;
                const c = col - i * cStep;
                if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || boardState[r][c] !== currentClass) {
                    break;
                }
                count++;
            }
            return count;
        };

        // +1 (vì bao gồm cả ô vừa đánh)
        // Nếu đếm được 4 ô (hoặc nhiều hơn) + ô vừa đánh = 5 (thắng)

        // 1. Kiểm tra Ngang (-, rStep=0, cStep=1)
        if (countConsecutive(0, 1) + 1 >= WIN_CONDITION) return true;
        // 2. Kiểm tra Dọc (|, rStep=1, cStep=0)
        if (countConsecutive(1, 0) + 1 >= WIN_CONDITION) return true;
        // 3. Kiểm tra Chéo \ (rStep=1, cStep=1)
        if (countConsecutive(1, 1) + 1 >= WIN_CONDITION) return true;
        // 4. Kiểm tra Chéo / (rStep=1, cStep=-1)
        if (countConsecutive(1, -1) + 1 >= WIN_CONDITION) return true;

        // Không thắng
        return false;
    }

    // --- 9. BẮT ĐẦU GAME KHI TẢI TRANG ---
    startGame();

    // Thêm sự kiện cho nút "Chơi lại"
    restartButton.addEventListener('click', startGame);

});