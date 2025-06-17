class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 12;
        this.scoreBarHeight = 16;
        this.canvas.width = 150;
        this.canvas.height = 150;

        this.gameAreaWidth = this.canvas.width;
        this.gameAreaHeight = this.canvas.height - this.scoreBarHeight;
        this.gameAreaTop = this.scoreBarHeight;

        this.radius = (this.gridSize - 2) / 2;

        // 允许的格子数（保证圆心不会超出边界）
        this.xCount = Math.floor((this.gameAreaWidth - this.radius * 2) / this.gridSize) + 1;
        this.yCount = Math.floor((this.gameAreaHeight - this.radius * 2) / this.gridSize) + 1;

        this.isGameOver = false;
        this.snake = [{
            x: this.radius + this.gridSize * 3,
            y: this.gameAreaTop + this.radius + this.gridSize * 3
        }];
        this.direction = 'right';
        this.score = 0;
        this.food = this.generateFood();
        this.gameLoop = null;

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    start() {
        this.isGameOver = false;
        this.snake = [{
            x: this.radius + this.gridSize * 3,
            y: this.gameAreaTop + this.radius + this.gridSize * 3
        }];
        this.direction = 'right';
        this.score = 0;
        this.food = this.generateFood();
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 500);
    }

    handleKeyPress(event) {
        if (this.isGameOver) return;
        switch (event.key) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.direction = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.direction = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.direction = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.direction = 'right';
                break;
        }
    }

    generateFood() {
        let x, y;
        do {
            x = this.radius + Math.floor(Math.random() * this.xCount) * this.gridSize;
            y = this.gameAreaTop + this.radius + Math.floor(Math.random() * this.yCount) * this.gridSize;
        } while (this.snake.some(segment => segment.x === x && segment.y === y));
        return { x, y };
    }

    update() {
        if (this.isGameOver) return;

        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y -= this.gridSize; break;
            case 'down': head.y += this.gridSize; break;
            case 'left': head.x -= this.gridSize; break;
            case 'right': head.x += this.gridSize; break;
        }

        // 边界和自撞检测（严格用radius做边界）
        if (
            head.x - this.radius < 0 ||
            head.x + this.radius > this.gameAreaWidth ||
            head.y - this.radius < this.gameAreaTop ||
            head.y + this.radius > this.gameAreaTop + this.gameAreaHeight ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // 吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 分数栏
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `SCORES: ${this.score}`,
            Math.round(this.canvas.width / 2) - 5, // 补偿左边距
            Math.round(12)
        );

        // 添加分隔线
        this.ctx.strokeStyle = '#ffffff3f'; // 分隔线颜色
        this.ctx.lineWidth = 1; // 分隔线粗细
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.scoreBarHeight); // 分隔线起点
        this.ctx.lineTo(this.canvas.width, this.scoreBarHeight); // 分隔线终点
        this.ctx.stroke();

        // 蛇
        this.snake.forEach((segment, index) => {
            this.ctx.beginPath();
            this.ctx.fillStyle = index === 0 ? '#927fff' : '#d4c5ff';
            this.ctx.arc(
                segment.x,
                segment.y,
                this.radius,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });

        // 食物
        this.ctx.beginPath();
        this.ctx.fillStyle = '#ff277a';
        this.ctx.arc(
            this.food.x,
            this.food.y,
            this.radius,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // 游戏结束提示
        if (this.isGameOver) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.85;
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('GAME OVER', Math.round(this.canvas.width / 2) - 5, this.canvas.height / 2); // 补偿左边距
            this.ctx.restore();
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isGameOver = true;
        this.draw();
        setTimeout(() => {
            document.getElementById('startSnakeGame').style.display = 'block';
            this.canvas.style.display = 'none';
            this.isGameOver = false;
        }, 3000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startSnakeGame');
    const canvas = document.getElementById('snakeCanvas');
    const game = new SnakeGame(canvas);

    startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        canvas.style.display = 'block';
        game.start();
    });
});