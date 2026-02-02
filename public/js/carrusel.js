const slides = document.querySelector('.slides');
const slideCount = document.querySelectorAll('.slide').length;
let index = 0;

document.querySelector('.next').onclick = () => {
    index = (index + 1) % slideCount;
    update();
};

document.querySelector('.prev').onclick = () => {
    index = (index - 1 + slideCount) % slideCount;
    update();
};

function update() {
    slides.style.transform = `translateX(-${index * 100}%)`;
}

/* AUTO SLIDE */
setInterval(() => {
    index = (index + 1) % slideCount;
    update();
}, 4000);
