document.addEventListener('DOMContentLoaded', () => {
    fetch('/public/partials/breadcrumbs.html')
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);

            // Usa el title de la página como breadcrumb activo
            const current = document.getElementById('breadcrumb-current');
            if (current) {
                current.textContent = document.title;
            }
        })
        .catch(err => console.error('Error cargando breadcrumbs:', err));
});
