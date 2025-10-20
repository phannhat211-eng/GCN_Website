document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('flappyBirdCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('flappy-score');

    // --- BIẾN VẬT LÝ ĐÃ ĐƯỢC TINH CHỈNH ---
    let birdX = 50;
    let birdY = canvas.height / 2;
    let birdVelocity = 0;
    const gravity = 0.2; // Giảm trọng lực (rơi chậm hơn)
    const jumpStrength = -5; // Giảm sức nhảy (nhảy thấp hơn, dễ kiểm soát)
    let pipes = [];
    let frame = 0;
    let score = 0;
    let gameActive = true;
    const pipeWidth = 50;
    const pipeGap = 130; // Tăng khoảng cách ống (dễ hơn)
    const pipeFrequency = 120; // Tăng tần suất (ống thưa hơn)

    // --- THÊM CODE TẢI ẢNH CHIM ---
    const birdImage = new Image();
    // !! Quan trọng: Đảm bảo bạn có file 'flappy_bird.png' trong thư mục 'images/' !!
    birdImage.src = 'images/flappy.png';
    const birdWidth = 34; // Chiều rộng ảnh chim (pixel) - Sửa nếu ảnh của bạn khác
    const birdHeight = 24; // Chiều cao ảnh chim (pixel) - Sửa nếu ảnh của bạn khác
    // --- KẾT THÚC CODE TẢI ẢNH ---

    // Pipe class (Không đổi)
    class Pipe {
        constructor() {
            this.topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
            this.bottomY = this.topHeight + pipeGap;
            this.x = canvas.width;
            this.width = pipeWidth;
            this.scored = false;
        }
        draw() {
            ctx.fillStyle = '#008000';
            ctx.fillRect(this.x, 0, this.width, this.topHeight);
            ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);
        }
        update() {
            this.x -= 2;
        }
    }

    // Hàm nhảy (Không đổi)
    function birdJump() {
        if (gameActive) {
            birdVelocity = jumpStrength;
        } else {
            restartGame();
        }
    }

    // Hàm chơi lại (Không đổi)
    function restartGame() {
        birdX = 50;
        birdY = canvas.height / 2;
        birdVelocity = 0;
        pipes = [];
        frame = 0;
        score = 0;
        gameActive = true;
        scoreDisplay.textContent = `Điểm: ${score}`;
        // Hủy frame cũ trước khi gọi gameLoop mới (tối ưu nhỏ)
        // cancelAnimationFrame(gameLoop); // Có thể thêm dòng này nếu muốn chắc chắn
        gameLoop();
    }

    // Hàm xử lý ống (ĐÃ SỬA VA CHẠM)
    function handlePipes() {
        if (frame % pipeFrequency === 0) {
            pipes.push(new Pipe());
        }
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();
            pipes[i].draw();

            // --- VA CHẠM ĐÃ SỬA ĐỂ DÙNG KÍCH THƯỚC ẢNH CHIM ---
            if (
                birdX + birdWidth > pipes[i].x && birdX < pipes[i].x + pipes[i].width &&
                (birdY < pipes[i].topHeight || birdY + birdHeight > pipes[i].bottomY)
            ) {
                gameOver();
                return;
            }
            // --- KẾT THÚC SỬA VA CHẠM ---

            if (pipes[i].x + pipes[i].width < birdX && !pipes[i].scored) {
                score++;
                pipes[i].scored = true;
                scoreDisplay.textContent = `Điểm: ${score}`;
            }
            if (pipes[i].x + pipes[i].width < 0) {
                pipes.splice(i, 1);
            }
        }
    }

    // Hàm Game Over (Không đổi)
    function gameOver() {
        gameActive = false;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        ctx.font = '24px Nunito';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Nunito';
        ctx.fillText('Nhấn Space/Click để chơi lại', canvas.width / 2, canvas.height / 2 + 25);
    }

    // Vòng lặp game (ĐÃ SỬA VẼ CHIM VÀ VA CHẠM ĐẤT)
    function gameLoop() {
        if (!gameActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vật lý chim
        birdVelocity += gravity;
        birdY += birdVelocity;

        // --- VA CHẠM ĐẤT/TRẦN ĐÃ SỬA ---
        if (birdY + birdHeight > canvas.height) { // Chạm đất
            birdY = canvas.height - birdHeight; // Đặt chim trên mặt đất
            birdVelocity = 0;
            gameOver();
        }
        if (birdY < 0) { // Chạm trần
            birdY = 0;
            birdVelocity = 0;
        }
        // --- KẾT THÚC SỬA VA CHẠM ---

        // --- ĐÃ SỬA: VẼ ẢNH CHIM THAY VÌ HÌNH VUÔNG ---
        ctx.drawImage(birdImage, birdX, birdY, birdWidth, birdHeight);
        // --- KẾT THÚC SỬA VẼ CHIM ---

        handlePipes();

        frame++;
        requestAnimationFrame(gameLoop);
    }

    // Sự kiện nhảy (Không đổi)
    canvas.addEventListener('click', birdJump);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            birdJump();
        }
    });

    // Bắt đầu game
    gameLoop();
});