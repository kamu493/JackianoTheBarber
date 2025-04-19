
let slideIndex = 0;
const slidesContainer = document.getElementById("gallerySlides");
const indicatorsContainer = document.getElementById("galleryIndicators");

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

// Handle image uploads
document.getElementById("imageUpload").addEventListener("change", function (event) {
    const files = event.target.files;

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Create a new image element
            const newSlide = document.createElement("img");
            newSlide.src = e.target.result;
            newSlide.alt = `Uploaded Image ${slidesContainer.children.length + 1}`;
            newSlide.className = "slide";

            // Add the new image to the slides container
            slidesContainer.appendChild(newSlide);

            // Create a new indicator dot
            const newDot = document.createElement("span");
            newDot.className = "dot";
            newDot.onclick = () => currentSlide(slidesContainer.children.length);
            indicatorsContainer.appendChild(newDot);
        };

        reader.readAsDataURL(file);
    });

    // Reset the file input
    event.target.value = "";
});

// Initialize the slider
showSlides(slideIndex);

const loginForm = document.getElementById("login");
const uploadSection = document.getElementById("uploadSection");
const imageUpload = document.getElementById("imageUpload");
const uploadButton = document.getElementById("uploadButton");
let token = "";

// Handle login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;

            // Show upload section and hide login form
            document.getElementById("loginForm").style.display = "none";
            uploadSection.style.display = "block";
        } else {
            alert("Invalid credentials");
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
});

// Handle image uploads
uploadButton.addEventListener("click", async () => {
    const files = imageUpload.files;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    try {
        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            headers: { Authorization: token },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            const uploadedImages = document.getElementById("uploadedImages");

            data.files.forEach((file) => {
                const img = document.createElement("img");
                img.src = `http://localhost:5000${file}`;
                img.alt = "Uploaded Image";
                img.style.width = "150px";
                img.style.margin = "10px";
                uploadedImages.appendChild(img);
            });
        } else {
            alert("Failed to upload images");
        }
    } catch (error) {
        console.error("Error uploading images:", error);
    }
});