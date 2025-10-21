document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    // Kiểm tra xem canvas có tồn tại không
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('tetris-score');
    const restartButton = document.getElementById('tetrisRestartButton');

    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = canvas.width / COLS; // 240 / 10 = 24

    let board = createBoard();
    let score = 0;
    let piece; // Khối gạch hiện tại
    let gameOverState = false;

    const COLORS = [
        null, // 0 - Empty
        '#FF0D72', // 1 - T
        '#0DC2FF', // 2 - O
        '#0DFF72', // 3 - L
        '#F538FF', // 4 - J
        '#FF8E0D', // 5 - I
        '#FFE138', // 6 - S
        '#3877FF'  // 7 - Z
    ];

    const SHAPES = [
        [], // 0
        [[1, 1, 1], [0, 1, 0]], // T
        [[2, 2], [2, 2]], // O
        [[3, 0, 0], [3, 3, 3]], // L
        [[0, 0, 4], [4, 4, 4]], // J
        [[5, 5, 5, 5]], // I
        [[0, 6, 6], [6, 6, 0]], // S
        [[7, 7, 0], [0, 7, 7]]  // Z
    ];

    function createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function Piece(shape, ctx) {
        this.shape = shape;
        this.color = COLORS[shape.flat().find(val => val !== 0)]; // Find the first non-zero number for color index
        this.ctx = ctx;
        this.x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
        this.y = 0;
    }

    Piece.prototype.draw = function() {
        this.ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillRect((this.x + x) * BLOCK_SIZE, (this.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    // Optional: Add a border
                     this.ctx.strokeStyle = '#00000030';
                     this.ctx.lineWidth = 1;
                     this.ctx.strokeRect((this.x + x) * BLOCK_SIZE + 1, (this.y + y) * BLOCK_SIZE + 1, BLOCK_SIZE-2, BLOCK_SIZE-2);
                }
            });
        });
    };

    Piece.prototype.move = function(p) {
         if (!this.isValidMove(p.x, p.y, p.shape)) return; // Check validity before changing
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
                    // Check boundaries and collision with existing blocks
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS || (board[boardY] && board[boardY][boardX] !== 0)) {
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
                    // Optional: Add a border
                     ctx.strokeStyle = '#00000030';
                     ctx.lineWidth = 1;
                     ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE-2, BLOCK_SIZE-2);
                }
            });
        });
    }

    function clearBoard() {
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#2c3e50' : '#ffffff'; // Nền canvas
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function freezePiece() {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    board[piece.y + y][piece.x + x] = value;
                }
            });
        });
        clearLines();
         // Check if game over (piece froze at the top)
         if (piece.y === 0) {
              gameOver();
         }
    }

    function clearLines() {
        let linesCleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every(cell => cell > 0)) {
                linesCleared++;
                // Remove the filled row
                board.splice(r, 1);
                // Add a new empty row at the top
                board.unshift(Array(COLS).fill(0));
                // Check the same row again after shifting
                r++;
            }
        }
        // Update score based on lines cleared
        if (linesCleared > 0) {
             // Basic scoring: 100 per line, bonus for multiple lines
             score += linesCleared * 100 * linesCleared;
             scoreDisplay.textContent = `Điểm: ${score}`;
        }
    }

    function rotate(shape) {
        // Simple rotation (transpose + reverse rows)
        const newShape = shape[0].map((_, index) => shape.map(row => row[index])).reverse();
        return newShape;
    }

     function handleKeyPress(key) {
         if (gameOverState) return;

         let p = { ...piece }; // Clone the current piece state

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
                piece.move(p);
                 if (key === 'ArrowDown') {
                     // Check collision again after moving down
                      if (!piece.isValidMove(piece.x, piece.y + 1, piece.shape)) {
                            freezePiece();
                            piece = spawnPiece(); // Spawn next immediately
                      }
                 }
          } else if (key === 'ArrowDown') {
                 // If moving down is invalid, freeze the piece
                 freezePiece();
                 piece = spawnPiece();
          } else if (key === 'ArrowUp') {
               // If rotation caused collision, don't update shape (p remains unchanged)
          }
     }

    function spawnPiece() {
        const randomIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1; // Avoid index 0 (empty)
        return new Piece(SHAPES[randomIndex], ctx);
    }

     function gameOver() {
         gameOverState = true;
         cancelAnimationFrame(animationFrameId); // Stop game loop
         ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
         ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
         ctx.font = '24px Nunito';
         ctx.fillStyle = 'white';
         ctx.textAlign = 'center';
         ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
         restartButton.style.display = 'block'; // Show restart button
     }

    let lastTime = 0;
    let dropCounter = 0;
    let dropInterval = 1000; // milliseconds (1 second)
    let animationFrameId;

    function gameLoop(time = 0) {
         if (gameOverState) return;

         const deltaTime = time - lastTime;
         lastTime = time;
         dropCounter += deltaTime;

         if (dropCounter > dropInterval) {
             let p = { ...piece };
             p.y += 1;
             if (piece.isValidMove(p.x, p.y, p.shape)) {
                 piece.move(p);
             } else {
                 freezePiece();
                 piece = spawnPiece();
             }
             dropCounter = 0; // Reset counter
         }


         clearBoard();
         drawBoard();
         if (piece) piece.draw(); // Draw current piece

         animationFrameId = requestAnimationFrame(gameLoop);
    }

     function startGame() {
         board = createBoard();
         score = 0;
         scoreDisplay.textContent = `Điểm: ${score}`;
         piece = spawnPiece();
         gameOverState = false;
         restartButton.style.display = 'none'; // Hide restart button
         lastTime = 0; // Reset time for game loop
         dropCounter = 0;
         dropInterval = 1000; // Reset speed
         if (animationFrameId) cancelAnimationFrame(animationFrameId); // Stop previous loop if any
         gameLoop(); // Start new game loop
     }

     // Event Listeners
     document.addEventListener('keydown', (e) => {
         // Chỉ chặn cuộn khi nhấn các phím dùng trong game
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                handleKeyPress(e.key);
         }
     });

    restartButton.addEventListener('click', startGame);

     // Start the first game
     startGame();

}); // Kết thúc DOMContentLoaded