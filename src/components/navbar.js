import { cerrarSesion } from "../utils/auth.js";
import { RUTAS } from "../utils/router.js";

const enlaces = [
  { href: RUTAS.dashboard, icon: "bi-speedometer2", label: "Dashboard" },
  { href: RUTAS.pacientes, icon: "bi-people", label: "Pacientes" },
  { href: RUTAS.medicos, icon: "bi-person-badge", label: "Medicos" },
  { href: RUTAS.examenes, icon: "bi-clipboard2-pulse", label: "Examenes" },
];

function estaActivo(href, rutaActual) {
  return href === rutaActual ? "active" : "";
}

export function renderNavbar(rutaActual) {
  const links = enlaces
    .map(
      (enlace) => `
        <li class="nav-item">
          <a class="nav-link ${estaActivo(enlace.href, rutaActual)}" href="${enlace.href}" data-link>
            <i class="bi ${enlace.icon} me-1"></i>${enlace.label}
          </a>
        </li>
      `,
    )
    .join("");

  return `
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container-fluid app-shell">
        <a class="navbar-brand fw-semibold" href="${RUTAS.dashboard}" data-link>
          <i class="bi bi-heart-pulse-fill text-primary me-2"></i>Clinica
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#app-navbar"
          aria-controls="app-navbar"
          aria-expanded="false"
          aria-label="Abrir menu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="app-navbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${links}
          </ul>
          <button id="logout-button" type="button" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-box-arrow-right me-1"></i>Cerrar sesion
          </button>
        </div>
      </div>
    </nav>
  `;
}

export function setupNavbar() {
  document.querySelector("#logout-button")?.addEventListener("click", () => {
    cerrarSesion();
  });
}
