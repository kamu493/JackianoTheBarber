
    
let slideIndex = 0;
function showSlides() {
    let slides = document.querySelectorAll(".gallery-preview img");
    slides.forEach(img => img.style.display = "none");
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 3000); // Change every 3 seconds
}
document.addEventListener("DOMContentLoaded", showSlides);

document.querySelector("button").addEventListener("mouseover", function () {
    this.style.boxShadow = "0px 0px 10px white";
});

document.querySelector("button").addEventListener("mouseout", function () {
    this.style.boxShadow = "none";
});
