document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('modal');
    const btnNuevo = document.getElementById('btnNuevo');
    const btnCancelar = document.getElementById('btnCancelar');
    const form = document.getElementById('formPersonal');
    const tabla = document.getElementById('tablaPersonal');

    function abrirModal() {
        modal.classList.add('activo');
    }

    function cerrarModal() {
        modal.classList.remove('activo');
    }

    btnNuevo.addEventListener('click', () => {
        form.reset();
        document.getElementById('id').value = '';
        abrirModal();
    });

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
                        <button class="editar">✏️</button>
                        <button class="eliminar">🗑</button>
                    </td>
                `;

                // ✏️ EDITAR
                tr.querySelector('.editar').addEventListener('click', () => {
                    document.getElementById('id').value = p.Id;
                    document.getElementById('Nombre').value = p.Nombre;
                    document.getElementById('Appaterno').value = p.Appaterno;
                    document.getElementById('Apmaterno').value = p.Apmaterno;
                    document.getElementById('Nempleado').value = p.Nempleado;
                    abrirModal();
                });

                // 🗑 ELIMINAR
                tr.querySelector('.eliminar').addEventListener('click', async () => {
                    if (!confirm('¿Eliminar este registro?')) return;
                    await fetch(`/api/personal/${p.Id}`, { method: 'DELETE' });
                    cargarPersonal();
                });

                tabla.appendChild(tr);
            });

        } catch (error) {
            console.error('Error al cargar personal:', error);
        }
    }

    /* =======================
       GUARDAR / EDITAR
    ======================= */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('id').value;

        const data = {
            Nombre: document.getElementById('Nombre').value.trim(),
            Appaterno: document.getElementById('Appaterno').value.trim(),
            Apmaterno: document.getElementById('Apmaterno').value.trim(),
            Nempleado: document.getElementById('Nempleado').value.trim()
        };

        const url = id ? `/api/personal/${id}` : '/api/personal';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.ok) {
                cerrarModal();
                cargarPersonal();
            } else {
                alert('❌ Error al guardar');
            }

        } catch (err) {
            console.error(err);
            alert('❌ Error de servidor');
        }
    });

    // 🚀 Inicial
    cargarPersonal();
});