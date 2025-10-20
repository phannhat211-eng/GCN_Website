document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snakeCanvas');
    // Kiểm tra xem canvas có tồn tại không (vì nó ẩn ban đầu)
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('snake-score');

    const gridSize = 20; // Kích thước mỗi ô lưới
    const tileCountX = canvas.width / gridSize;
    const tileCountY = canvas.height / gridSize;

    let snake = [{ x: 10, y: 10 }]; // Vị trí ban đầu của rắn
    let dx = 0; // Hướng di chuyển ngang (1: phải, -1: trái)
    let dy = 0; // Hướng di chuyển dọc (1: xuống, -1: lên)
    let food = { x: 15, y: 15 }; // Vị trí thức ăn ban đầu
    let score = 0;
    let gameActive = false; // Bắt đầu khi người chơi nhấn mũi tên
    let gameSpeed = 100; // mili-giây giữa các bước di chuyển (nhỏ hơn = nhanh hơn)
    let gameInterval;

    function startGame() {
        if (gameInterval) clearInterval(gameInterval); // Xóa vòng lặp cũ
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        scoreDisplay.textContent = `Điểm: ${score}`;
        generateFood();
        gameActive = true;
        // Bắt đầu vòng lặp game
        gameInterval = setInterval(gameLoop, gameSpeed); 
    }

    function gameLoop() {
        if (!gameActive) return;
        moveSnake();
        if (!gameActive) return; // Kiểm tra lại sau khi move (có thể thua)
        clearCanvas();
        drawFood();
        drawSnake();
    }

    function clearCanvas() {
        ctx.fillStyle = '#2c3e50'; // Màu nền canvas
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawSnakePart(part) {
        ctx.fillStyle = '#2ecc71'; // Màu xanh lá cho rắn
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2); // Vẽ ô nhỏ hơn 1 chút
    }

    function drawSnake() {
        snake.forEach(drawSnakePart);
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Kiểm tra va chạm tường
        if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
            gameOver();
            return;
        }
        // Kiểm tra tự cắn đuôi
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head); // Thêm đầu mới

        // Kiểm tra ăn mồi
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreDisplay.textContent = `Điểm: ${score}`;
            generateFood();
            // Tăng tốc độ (tùy chọn)
            // clearInterval(gameInterval);
            // gameSpeed *= 0.98; // Nhanh hơn 2% mỗi lần ăn
            // gameInterval = setInterval(gameLoop, gameSpeed);
        } else {
            snake.pop(); // Xóa đuôi nếu không ăn mồi
        }
    }

    function generateFood() {
        food.x = Math.floor(Math.random() * tileCountX);
        food.y = Math.floor(Math.random() * tileCountY);
        // Đảm bảo thức ăn không nằm trên rắn
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) {
                generateFood(); // Tạo lại nếu trùng
            }
        });
    }

    function drawFood() {
        ctx.fillStyle = '#e74c3c'; // Màu đỏ cho thức ăn
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    function gameOver() {
        gameActive = false;
        clearInterval(gameInterval); // Dừng vòng lặp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        ctx.font = '24px Nunito';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Nunito';
        ctx.fillText('Nhấn mũi tên bất kỳ để chơi lại', canvas.width / 2, canvas.height / 2 + 25);
    }

    // Điều khiển rắn bằng phím mũi tên
    document.addEventListener('keydown', (e) => {
        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingLeft = dx === -1;
        const goingRight = dx === 1;

        if (!gameActive && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
             startGame(); // Bắt đầu/Chơi lại khi nhấn mũi tên lúc game over
        }


        if (e.key === 'ArrowUp' && !goingDown) { dx = 0; dy = -1; }
        if (e.key === 'ArrowDown' && !goingUp) { dx = 0; dy = 1; }
        if (e.key === 'ArrowLeft' && !goingRight) { dx = -1; dy = 0; }
        if (e.key === 'ArrowRight' && !goingLeft) { dx = 1; dy = 0; }
    });

    // Khởi tạo ban đầu (chỉ vẽ, chưa chạy)
     clearCanvas();
     drawFood();
     drawSnake();
     statusText.textContent = `Điểm: ${score}`; // Hiển thị điểm ban đầu


}); // Kết thúc DOMContentLoaded