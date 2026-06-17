const pageConfig = {
  "/dashboard": {
    icon: "bi-speedometer2",
    title: "Dashboard",
    subtitle: "Resumen general de actividad clinica.",
    items: ["Pacientes activos", "Medicos disponibles", "Examenes pendientes"],
  },
  "/pacientes": {
    icon: "bi-people",
    title: "Pacientes",
    subtitle: "Gestion de pacientes registrados.",
    items: ["Listado de pacientes", "Ficha clinica", "Contacto"],
  },
  "/medicos": {
    icon: "bi-person-badge",
    title: "Medicos",
    subtitle: "Gestion de profesionales medicos.",
    items: ["Especialidades", "Horarios", "Disponibilidad"],
  },
  "/examenes": {
    icon: "bi-clipboard2-pulse",
    title: "Examenes",
    subtitle: "Gestion de examenes y resultados.",
    items: ["Ordenes", "Resultados", "Seguimiento"],
  },
};

export function renderPrivatePage(ruta) {
  const pagina = pageConfig[ruta] || pageConfig["/dashboard"];

  return `
    <main class="container-fluid app-shell py-4">
      <div class="page-heading mb-4">
        <div class="page-icon">
          <i class="bi ${pagina.icon}"></i>
        </div>
        <div>
          <h1 class="h3 mb-1">${pagina.title}</h1>
          <p class="text-secondary">${pagina.subtitle}</p>
        </div>
      </div>

      <section class="row g-3">
        ${pagina.items
          .map(
            (item) => `
              <div class="col-12 col-md-4">
                <article class="card h-100 shadow-sm border-0">
                  <div class="card-body">
                    <h2 class="h6 mb-2">${item}</h2>
                    <p class="text-secondary small mb-0">Modulo preparado para consumir el backend local.</p>
                  </div>
                </article>
              </div>
            `,
          )
          .join("")}
      </section>
    </main>
  `;
}
