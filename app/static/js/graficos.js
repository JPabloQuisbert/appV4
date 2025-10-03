async function cargarGraficos() {
  const res = await fetch('/api/equipos');
  const equipos = await res.json();
  const contenedor = document.getElementById('contenedor-graficos');

  equipos.forEach((equipo, index) => {
    const { rally = 0, memoria = 0, cartas = 0, declaracion = 0 } = equipo.areas || {};
    const total = rally + memoria + cartas + declaracion;

    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';

    // Usamos la imagen si existe
    const fondo = equipo.imagen
      ? `style="background-image: url('${equipo.imagen}'); background-size: cover; background-position: center; position: relative;"`
      : '';

    // Fondo semitransparente para mejor legibilidad
    const overlayStyle = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.76);
      z-index: 1;
    `;

    col.innerHTML = `
  <div class="card shadow-sm text-center position-relative p-3">
    <div class="card-header bg-primary text-white">
      <h5 class="mb-0">${equipo.nombre}</h5>
    </div>
    <div class="mt-3">
      <img src="${equipo.imagen || 'https://via.placeholder.com/150'}" alt="${equipo.nombre}" 
           style="max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 8px;">
    </div>
    <div class="card-body">
      <canvas id="radar-${index}" width="300" height="300"></canvas>
      <div class="mt-3">
        <span class="badge bg-secondary fs-6">Total: ${total} pts</span>
      </div>
    </div>
  </div>
`;

    contenedor.appendChild(col);

    const ctx = document.getElementById(`radar-${index}`).getContext('2d');

    const data = [rally, memoria, cartas, declaracion];

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Rally Bíblico',
          'Memoria Bíblica',
          'Cartas Carcelarias',
          'Declaración de Fe'
        ],
        datasets: [{
          label: equipo.nombre,
          data: data,
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 25,
            ticks: {
              stepSize: 5
            }
          }
        },
        plugins: {
          legend: { display: false },
          title: { display: false }
        }
      }
    });
  });
}
cargarGraficos();
