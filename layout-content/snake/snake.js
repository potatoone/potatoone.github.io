class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 12;
        this.margin = 9;         // 边距
        this.gameAreaTop = 9;    // 顶部分数栏高度
        this.canvas.width = 150; // 画布宽度
        this.canvas.height = 150; // 画布高度
        this.gameAreaWidth = this.canvas.width - this.margin * 2;
        this.gameAreaHeight = this.canvas.height - this.gameAreaTop - this.margin * 2;
        this.isGameOver = false;

        this.snake = [{ x: this.margin + this.gridSize * 3, y: this.gameAreaTop + this.margin + this.gridSize * 3 }];
        this.direction = 'right';
        this.score = 0;
        this.food = this.generateFood();
        this.gameLoop = null;

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    start() {
        this.isGameOver = false;
        this.snake = [{ x: this.margin + this.gridSize * 3, y: this.gameAreaTop + this.margin + this.gridSize * 3 }];
        this.direction = 'right';
        this.score = 0;
        this.food = this.generateFood();
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 450);
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
        const x = Math.floor(Math.random() * (this.gameAreaWidth / this.gridSize)) * this.gridSize + this.margin;
        const y = Math.floor(Math.random() * (this.gameAreaHeight / this.gridSize)) * this.gridSize + this.gameAreaTop + this.margin;
        // 避免食物生成在蛇身上
        if (this.snake.some(segment => segment.x === x && segment.y === y)) {
            return this.generateFood();
        }
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

        // 边界和自撞检测
        if (
            head.x < this.margin ||
            head.x >= this.margin + this.gameAreaWidth ||
            head.y < this.gameAreaTop + this.margin ||
            head.y >= this.gameAreaTop + this.margin + this.gameAreaHeight ||
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

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        ctx.stroke();
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制圆角边框
        this.ctx.strokeStyle = '#ffffff3f';
        this.ctx.lineWidth = 0.6;
        this.drawRoundedRect(
            this.ctx,
            this.margin,
            this.gameAreaTop + this.margin,
            this.gameAreaWidth,
            this.gameAreaHeight,
            12
        );

        // 分数栏
        this.ctx.font = '10px';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `SCORES: ${this.score}`,
            this.canvas.width / 2,
            this.margin + 5
        );

        // 蛇
        this.snake.forEach((segment, index) => {
            this.ctx.beginPath();
            if (index === 0) {
                this.ctx.fillStyle = '#927fff'; // 蛇头
            } else {
                this.ctx.fillStyle = '#d4c5ff'; // 蛇身
            }
            this.ctx.arc(
                segment.x + this.gridSize / 2,
                segment.y + this.gridSize / 2,
                (this.gridSize - 2) / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });

        // 食物
        this.ctx.beginPath();
        this.ctx.fillStyle = '#ff277a';
        this.ctx.arc(
            this.food.x + this.gridSize / 2,
            this.food.y + this.gridSize / 2,
            (this.gridSize - 2) / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // 游戏结束提示
        if (this.isGameOver) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.85;
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 17px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isGameOver = true;
        this.draw(); // 立即刷新为gameover画面
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