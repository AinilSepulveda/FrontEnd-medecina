import { get } from "../api/apiClient.js";
import { renderAlertContainer, showError } from "../utils/alert.js";
import { setLoading } from "../utils/loading.js";

const accesos = [
  {
    href: "/pacientes",
    icon: "bi-people",
    title: "Pacientes",
    text: "Listar, crear, editar y eliminar pacientes.",
  },
  {
    href: "/medicos",
    icon: "bi-person-badge",
    title: "Medicos",
    text: "Administrar profesionales y especialidades.",
  },
  {
    href: "/examenes",
    icon: "bi-file-earmark-pdf",
    title: "Examenes",
    text: "Subir PDFs y revisar archivos cargados.",
  },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderApiInfo(data) {
  if (!data || typeof data !== "object") {
    return `<p class="text-secondary mb-0">No se recibio informacion de la API.</p>`;
  }

  return `
    <dl class="row mb-0">
      ${Object.entries(data)
        .map(
          ([key, value]) => `
            <dt class="col-sm-4 text-secondary">${escapeHtml(key)}</dt>
            <dd class="col-sm-8">${renderValue(value)}</dd>
          `,
        )
        .join("")}
    </dl>
  `;
}

function renderValue(value) {
  if (Array.isArray(value)) {
    return renderList(value);
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(
        ([key, items]) => `
          <div class="mb-2">
            <div class="fw-semibold text-capitalize mb-1">${escapeHtml(key)}</div>
            ${Array.isArray(items) ? renderList(items) : `<span>${escapeHtml(JSON.stringify(items))}</span>`}
          </div>
        `,
      )
      .join("");
  }

  return escapeHtml(value);
}

function renderList(items) {
  return `
    <ul class="list-group list-group-flush api-route-list">
      ${items
        .map((item) => `<li class="list-group-item px-0 py-1">${escapeHtml(item)}</li>`)
        .join("")}
    </ul>
  `;
}

export function renderDashboardPage() {
  return `
    <main class="container-fluid app-shell py-4">
      <div class="page-heading mb-4">
        <div class="page-icon">
          <i class="bi bi-speedometer2"></i>
        </div>
        <div>
          <h1 class="h3 mb-1">Dashboard</h1>
          <p class="text-secondary">Informacion general del backend local.</p>
        </div>
      </div>

      ${renderAlertContainer()}

      <section class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h2 class="h5 mb-3">API</h2>
          <div id="api-info"></div>
        </div>
      </section>

      <section class="row g-3">
        ${accesos
          .map(
            (acceso) => `
              <div class="col-12 col-md-4">
                <a class="module-link card h-100 border-0 shadow-sm text-decoration-none" href="${acceso.href}" data-link>
                  <div class="card-body">
                    <div class="page-icon mb-3">
                      <i class="bi ${acceso.icon}"></i>
                    </div>
                    <h2 class="h5 text-body mb-2">${acceso.title}</h2>
                    <p class="text-secondary mb-0">${acceso.text}</p>
                  </div>
                </a>
              </div>
            `,
          )
          .join("")}
      </section>
    </main>
  `;
}

export async function setupDashboardPage() {
  setLoading("#api-info", "Consultando /acerca");

  try {
    const data = await get("/acerca");
    const container = document.querySelector("#api-info");

    if (container) {
      container.innerHTML = renderApiInfo(data?.data ?? data);
    }
  } catch (error) {
    showError(error.message);
    const container = document.querySelector("#api-info");

    if (container) {
      container.innerHTML = `<p class="text-secondary mb-0">No fue posible cargar /acerca.</p>`;
    }
  }
}
