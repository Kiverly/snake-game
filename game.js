document.addEventListener('DOMContentLoaded', () => {
    // 游戏常量
    const CELL_SIZE = 20;
    const WIDTH = 800;
    const HEIGHT = 600;
    const FPS = 10;
    const UP = { x: 0, y: -1 };
    const DOWN = { x: 0, y: 1 };
    const LEFT = { x: -1, y: 0 };
    const RIGHT = { x: 1, y: 0 };

    // 颜色定义
    const COLORS = {
        WHITE: '#FFFFFF',
        BLACK: '#000000',
        RED: '#FF0000',
        GREEN: '#00FF00',
        GRAY: '#333333',
        LIGHT_GRAY: '#555555'
    };

    // 获取DOM元素
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.querySelector('.score');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');

    // 游戏状态
    const GameState = {
        MENU: 0,
        PLAYING: 1,
        GAME_OVER: 2,
        PAUSED: 3
    };

    // 游戏变量
    let currentState = GameState.MENU;
    let snake = [];
    let direction = UP;
    let nextDirection = UP;
    let food = {};
    let score = 0;
    let gameLoopId = null;
    let lastFrameTime = 0;

    // 初始化游戏
    function init() {
        // 设置画布大小
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        // 添加事件监听器
        document.addEventListener('keydown', handleKeyPress);
        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', togglePause);
        restartBtn.addEventListener('click', resetGame);

        // 初始绘制菜单
        drawMenu();
    }

    // 开始游戏
    function startGame() {
        if (currentState === GameState.MENU || currentState === GameState.GAME_OVER) {
            resetGame();
        }
        currentState = GameState.PLAYING;
        lastFrameTime = performance.now();
        gameLoop();
    }

    // 重置游戏
    function resetGame() {
        // 重置蛇的位置和方向
        snake = [
            { x: 5, y: 5 },
            { x: 5, y: 6 },
            { x: 5, y: 7 }
        ];
        direction = UP;
        nextDirection = UP;
        score = 0;
        updateScore();
        generateFood();
    }

    // 暂停/继续游戏
    function togglePause() {
        if (currentState === GameState.PLAYING) {
            currentState = GameState.PAUSED;
            cancelAnimationFrame(gameLoopId);
        } else if (currentState === GameState.PAUSED) {
            currentState = GameState.PLAYING;
            lastFrameTime = performance.now();
            gameLoop();
        }
    }

    // 处理键盘输入
    function handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== DOWN) nextDirection = UP;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== UP) nextDirection = DOWN;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== RIGHT) nextDirection = LEFT;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== LEFT) nextDirection = RIGHT;
                break;
            case ' ': // 空格键暂停/继续
                togglePause();
                break;
            case 'Enter': // 回车键开始游戏
                if (currentState === GameState.MENU || currentState === GameState.GAME_OVER) {
                    startGame();
                }
                break;
        }
    }

    // 生成食物
    function generateFood() {
        const maxX = Math.floor(WIDTH / CELL_SIZE);
        const maxY = Math.floor(HEIGHT / CELL_SIZE);

        // 确保食物不会生成在蛇身上
        do {
            food = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
        } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    }

    // 更新分数
    function updateScore() {
        scoreElement.textContent = `得分: ${score}`;
    }

    // 检查碰撞
    function checkCollisions() {
        const head = snake[0];
        const maxX = Math.floor(WIDTH / CELL_SIZE);
        const maxY = Math.floor(HEIGHT / CELL_SIZE);

        // 墙壁碰撞
        if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
            return true;
        }

        // 自身碰撞
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }

        return false;
    }

    // 更新游戏状态
    function update() {
        // 更新方向
        direction = nextDirection;

        // 获取蛇头
        const head = { ...snake[0] };

        // 计算新蛇头位置
        head.x += direction.x;
        head.y += direction.y;

        // 将新蛇头添加到蛇身
        snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            updateScore();
            generateFood();
        } else {
            // 没吃到食物，移除尾部
            snake.pop();
        }

        // 检查碰撞
        if (checkCollisions()) {
            currentState = GameState.GAME_OVER;
            cancelAnimationFrame(gameLoopId);
        }
    }

    // 绘制蛇
    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? COLORS.LIGHT_GRAY : COLORS.GREEN;
            ctx.fillRect(
                segment.x * CELL_SIZE,
                segment.y * CELL_SIZE,
                CELL_SIZE - 1,
                CELL_SIZE - 1
            );
        });
    }

    // 绘制食物
    function drawFood() {
        ctx.fillStyle = COLORS.RED;
        ctx.fillRect(
            food.x * CELL_SIZE,
            food.y * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1
        );
    }

    // 绘制菜单
    function drawMenu() {
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // 绘制标题
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '48px SimHei';
        ctx.textAlign = 'center';
        ctx.fillText('贪吃蛇游戏', WIDTH / 2, HEIGHT / 3);

        // 绘制提示
        ctx.font = '24px SimHei';
        ctx.fillText('按回车键或点击开始按钮开始游戏', WIDTH / 2, HEIGHT / 2);
        ctx.fillText('使用方向键或WASD控制蛇移动', WIDTH / 2, HEIGHT / 2 + 40);
        ctx.fillText('空格键暂停/继续游戏', WIDTH / 2, HEIGHT / 2 + 80);
    }

    // 绘制游戏结束界面
    function drawGameOver() {
        // 半透明遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '48px SimHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', WIDTH / 2, HEIGHT / 3);

        ctx.font = '24px SimHei';
        ctx.fillText(`最终得分: ${score}`, WIDTH / 2, HEIGHT / 2);
        ctx.fillText('按回车键或点击重新开始按钮', WIDTH / 2, HEIGHT / 2 + 40);
    }

    // 绘制暂停界面
    function drawPause() {
        // 半透明遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '48px SimHei';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', WIDTH / 2, HEIGHT / 2);
        ctx.font = '24px SimHei';
        ctx.fillText('按空格键或点击继续按钮', WIDTH / 2, HEIGHT / 2 + 40);
    }

    // 绘制游戏界面
    function drawGame() {
        // 清空画布
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // 绘制蛇和食物
        drawSnake();
        drawFood();
    }

    // 渲染函数
    function render() {
        switch(currentState) {
            case GameState.MENU:
                drawMenu();
                break;
            case GameState.PLAYING:
                drawGame();
                break;
            case GameState.GAME_OVER:
                drawGame();
                drawGameOver();
                break;
            case GameState.PAUSED:
                drawGame();
                drawPause();
                break;
        }
    }

    // 游戏主循环
    function gameLoop(timestamp) {
        // 控制帧率
        if (!timestamp) timestamp = 0;
        const elapsed = timestamp - lastFrameTime;
        const interval = 1000 / FPS;

        if (elapsed > interval) {
            lastFrameTime = timestamp - (elapsed % interval);
            update();
            render();
        }

        if (currentState === GameState.PLAYING) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }

    // 启动游戏
    init();
});