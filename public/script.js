let slideIndex = 0;
const slidesContainer = document.getElementById("gallerySlides");
const indicatorsContainer = document.getElementById("galleryIndicators");

const baseURL = "https://jackianothebarber.onrender.com"; // Backend URL

// Show slides based on the current index
function showSlides(index) {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    if (index >= slides.length) slideIndex = 0;
    if (index < 0) slideIndex = slides.length - 1;

    slides.forEach((slide, i) => {
        slide.style.transform = `translateX(-${slideIndex * 100}%)`;
    });

    dots.forEach((dot, i) => {
        dot.className = dot.className.replace(" active", "");
        if (i === slideIndex) dot.className += " active";
    });
}

// Move to the next or previous slide
function moveSlide(n) {
    slideIndex += n;
    showSlides(slideIndex);
}

// Jump to a specific slide
function currentSlide(n) {
    slideIndex = n - 1;
    showSlides(slideIndex);
}

// Load uploaded images from backend and build the slider
async function loadSliderFromBackend() {
    try {
        const response = await fetch(`${baseURL}/api/gallery`);
        const data = await response.json();

        slidesContainer.innerHTML = "";
        indicatorsContainer.innerHTML = "";

        data.gallery.forEach((url, index) => {
            // Create slide
            const slide = document.createElement("img");
            slide.src = `${baseURL}${url}`;
            slide.className = "slide";
            slide.alt = `Slide ${index + 1}`;
            slidesContainer.appendChild(slide);

            // Create indicator
            const dot = document.createElement("span");
            dot.className = "dot";
            dot.onclick = () => currentSlide(index + 1);
            indicatorsContainer.appendChild(dot);
        });

        // Start with the first slide
        showSlides(slideIndex);
    } catch (err) {
        console.error("Failed to load gallery from backend:", err);
    }
}

// Call this on page load
window.onload = loadSliderFromBackend;