document.addEventListener('DOMContentLoaded', () => {
  cargarEquipos();

  document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/equipos', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        alert('Error: ' + (error.error || 'No se pudo registrar el equipo.'));
        return;
      }

      const equipo = await res.json();
      alert(`✅ Equipo "${equipo.nombre}" registrado.`);
      form.reset();
      cargarEquipos();
    } catch (err) {
      alert('Error en la comunicación con el servidor.');
      console.error(err);
    }
  });
});

async function cargarEquipos() {
  try {
    const res = await fetch('/api/equipos');
    if (!res.ok) throw new Error('No se pudo obtener la lista.');

    const equipos = await res.json();
    const tbody = document.getElementById('tabla-equipos');
    tbody.innerHTML = '';

    if (equipos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No hay equipos registrados.</td></tr>';
      return;
    }

    equipos.forEach(eq => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${eq.imagen || 'https://via.placeholder.com/80'}" alt="Foto ${eq.nombre}" class="team-img" /></td>
        <td>${eq.nombre}</td>
        <td>
        <button class="btn btn-warning btn-sm me-2" onclick="editarEquipo('${eq.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarEquipo('${eq.id}')">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    alert('Error cargando equipos.');
    console.error(err);
  }
}
async function eliminarEquipo(id) {
  if (!confirm("¿Seguro quieres eliminar este equipo?")) return;

  const res = await fetch(`/api/equipos/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    alert('Equipo eliminado');
    cargarEquipos();  // recarga la lista
  } else {
    alert('Error al eliminar equipo');
  }
}
async function editarEquipo(id) {
  const nuevoNombre = prompt("Nuevo nombre del equipo:");
  if (!nuevoNombre) return;

  const formData = new FormData();
  formData.append('nombre', nuevoNombre);

  // Opcional: pedir foto nueva (puedes implementar un input file para subir)
  // formData.append('imagen', archivo);

  const res = await fetch(`/api/equipos/${id}`, {
    method: 'PUT',
    body: formData
  });

  if (res.ok) {
    alert('Equipo actualizado');
    cargarEquipos();
  } else {
    alert('Error al actualizar equipo');
  }
}
