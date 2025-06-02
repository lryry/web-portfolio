document.addEventListener("DOMContentLoaded", function () {
    var popups = document.querySelectorAll("#popup");
    var albumImages = document.querySelectorAll("#album-image");
    var close_boxs = document.querySelectorAll(".close-box");

    for (let i = 0; i < albumImages.length; i++) {
        albumImages[i].addEventListener("click", function () {
            var popup = popups[i];
            togglePopup(popup);
        });
    }
    for (let i = 0; i<close_boxs.length;i++) {
        close_boxs[i].addEventListener("click", function () {
            var popup = popups[i];
            togglePopup(popup);
        });
    }
    

    function togglePopup(popup) {
        if (popup.style.display === "none" || popup.style.display === "") {
            popup.style.display = "block";
        } else {
            popup.style.display = "none";
        }
    }
});
