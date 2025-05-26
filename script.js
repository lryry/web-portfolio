// 최신 Q&A 미리보기(qna-list) 영역에 최신 5개 Q&A 출력
document.addEventListener('DOMContentLoaded', function() {
  const qnaList = document.querySelector('.qna-list');
  if (qnaList) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.sort((a, b) => new Date(b.time) - new Date(a.time));
    const latest = posts.slice(0, 5);
    if (latest.length === 0) {
      qnaList.innerHTML = '<li>등록된 Q&A가 없습니다.</li>';
    } else {
      qnaList.innerHTML = latest.map((post, idx) => `
        <li>
          <a href="post.html?index=${idx}">${post.title}</a>
          <span class="qna-writer">${post.writer || '익명'}</span>
        </li>
      `).join('');
    }
  }
  const quoteBox = document.getElementById('quoteBox');
  if (quoteBox) {
    const quotes = [
      { text: "성공은 준비와 기회의 만남이다.", author: "세네카" },
      { text: "시작이 반이다.", author: "아리스토텔레스" },
      { text: "불가능은 노력하지 않는 자의 변명이다.", author: "나폴레옹" },
      { text: "가장 큰 영광은 한 번도 실패하지 않음이 아니라, 실패할 때마다 다시 일어서는 데 있다.", author: "공자" },
      { text: "위대한 일도 작은 시작에서 비롯된다.", author: "키케로" },
      { text: "행동은 모든 성공의 근본이다.", author: "파블로 피카소" },
      { text: "성공은 결코 우연이 아니다.", author: "펠레" },
      { text: "지식보다 중요한 것은 상상력이다.", author: "아인슈타인" },
      { text: "성공하려면 우리가 두려워하는 일을 해야 한다.", author: "랄프 왈도 에머슨" }
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    const quoteText = quoteBox.querySelector('.quote-text');
    const quoteAuthor = quoteBox.querySelector('.quote-author');
    if (quoteText && quoteAuthor) {
      quoteText.textContent = `"${quote.text}"`;
      quoteAuthor.textContent = `- ${quote.author} -`;
    }
  }
});