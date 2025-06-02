function getRandomResult() {   
    // 1에서 10까지 랜덤한 숫자 생성
    var randomNumber = Math.floor(Math.random() * 40) + 1;

    // 10줄의 문자열이 저장된 배열
    var lines = [
        // 알레프
        "Fall in love agin",
        "No One Told Me Why",
        "On & On",
        "창문",
        "호랑이의 숲",
        "파수꾼",
        "난 잠시 즐거워서 조금 슬플 거에요",
        "유성",
        "첫사랑은 기준이 된다는걸 너는 알까",
        "Girl in red",
        // 이준형
        "이글루",
        "꽃밭",
        "Monologue",
        "Fly away",
        "UTOPIA",
        "Sleep",
        "아이",
        "함께할 수 있기를",
        "Summer!",
        "을왕리",
        //송하예
        "Stay With Me",
        "Say Goodbye",
        "새사랑",
        "행복해",
        "겨울비",
        "함부로 다정하게",
        "이 노래 (This song)",
        "너를 보는게 지친 하루에",
        "처음처럼",
        "사랑이라 쓰고 이별이라 읽어",
        // 루시
        "개화(Flowering)",
        "Jogging (조깅)",
        "Snooze (선잠)",
        "수박깨러가 (Watermelon)",
        "난로",
        "One by One",
        "Oh-eh",
        "채워 (Fill it up)",
        "아지랑이 (Haze)",
        "Hot! (뜨거)"
    ];

    var resultText = "";
    
    // 랜덤으로 선택된 숫자에 해당하는 줄을 출력
    if (0 < randomNumber && randomNumber <= 10)
        resultText = "ALEPH (이정재) - " + lines[randomNumber - 1];
    else if (10 < randomNumber && randomNumber <= 20)
        resultText = "이준형 - " + lines[randomNumber - 1];
    else if (20 < randomNumber && randomNumber <= 30)
        resultText = "송하예 - " + lines[randomNumber - 1];
    else if (30 < randomNumber && randomNumber <= 40)
        resultText = "루시 (LUCY) - " + lines[randomNumber - 1];

    // var audio = new Audio("./music/" + resultText + ".mp3");
    // audio.play();
    document.getElementById("result").innerHTML = resultText; 
}

