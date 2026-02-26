let page = 1;

const cargar = async () => {
    const buscar = buscarInput.value;
    const limit = limitSelect.value;

    const res = await fetch(`/api/personal?buscar=${buscar}&page=${page}&limit=${limit}`);
    const json = await res.json();

    tabla.innerHTML = '';
    json.data.forEach(p => {
        tabla.innerHTML += `
        <tr>
            <td>${p.Nombre}</td>
            <td>${p.Appaterno}</td>
            <td>${p.Apmaterno}</td>
            <td>${p.Nempleado}</td>
            <td>
                <button onclick="editar(${p.Id},'${p.Nombre}','${p.Appaterno}','${p.Apmaterno}','${p.Nempleado}')">✏</button>
                <button onclick="eliminar(${p.Id})">🗑</button>
            </td>
        </tr>`;
    });

    pagina.textContent = `Página ${page}`;
};

formPersonal.onsubmit = async e => {
    e.preventDefault();

    const data = {
        Nombre: Nombre.value,
        Appaterno: Appaterno.value,
        Apmaterno: Apmaterno.value,
        Nempleado: Nempleado.value
    };

    const id = document.getElementById('id').value;

    await fetch(`/api/personal${id ? '/' + id : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    cerrarModal();
    cargar();
};

const eliminar = async id => {
    if (!confirm('¿Eliminar registro?')) return;
    await fetch(`/api/personal/${id}`, { method: 'DELETE' });
    cargar();
};

btnNuevo.onclick = () => abrirModal();

prev.onclick = () => { if (page > 1) page--; cargar(); };
next.onclick = () => { page++; cargar(); };

buscarInput.onkeyup = () => { page = 1; cargar(); };
limitSelect.onchange = () => { page = 1; cargar(); };

cargar();