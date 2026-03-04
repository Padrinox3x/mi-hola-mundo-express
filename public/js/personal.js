document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('modal');
    const btnNuevo = document.getElementById('btnNuevo');
    const btnCancelar = document.getElementById('btnCancelar');
    const form = document.getElementById('formPersonal');

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

    // 🔥 GUARDAR EN BD
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            Nombre: document.getElementById('Nombre').value.trim(),
            Appaterno: document.getElementById('Appaterno').value.trim(),
            Apmaterno: document.getElementById('Apmaterno').value.trim(),
            Nempleado: document.getElementById('Nempleado').value.trim()
        };

        try {
            const res = await fetch('/api/personal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.ok) {
                alert('✅ Personal guardado');
                cerrarModal();
                cargarPersonal(); // opcional si luego listamos
            } else {
                alert('❌ Error al guardar');
            }

        } catch (err) {
            console.error(err);
            alert('❌ Error de servidor');
        }
    });

});