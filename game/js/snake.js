const canvas = document.getElementById('snakeCanvas');
const context = canvas.getContext('2d');
const box = 20; // 한 칸의 크기
let snake = [{ x: 9 * box, y: 9 * box }]; // 초기 스네이크 위치
let direction = 'RIGHT';
let game; // 게임 인터벌 저장

const walls = []; // 벽 위치 배열
for (let i = 0; i < canvas.width / box; i++) {
  walls.push({ x: i * box, y: 0 }); // 상단 벽
  walls.push({ x: i * box, y: canvas.height - box }); // 하단 벽
}
for (let i = 1; i < canvas.height / box - 1; i++) {
  walls.push({ x: 0, y: i * box }); // 좌측 벽
  walls.push({ x: canvas.width - box, y: i * box }); // 우측 벽
}

function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * ((canvas.width / box) - 2) + 1) * box, // 벽 안쪽에서만 생성
      y: Math.floor(Math.random() * ((canvas.height / box) - 2) + 1) * box, // 벽 안쪽에서만 생성
    };
  } while (walls.some((wall) => wall.x === newFood.x && wall.y === newFood.y)); // 벽 위에 생성되지 않도록 확인
  return newFood;
}

let food = generateFood(); // 초기 사과 위치

function draw() {
  // 배경
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 벽
  context.fillStyle = 'gray';
  walls.forEach((wall) => {
    context.fillRect(wall.x, wall.y, box, box);
  });

  // 음식
  context.fillStyle = 'red';
  context.fillRect(food.x, food.y, box, box);

  // 스네이크
  context.fillStyle = 'lime';
  snake.forEach((segment) => {
    context.fillRect(segment.x, segment.y, box, box);
  });

  // 스네이크 이동
  const head = { ...snake[0] };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'DOWN') head.y += box;

  // 음식 먹기
  if (head.x === food.x && head.y === food.y) {
    food = generateFood(); // 새로운 사과 생성
  } else {
    snake.pop(); // 꼬리 제거
  }

  // 충돌 감지 (벽 포함)
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    snake.some((segment) => segment.x === head.x && segment.y === head.y) ||
    walls.some((wall) => wall.x === head.x && wall.y === head.y)
  ) {
    clearInterval(game);
    document.getElementById('gameOverText').style.display = 'block'; // 스크린에 GAME OVER 표시
    document.querySelector('.game-selection').classList.add('disabled'); // 게임 목록 비활성화
    document.getElementById('startButton').style.display = 'block'; // 코인 버튼 다시 표시
    return;
  }

  snake.unshift(head); // 머리 추가
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

function startSnakeGame() {
  snake = [{ x: 9 * box, y: 9 * box }]; // 스네이크 초기화
  direction = 'RIGHT'; // 방향 초기화
  food = generateFood(); // 사과 초기화
  document.getElementById('startButton').style.display = 'none'; // 버튼 숨기기
  document.getElementById('gameOverText').style.display = 'none'; // GAME OVER 숨기기
  document.querySelector('.game-selection').classList.remove('disabled'); // 게임 목록 활성화
  game = setInterval(draw, 150); // 게임 시작 (속도를 느리게 설정)
}
