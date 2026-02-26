document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('modal');
    const btnNuevo = document.getElementById('btnNuevo');
    const btnCancelar = document.getElementById('btnCancelar');
    const form = document.getElementById('formPersonal');

    // 🔎 Verificación REAL
    console.log('btnNuevo:', btnNuevo);
    console.log('modal:', modal);

    function abrirModal() {
        form.reset();
        document.getElementById('id').value = '';
        modal.classList.add('activo');
    }

    function cerrarModal() {
        modal.classList.remove('activo');
    }

    btnNuevo.addEventListener('click', abrirModal);
    btnCancelar.addEventListener('click', cerrarModal);

});