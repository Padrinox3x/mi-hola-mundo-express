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

const form = document.getElementById('formImagen');
const inputImagen = document.getElementById('imagenInput');
const errorImagen = document.getElementById('errorImagen');

const formatosPermitidos = ['image/png', 'image/jpeg'];

inputImagen.addEventListener('change', () => {
    const archivo = inputImagen.files[0];

    if (!archivo) {
        errorImagen.textContent = '';
        return;
    }

    if (!formatosPermitidos.includes(archivo.type)) {
        errorImagen.textContent = '❌ Solo se permiten imágenes PNG o JPG';
        inputImagen.value = ''; // limpia el input
    } else {
        errorImagen.textContent = '';
    }
});

form.addEventListener('submit', (e) => {
    const archivo = inputImagen.files[0];

    if (!archivo || !formatosPermitidos.includes(archivo.type)) {
        e.preventDefault();
        errorImagen.textContent = '❌ El archivo debe ser una imagen PNG o JPG';
    }
});