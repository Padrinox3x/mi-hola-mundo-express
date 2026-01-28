document.addEventListener('DOMContentLoaded', () => {
    fetch('/breadcrumbs.html') // 👈 SIN /public
        .then(res => {
            if (!res.ok) throw new Error('No se pudo cargar el breadcrumb');
            return res.text();
        })
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);
            const current = document.getElementById('breadcrumb-current');
            if (current) {
                current.textContent = document.title;
            }
        })
        .catch(err => console.error(err));
});
