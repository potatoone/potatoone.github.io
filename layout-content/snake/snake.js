// 绘制圆角矩形，支持单独设置四个角的半径
function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
  else {
    const d = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let k in d) r[k] = r[k] || 0;
  }
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  ctx.fill();
}

class SnakeGame {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');

    // 常量配置
    this.scoreBarHeight = 10;
    this.gridSize = 12;
    this.cols = 10;
    this.rows = 10;
    this.radius = 3;    // 方块圆角半径
    this.gap = 1;       // 方块间隙像素

    // 画布尺寸
    this.width = this.cols * this.gridSize;
    this.height = this.rows * this.gridSize + this.scoreBarHeight;
    this.c.width = this.width;
    this.c.height = this.height;

    this.reset();

    // 键盘监听
    document.addEventListener('keydown', e => this.onKey(e));
  }

  reset() {
    // 初始化蛇身、食物、方向和状态
    this.snake = [{ x: this.gridSize * 3, y: this.scoreBarHeight + this.gridSize * 3 }];
    this.food = this.randomFood();
    this.dir = 'right';
    this.score = 0;
    this.over = false;
  }

  randomFood() {
    // 随机生成不与蛇身重叠的食物位置
    let x, y;
    do {
      x = Math.floor(Math.random() * this.cols) * this.gridSize;
      y = Math.floor(Math.random() * this.rows) * this.gridSize + this.scoreBarHeight;
    } while (this.snake.some(s => s.x === x && s.y === y));
    return { x, y };
  }

  start() {
    this.reset();
    clearInterval(this.loop);
    this.loop = setInterval(() => {
      this.update();
      this.draw();
    }, 450);

    // 游戏开始时设 .tab1 透明度为1
    document.querySelector('.tab1').style.opacity = '1';
  }

  onKey(e) {
    if (this.over) return;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const next = map[e.key];
    if (next && next !== opp[this.dir]) this.dir = next;
  }

  update() {
    // 计算蛇头新位置
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const head = { ...this.snake[0] };
    head.x += moves[this.dir][0] * this.gridSize;
    head.y += moves[this.dir][1] * this.gridSize;

    // 边界和自撞检测
    const out = head.x < 0 || head.x >= this.width || head.y < this.scoreBarHeight || head.y >= this.height;
    const hit = this.snake.some(s => s.x === head.x && s.y === head.y);
    if (out || hit) return this.end();

    this.snake.unshift(head);

    // 吃到食物则加分并重新生成，否则尾部移除
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.food = this.randomFood();
    } else {
      this.snake.pop();
    }
  }

  draw() {
    const c = this.ctx;
    c.clearRect(0, 0, this.width, this.height);

    // 分数栏文本
    c.fillStyle = '#fff';
    c.font = '9px Arial';
    c.textAlign = 'center';
    c.fillText(`SCORE: ${this.score}`, this.width / 2, 7);

    // 分隔线
    c.strokeStyle = '#ffffff3f';
    c.beginPath();
    c.moveTo(0, this.scoreBarHeight);
    c.lineTo(this.width, this.scoreBarHeight);
    c.stroke();

    // 蛇体绘制，带间隙和圆角
    this.snake.forEach((s, i) => {
      c.fillStyle = i ? '#d4c5ff' : '#927fff';
      roundRect(
        c,
        s.x + this.gap / 2,
        s.y + this.gap / 2,
        this.gridSize - this.gap,
        this.gridSize - this.gap,
        this.radius
      );
    });

    // 食物绘制，完整尺寸圆角矩形
    c.fillStyle = '#ff277a';
    roundRect(c, this.food.x, this.food.y, this.gridSize, this.gridSize, this.radius);

    // 游戏结束文字
    if (this.over) {
      c.save();
      c.fillStyle = '#fff';
      c.font = 'bold 18px Arial';
      c.fillText('GAME OVER', this.width / 2, this.height / 2 + this.scoreBarHeight);
      c.restore();
    }
  }

  end() {
    clearInterval(this.loop);
    this.over = true;
    this.draw();

    // 游戏结束时移除 .tab1 透明度样式
    document.querySelector('.tab1').style.removeProperty('opacity');

    // 隐藏画布，显示开始按钮
    setTimeout(() => {
      this.c.style.display = 'none';
      document.getElementById('startSnakeGame').style.display = 'block';
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snakeCanvas');
  const startBtn = document.getElementById('startSnakeGame');
  const game = new SnakeGame(canvas);

  canvas.style.width = '132px';
  canvas.style.height = '140px';

  startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    canvas.style.display = 'block';
    game.start();
  });
});
