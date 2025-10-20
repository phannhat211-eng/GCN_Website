document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snakeCanvas');
    // Kiểm tra xem canvas có tồn tại không
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('snake-score');

    // --- LẤY CÁC NÚT ĐIỀU KHIỂN MOBILE (ĐÃ BỔ SUNG LẠI) ---
    const btnUp = document.getElementById('snake-up');
    const btnDown = document.getElementById('snake-down');
    const btnLeft = document.getElementById('snake-left');
    const btnRight = document.getElementById('snake-right');
    // --- KẾT THÚC LẤY NÚT ---

    const gridSize = 20; // Kích thước ô
    const tileCountX = canvas.width / gridSize;
    const tileCountY = canvas.height / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let dx = 0;
    let dy = 0;
    let food = { x: 15, y: 15 };
    let score = 0;
    let gameActive = false;
    let gameSpeed = 100;
    let gameInterval;

    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        scoreDisplay.textContent = `Điểm: ${score}`;
        generateFood();
        gameActive = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }

    function gameLoop() {
        if (!gameActive) return;
        moveSnake();
        if (!gameActive) return;
        clearCanvas();
        drawFood();
        drawSnake();
    }

    // --- HÀM ĐÃ SỬA MÀU NỀN ---
    function clearCanvas() {
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#2e4a5e' : '#a7e9af';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // --- HÀM ĐÃ SỬA MÀU RẮN, THÊM VIỀN, VÀ PHÂN BIỆT ĐẦU ---
    function drawSnakePart(part, index) {
        if (index === 0) { // Đầu rắn
            ctx.fillStyle = '#ffb347'; // Cam
            ctx.strokeStyle = '#e67e22'; // Viền cam đậm
            ctx.lineWidth = 2;
        } else { // Thân rắn
            ctx.fillStyle = '#2ecc71'; // Xanh lá sáng
            ctx.strokeStyle = '#27ae60'; // Viền xanh đậm
            ctx.lineWidth = 1;
        }
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
        ctx.strokeRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    // --- HÀM ĐÃ SỬA ĐỂ TRUYỀN INDEX ---
    function drawSnake() {
        snake.forEach((part, index) => drawSnakePart(part, index));
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        // Va chạm
        if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY || snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)) {
             gameOver();
             return;
        }
        snake.unshift(head);
        // Ăn mồi
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreDisplay.textContent = `Điểm: ${score}`;
            generateFood();
        } else {
            snake.pop();
        }
    }


    function generateFood() {
        food.x = Math.floor(Math.random() * tileCountX);
        food.y = Math.floor(Math.random() * tileCountY);
        if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
             generateFood(); // Tạo lại nếu trùng rắn
        }
    }


    // --- HÀM ĐÃ SỬA MÀU MỒI VÀ VẼ HÌNH TRÒN ---
    function drawFood() {
        ctx.fillStyle = '#e74c3c'; // Đỏ tươi
        ctx.strokeStyle = '#c0392b'; // Viền đỏ đậm
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    function gameOver() {
        gameActive = false;
        clearInterval(gameInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        ctx.font = '24px Nunito';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Nunito';
        ctx.fillText('Nhấn mũi tên/nút để chơi lại', canvas.width / 2, canvas.height / 2 + 25); // Sửa text
    }

    // --- ĐIỀU KHIỂN RẮN BẰNG PHÍM (ĐÃ CÓ NGĂN CUỘN TRANG) ---
    document.addEventListener('keydown', (e) => {
        // Chặn cuộn trang
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        handleDirectionInput(e.key); // Gọi hàm xử lý chung
    });

    // --- SỰ KIỆN CLICK CHO NÚT MOBILE (ĐÃ BỔ SUNG LẠI) ---
    if (btnUp && btnDown && btnLeft && btnRight) {
        btnUp.addEventListener('click', () => handleDirectionInput('ArrowUp'));
        btnDown.addEventListener('click', () => handleDirectionInput('ArrowDown'));
        btnLeft.addEventListener('click', () => handleDirectionInput('ArrowLeft'));
        btnRight.addEventListener('click', () => handleDirectionInput('ArrowRight'));
    }

    // --- HÀM XỬ LÝ CHUNG CHO CẢ PHÍM VÀ NÚT (ĐÃ TÁCH RA) ---
    function handleDirectionInput(key) {
         if (!gameActive && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
             startGame(); // Bắt đầu/Chơi lại
             return; // Không đổi hướng ngay khi vừa bắt đầu
         }

         if (!gameActive) return; // Không đổi hướng khi chưa bắt đầu

         const goingUp = dy === -1;
         const goingDown = dy === 1;
         const goingLeft = dx === -1;
         const goingRight = dx === 1;

         // Ngăn rắn đi ngược lại
         if (key === 'ArrowUp' && !goingDown) { dx = 0; dy = -1; }
         if (key === 'ArrowDown' && !goingUp) { dx = 0; dy = 1; }
         if (key === 'ArrowLeft' && !goingRight) { dx = -1; dy = 0; }
         if (key === 'ArrowRight' && !goingLeft) { dx = 1; dy = 0; }
    }
    // --- KẾT THÚC BỔ SUNG MOBILE CONTROLS ---

    // Khởi tạo ban đầu
     clearCanvas();
     drawFood();
     drawSnake();

}); // Kết thúc DOMContentLoaded