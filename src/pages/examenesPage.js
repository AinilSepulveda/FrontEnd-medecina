import { get, upload } from "../api/apiClient.js";
import { renderAlertContainer, showError, showSuccess } from "../utils/alert.js";
import { setLoading } from "../utils/loading.js";

let examenes = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.data)) {
    return respuesta.data;
  }

  if (Array.isArray(respuesta?.examenes)) {
    return respuesta.examenes;
  }

  if (Array.isArray(respuesta?.data?.examenes)) {
    return respuesta.data.examenes;
  }

  return [];
}

function obtenerNombreArchivo(examen) {
  return examen?.nombre || examen?.filename || examen?.archivo || examen?.originalname || "Archivo PDF";
}

function obtenerFecha(examen) {
  return examen?.createdAt || examen?.fecha || examen?.fechaSubida || "-";
}

function renderFilas() {
  const tbody = document.querySelector("#examenes-tbody");

  if (!tbody) {
    return;
  }

  if (!examenes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-secondary py-4">No hay examenes subidos.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = examenes
    .map(
      (examen) => `
        <tr>
          <td><i class="bi bi-file-earmark-pdf text-danger me-2"></i>${escapeHtml(obtenerNombreArchivo(examen))}</td>
          <td>${escapeHtml(obtenerFecha(examen))}</td>
          <td>${escapeHtml(examen?.mimeType || examen?.tipo || "PDF")}</td>
        </tr>
      `,
    )
    .join("");
}

async function cargarExamenes() {
  setLoading("#examenes-loading", "Cargando examenes");

  try {
    const respuesta = await get("/examenes");
    examenes = extraerLista(respuesta);
    renderFilas();
  } catch (error) {
    showError(error.message);
  } finally {
    const loading = document.querySelector("#examenes-loading");

    if (loading) {
      loading.innerHTML = "";
    }
  }
}

function validarPdf(file) {
  return file && file.name.toLowerCase().endsWith(".pdf");
}

async function subirExamen(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const input = document.querySelector("#archivo");
  const file = input.files?.[0];

  form.classList.add("was-validated");

  if (!validarPdf(file)) {
    input.setCustomValidity("Solo se permiten archivos PDF.");
    showError("Selecciona un archivo con extension .pdf.");
    return;
  }

  input.setCustomValidity("");

  const formData = new FormData();
  formData.append("archivo", file);

  const submitButton = document.querySelector("#subir-examen");
  submitButton.disabled = true;

  try {
    await upload("/examenes", formData);
    showSuccess("Examen subido correctamente.");
    form.reset();
    form.classList.remove("was-validated");
    await cargarExamenes();
  } catch (error) {
    showError(error.message);
  } finally {
    submitButton.disabled = false;
  }
}

export function renderExamenesPage() {
  return `
    <main class="container-fluid app-shell py-4">
      <div class="page-heading mb-4">
        <div class="page-icon">
          <i class="bi bi-clipboard2-pulse"></i>
        </div>
        <div>
          <h1 class="h3 mb-1">Examenes</h1>
          <p class="text-secondary">Subida y listado de archivos PDF.</p>
        </div>
      </div>

      ${renderAlertContainer()}

      <section class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <form id="examen-form" class="row g-3 align-items-end" novalidate>
            <div class="col-12 col-md">
              <label for="archivo" class="form-label">Archivo PDF</label>
              <input id="archivo" name="archivo" class="form-control" type="file" accept=".pdf,application/pdf" required />
              <div class="invalid-feedback">Selecciona un archivo PDF valido.</div>
            </div>
            <div class="col-12 col-md-auto">
              <button id="subir-examen" type="submit" class="btn btn-primary w-100">
                <i class="bi bi-upload me-1"></i>Subir
              </button>
            </div>
          </form>
        </div>
      </section>

      <div id="examenes-loading"></div>

      <section class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Fecha</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody id="examenes-tbody"></tbody>
          </table>
        </div>
      </section>
    </main>
  `;
}

export function setupExamenesPage() {
  document.querySelector("#archivo")?.addEventListener("change", (event) => {
    event.currentTarget.setCustomValidity("");
  });
  document.querySelector("#examen-form")?.addEventListener("submit", subirExamen);
  cargarExamenes();
}
