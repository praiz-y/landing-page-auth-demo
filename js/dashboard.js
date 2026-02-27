const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");

hamburger.addEventListener("click", () => {
    menu.classList.toggle("active");
    hamburger.classList.toggle("active");
});

document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
        hamburger.classList.remove("active");
    });
});

document.addEventListener("click", (event) => {

    const isClickInside =
        menu.contains(event.target) ||
        hamburger.contains(event.target);

    if (!isClickInside) {
        menu.classList.remove("active");
        hamburger.classList.remove("active");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        menu.classList.remove("active");
        hamburger.classList.remove("active");
    }
});

