document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    // Kiểm tra xem canvas có tồn tại không
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('tetris-score');
    const restartButton = document.getElementById('tetrisRestartButton');

    // --- LẤY CÁC NÚT ĐIỀU KHIỂN MOBILE (ĐÃ BỔ SUNG) ---
    const btnTetrisUp = document.getElementById('tetris-rotate');
    const btnTetrisDown = document.getElementById('tetris-down');
    const btnTetrisLeft = document.getElementById('tetris-left');
    const btnTetrisRight = document.getElementById('tetris-right');
    // --- KẾT THÚC LẤY NÚT ---

    // --- ĐÃ SỬA LẠI CÁCH TÍNH KÍCH THƯỚC ---
    const COLS = 10;
    const ROWS = 20;
    // Cố định BLOCK_SIZE và tính lại kích thước canvas
    const BLOCK_SIZE = 20; // Đặt kích thước khối cố định (ví dụ: 20px)
    canvas.width = COLS * BLOCK_SIZE; // 10 * 20 = 200
    canvas.height = ROWS * BLOCK_SIZE; // 20 * 20 = 400
    // --- KẾT THÚC SỬA KÍCH THƯỚC ---

    let board = createBoard();
    let score = 0;
    let piece; // Khối gạch hiện tại
    let gameOverState = false;

    const COLORS = [ null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF' ]; // T, O, L, J, I, S, Z
    const SHAPES = [ [], [[1, 1, 1], [0, 1, 0]], [[2, 2], [2, 2]], [[3, 0, 0], [3, 3, 3]], [[0, 0, 4], [4, 4, 4]], [[5, 5, 5, 5]], [[0, 6, 6], [6, 6, 0]], [[7, 7, 0], [0, 7, 7]] ];

    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    // --- HÀM Piece ĐÃ SỬA LẠI VỊ TRÍ X KHỞI TẠO ---
    function Piece(shape, ctx) {
        this.shape = shape;
        this.color = COLORS[shape.flat().find(val => val !== 0)];
        this.ctx = ctx;
        // Sửa lại vị trí x khởi tạo để căn giữa chuẩn hơn
        this.x = Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2);
        this.y = 0; // Bắt đầu từ hàng 0
    }
    // --- KẾT THÚC SỬA Piece ---

    Piece.prototype.draw = function() {
        this.ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    // Chỉ vẽ nếu khối nằm trong khung hình (y >= 0)
                    if (this.y + y >= 0) {
                        this.ctx.fillRect((this.x + x) * BLOCK_SIZE, (this.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                        this.ctx.strokeStyle = '#00000030'; // Viền đen mờ nhẹ
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect((this.x + x) * BLOCK_SIZE + 1, (this.y + y) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                    }
                }
            });
        });
    };

    Piece.prototype.move = function(p) {
        // Không cần kiểm tra isValidMove ở đây nữa vì đã kiểm tra trước khi gọi
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
    };

    Piece.prototype.isValidMove = function(nextX, nextY, nextShape) {
        for (let y = 0; y < nextShape.length; y++) {
            for (let x = 0; x < nextShape[y].length; x++) {
                if (nextShape[y][x] > 0) {
                    let boardX = nextX + x;
                    let boardY = nextY + y;
                    // Kiểm tra va chạm biên và khối đã có (bao gồm cả trường hợp boardY < 0)
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS || (boardY >= 0 && board[boardY] && board[boardY][boardX] !== 0)) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    function drawBoard() {
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    ctx.fillStyle = COLORS[value];
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#00000030';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                }
            });
        });
    }

    function clearBoard() {
        // Màu nền canvas theo theme
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#2c3e50' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function freezePiece() {
        if (!piece) return; // Kiểm tra piece tồn tại
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                // Chỉ đóng băng các khối nằm trong khung hình (y >= 0)
                if (value > 0 && piece.y + y >= 0) {
                    // Đảm bảo không ghi đè ra ngoài mảng board
                    if (board[piece.y + y] !== undefined && board[piece.y + y][piece.x + x] !== undefined) {
                         board[piece.y + y][piece.x + x] = value;
                    }
                }
            });
        });
        clearLines();
        // Kiểm tra game over ngay sau khi đóng băng và ăn điểm
        // Nếu không thể sinh khối mới tức là đã thua
        piece = spawnPiece();
        if (!piece) {
            gameOver();
        }
    }


    function clearLines() {
        let linesCleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every(cell => cell > 0)) {
                linesCleared++;
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(0));
                r++; // Kiểm tra lại hàng vừa dịch chuyển xuống
            }
        }
        if (linesCleared > 0) {
            score += linesCleared * 100 * linesCleared; // Tính điểm
            scoreDisplay.textContent = `Điểm: ${score}`;
            // Tăng tốc độ game khi ăn điểm
            dropInterval = Math.max(200, dropInterval * 0.95); // Nhanh hơn 5%, tối thiểu 200ms
        }
    }

    function rotate(shape) {
        // Thuật toán xoay ma trận đơn giản
        const N = shape.length;
        const M = shape[0].length;
        const newShape = Array.from({ length: M }, () => Array(N).fill(0));
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < M; c++) {
                newShape[c][N - 1 - r] = shape[r][c];
            }
        }
        return newShape;
    }

    function handleKeyPress(key) {
        if (gameOverState || !piece) return;

        let p = { x: piece.x, y: piece.y, shape: piece.shape }; // Clone trạng thái hiện tại

        if (key === 'ArrowLeft') {
            p.x -= 1;
        } else if (key === 'ArrowRight') {
            p.x += 1;
        } else if (key === 'ArrowDown') {
            p.y += 1;
        } else if (key === 'ArrowUp') { // Rotate
            p.shape = rotate(p.shape);
        }

        if (piece.isValidMove(p.x, p.y, p.shape)) {
            piece.move(p); // Cập nhật piece nếu hợp lệ
            if (key === 'ArrowDown') {
                 dropCounter = 0; // Reset bộ đếm rơi khi nhấn xuống
                 // Kiểm tra va chạm ngay sau khi nhấn xuống (không cần thiết vì vòng lặp sẽ xử lý)
            }
        } else {
             // Nếu nhấn xuống mà không di chuyển được -> đóng băng ngay lập tức
             if (key === 'ArrowDown') {
                  freezePiece();
             }
             // Nếu xoay hoặc di chuyển ngang bị lỗi -> không làm gì cả, giữ nguyên piece cũ
        }
    }


    function spawnPiece() {
        const randomIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
        const newPiece = new Piece(SHAPES[randomIndex], ctx);
        // Kiểm tra xem vị trí sinh có hợp lệ không
        if (!newPiece.isValidMove(newPiece.x, newPiece.y, newPiece.shape)) {
             // Nếu không hợp lệ ngay từ đầu -> Game Over
             return null; // Trả về null để báo hiệu thua
        }
        return newPiece;
    }

     function gameOver() {
         gameOverState = true;
         if(animationFrameId) cancelAnimationFrame(animationFrameId); // Dừng vòng lặp game
         ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
         ctx.fillRect(canvas.width / 4, canvas.height / 2 - 30, canvas.width / 2, 60); // Vẽ hộp nhỏ hơn
         ctx.font = '20px Nunito'; // Cỡ chữ nhỏ hơn
         ctx.fillStyle = 'white';
         ctx.textAlign = 'center';
         ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
         restartButton.style.display = 'block'; // Hiện nút Chơi lại
     }

    let lastTime = 0;
    let dropCounter = 0;
    let dropInterval = 1000; // mili-giây (1 giây)
    let animationFrameId;

    function gameLoop(time = 0) {
         if (gameOverState) return;

         const deltaTime = time - lastTime;
         lastTime = time;
         dropCounter += deltaTime;

         if (dropCounter > dropInterval) {
             if (piece) { // Chỉ di chuyển nếu piece tồn tại
                 let p = { x: piece.x, y: piece.y + 1, shape: piece.shape }; // Thử rơi xuống 1 ô
                 if (piece.isValidMove(p.x, p.y, p.shape)) {
                     piece.move(p); // Rơi xuống nếu hợp lệ
                 } else {
                     freezePiece(); // Đóng băng nếu chạm đáy hoặc khối khác
                 }
             } else {
                  // Nếu piece không tồn tại (có thể do lỗi), thử sinh lại
                  piece = spawnPiece();
                  if (!piece) gameOver(); // Nếu vẫn không sinh được -> thua
             }
             dropCounter = 0; // Reset bộ đếm
         }

         clearBoard(); // Xóa màn hình
         drawBoard(); // Vẽ các khối đã đóng băng
         if (piece) piece.draw(); // Vẽ khối đang rơi

         animationFrameId = requestAnimationFrame(gameLoop); // Lặp lại
    }

     function startGame() {
         board = createBoard();
         score = 0;
         scoreDisplay.textContent = `Điểm: ${score}`;
         piece = spawnPiece(); // Sinh khối đầu tiên
         gameOverState = !piece; // Nếu không sinh được là thua
         restartButton.style.display = 'none';
         lastTime = performance.now(); // Lấy thời gian hiện tại chính xác hơn
         dropCounter = 0;
         dropInterval = 1000; // Reset tốc độ
         if (animationFrameId) cancelAnimationFrame(animationFrameId); // Dừng vòng lặp cũ
         if (!gameOverState) gameLoop(); // Bắt đầu vòng lặp mới nếu chưa thua
     }

     // --- EVENT LISTENERS (ĐÃ BỔ SUNG NÚT MOBILE) ---
     document.addEventListener('keydown', (e) => {
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
               e.preventDefault(); // Ngăn cuộn trang
               handleKeyPress(e.key); // Xử lý phím
         }
     });

    restartButton.addEventListener('click', startGame);

    // Thêm event listeners cho các nút điều khiển mobile (Tetris)
    if (btnTetrisUp) btnTetrisUp.addEventListener('click', () => handleKeyPress('ArrowUp'));
    if (btnTetrisDown) btnTetrisDown.addEventListener('click', () => handleKeyPress('ArrowDown'));
    if (btnTetrisLeft) btnTetrisLeft.addEventListener('click', () => handleKeyPress('ArrowLeft'));
    if (btnTetrisRight) btnTetrisRight.addEventListener('click', () => handleKeyPress('ArrowRight'));
    // --- KẾT THÚC BỔ SUNG NÚT MOBILE ---

     // Bắt đầu game lần đầu
     startGame();

}); // Kết thúc DOMContentLoaded