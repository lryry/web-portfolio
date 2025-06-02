// 별점 표시 함수
function showRating(rating) {
  const starRating = document.getElementById('starRating');
  starRating.innerHTML = ''; // 기존 내용 초기화

  for (let i = 0; i < rating; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    starRating.appendChild(star);
  }
}