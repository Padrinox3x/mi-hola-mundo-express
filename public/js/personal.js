document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('modal');
    const btnNuevo = document.getElementById('btnNuevo');
    const btnCancelar = document.getElementById('btnCancelar');
    const form = document.getElementById('formPersonal');
    const tabla = document.getElementById('tablaPersonal');

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

    /* =======================
       CARGAR TABLA
    ======================= */
    async function cargarPersonal() {
        try {
            const res = await fetch('/api/personal');
            const result = await res.json();

            tabla.innerHTML = '';

            result.data.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.Nombre}</td>
                    <td>${p.Appaterno}</td>
                    <td>${p.Apmaterno}</td>
                    <td>${p.Nempleado}</td>
                    <td>
                        <button onclick="eliminar(${p.Id})">🗑</button>
                    </td>
                `;
                tabla.appendChild(tr);
            });

        } catch (error) {
            console.error('Error al cargar personal:', error);
        }
    }

    /* =======================
       GUARDAR
    ======================= */
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.ok) {
                alert('✅ Personal guardado');
                cerrarModal();
                cargarPersonal(); // 🔥 AHORA SÍ FUNCIONA
            } else {
                alert('❌ Error al guardar');
            }

        } catch (err) {
            console.error(err);
            alert('❌ Error de servidor');
        }
    });

    // 🚀 Cargar al iniciar
    cargarPersonal();
});