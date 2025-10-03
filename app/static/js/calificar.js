let equipos = [];

async function cargarEquipos() {
  const res = await fetch('/api/equipos');
  equipos = await res.json();
  renderTabla();
  console.log("actualizando");
}

function renderTabla() {
  const tbody = document.getElementById('tabla-equipos');
  tbody.innerHTML = '';

  equipos.forEach((eq, index) => {
    const total = (
      (eq.areas?.rally || 0) +
      (eq.areas?.memoria || 0) +
      (eq.areas?.cartas || 0) +
      (eq.areas?.declaracion || 0)
    );

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${eq.nombre}</strong></td>
      <td><input type="number" class="form-control text-center" min="0" max="25" id="rally-${index}" value="${eq.areas?.rally || 0}"></td>
      <td><input type="number" class="form-control text-center" min="0" max="25" id="memoria-${index}" value="${eq.areas?.memoria || 0}"></td>
      <td><input type="number" class="form-control text-center" min="0" max="25" id="cartas-${index}" value="${eq.areas?.cartas || 0}"></td>
      <td><input type="number" class="form-control text-center" min="0" max="25" id="declaracion-${index}" value="${eq.areas?.declaracion || 0}"></td>
      <td id="total-${index}"><strong>${total}</strong></td>
      <td><button class="btn btn-success btn-sm" onclick="guardarEquipo(${index})">💾 Guardar</button></td>
    `;

    tbody.appendChild(tr);

    // Agregar listener para actualizar total y validaciones en tiempo real
    ['rally', 'memoria', 'cartas', 'declaracion'].forEach(cat => {
      document.getElementById(`${cat}-${index}`).addEventListener('input', () => actualizarTotal(index));
    });
  });
}

function actualizarTotal(index) {
  const getVal = (cat) => {
    const input = document.getElementById(`${cat}-${index}`);
    const val = parseInt(input.value) || 0;
    // Validar máximo 25 y añadir clase is-invalid
    if (val > 25) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
    return val;
  };

  const r = getVal('rally');
  const m = getVal('memoria');
  const c = getVal('cartas');
  const d = getVal('declaracion');

  const total = r + m + c + d;
  const totalCell = document.getElementById(`total-${index}`);
  totalCell.textContent = total;

  // Si total > 100, marcar en rojo
  if (total > 100) {
    totalCell.classList.add('text-danger');
  } else {
    totalCell.classList.remove('text-danger');
  }
}

async function guardarEquipo(index) {
  const eq = equipos[index];

  const r = parseInt(document.getElementById(`rally-${index}`).value) || 0;
  const m = parseInt(document.getElementById(`memoria-${index}`).value) || 0;
  const c = parseInt(document.getElementById(`cartas-${index}`).value) || 0;
  const d = parseInt(document.getElementById(`declaracion-${index}`).value) || 0;

  if ([r, m, c, d].some(val => val > 25)) {
    alert("❌ Cada calificación debe ser como máximo 25 puntos.");
    return;
  }

  const total = r + m + c + d;
  if (total > 100) {
    alert("❌ La suma de las calificaciones no puede superar 100 puntos.");
    return;
  }

  const datos = {
    areas: { rally: r, memoria: m, cartas: c, declaracion: d }
  };

  const res = await fetch(`/api/equipos/${eq.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });

  if (res.ok) {
    alert(`✅ Calificaciones actualizadas para ${eq.nombre}`);
    cargarEquipos();
  } else {
    alert('❌ Error al guardar calificaciones.');
  }
}

cargarEquipos();
