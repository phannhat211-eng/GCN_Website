document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('flappyBirdCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('flappy-score');

    // Game variables
    let birdX = 50;
    let birdY = canvas.height / 2;
    let birdVelocity = 0;
    const gravity = 0.3;
    const jumpStrength = -6;
    let pipes = [];
    let frame = 0;
    let score = 0;
    let gameActive = true;
    const pipeWidth = 50;
    const pipeGap = 100;
    const pipeFrequency = 100; // Lower number = more frequent pipes

    // Pipe class
    class Pipe {
        constructor() {
            this.topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50; // Min 50px height
            this.bottomY = this.topHeight + pipeGap;
            this.x = canvas.width;
            this.width = pipeWidth;
            this.scored = false; // Has the bird passed this pipe?
        }

        draw() {
            ctx.fillStyle = '#008000'; // Green pipes
            // Top pipe
            ctx.fillRect(this.x, 0, this.width, this.topHeight);
            // Bottom pipe
            ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);
        }

        update() {
            this.x -= 2; // Move pipe to the left
        }
    }

    function birdJump() {
        if (gameActive) {
            birdVelocity = jumpStrength;
        } else {
            // Restart game on jump/click after game over
            restartGame();
        }
    }

    function restartGame() {
        birdX = 50;
        birdY = canvas.height / 2;
        birdVelocity = 0;
        pipes = [];
        frame = 0;
        score = 0;
        gameActive = true;
        scoreDisplay.textContent = `Điểm: ${score}`;
        gameLoop(); // Start the loop again
    }

    function handlePipes() {
        // Add new pipe
        if (frame % pipeFrequency === 0) {
            pipes.push(new Pipe());
        }

        // Update and draw pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();
            pipes[i].draw();

            // Collision detection
            if (
                birdX + 20 > pipes[i].x && birdX < pipes[i].x + pipes[i].width &&
                (birdY < pipes[i].topHeight || birdY + 20 > pipes[i].bottomY)
            ) {
                gameOver();
                return; // Stop checking other pipes
            }

            // Score point
            if (pipes[i].x + pipes[i].width < birdX && !pipes[i].scored) {
                score++;
                pipes[i].scored = true;
                scoreDisplay.textContent = `Điểm: ${score}`;
            }

            // Remove pipes that have gone off screen
            if (pipes[i].x + pipes[i].width < 0) {
                pipes.splice(i, 1);
            }
        }
    }

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

    function gameLoop() {
        if (!gameActive) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Bird physics
        birdVelocity += gravity;
        birdY += birdVelocity;

        // Prevent bird from going off top/bottom screen (basic collision)
        if (birdY + 20 > canvas.height) { // Hit ground
            birdY = canvas.height - 20;
            birdVelocity = 0;
            gameOver();
        }
        if (birdY < 0) { // Hit ceiling
            birdY = 0;
            birdVelocity = 0;
        }

        // Draw bird (simple yellow square)
        ctx.fillStyle = '#FF0';
        ctx.fillRect(birdX, birdY, 20, 20);

        // Handle pipes
        handlePipes();

        frame++;
        requestAnimationFrame(gameLoop); // Keep looping
    }

    // Event Listeners for Jump
    canvas.addEventListener('click', birdJump);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            birdJump();
        }
    });

    // Start the game
    gameLoop();
});