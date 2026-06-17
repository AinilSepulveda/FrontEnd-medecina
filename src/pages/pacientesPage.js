import { Modal } from "bootstrap";
import { del, get, post, put } from "../api/apiClient.js";
import { renderAlertContainer, showError, showSuccess } from "../utils/alert.js";
import { setLoading } from "../utils/loading.js";

let pacientes = [];
let pacienteEditando = null;
let pacienteModal = null;

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

  if (Array.isArray(respuesta?.pacientes)) {
    return respuesta.pacientes;
  }

  if (Array.isArray(respuesta?.data?.pacientes)) {
    return respuesta.data.pacientes;
  }

  return [];
}

function obtenerId(paciente) {
  return paciente?.id ?? paciente?.idPaciente ?? paciente?._id;
}

function limpiarFormulario() {
  const form = document.querySelector("#paciente-form");
  form?.reset();
  form?.classList.remove("was-validated");
  pacienteEditando = null;
  document.querySelector("#paciente-modal-title").textContent = "Crear paciente";
}

function completarFormulario(paciente) {
  document.querySelector("#paciente-nombre").value = paciente.nombre ?? "";
  document.querySelector("#paciente-rut").value = paciente.rut ?? "";
  document.querySelector("#paciente-edad").value = paciente.edad ?? "";
  document.querySelector("#paciente-diagnostico").value = paciente.diagnostico ?? "";
  document.querySelector("#paciente-email").value = paciente.email ?? "";
}

function obtenerPayload() {
  const email = document.querySelector("#paciente-email").value.trim();

  return {
    nombre: document.querySelector("#paciente-nombre").value.trim(),
    rut: document.querySelector("#paciente-rut").value.trim(),
    edad: Number(document.querySelector("#paciente-edad").value),
    diagnostico: document.querySelector("#paciente-diagnostico").value.trim(),
    ...(email ? { email } : {}),
  };
}

function renderFilas() {
  const tbody = document.querySelector("#pacientes-tbody");

  if (!tbody) {
    return;
  }

  if (!pacientes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-secondary py-4">No hay pacientes registrados.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pacientes
    .map((paciente) => {
      const id = obtenerId(paciente);

      return `
        <tr>
          <td>${escapeHtml(paciente.nombre)}</td>
          <td>${escapeHtml(paciente.rut)}</td>
          <td>${escapeHtml(paciente.edad)}</td>
          <td>${escapeHtml(paciente.diagnostico)}</td>
          <td>${escapeHtml(paciente.email || "-")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-1" type="button" data-action="edit" data-id="${escapeHtml(id)}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-id="${escapeHtml(id)}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function cargarPacientes() {
  setLoading("#pacientes-loading", "Cargando pacientes");

  try {
    const respuesta = await get("/pacientes");
    pacientes = extraerLista(respuesta);
    renderFilas();
  } catch (error) {
    showError(error.message);
  } finally {
    const loading = document.querySelector("#pacientes-loading");

    if (loading) {
      loading.innerHTML = "";
    }
  }
}

async function guardarPaciente(event) {
  event.preventDefault();

  const form = event.currentTarget;
  form.classList.add("was-validated");

  if (!form.checkValidity()) {
    return;
  }

  const payload = obtenerPayload();
  const id = pacienteEditando ? obtenerId(pacienteEditando) : null;

  try {
    if (id) {
      await put(`/pacientes/${encodeURIComponent(id)}`, payload);
      showSuccess("Paciente actualizado correctamente.");
    } else {
      await post("/pacientes", payload);
      showSuccess("Paciente creado correctamente.");
    }

    pacienteModal.hide();
    await cargarPacientes();
  } catch (error) {
    showError(error.message);
  }
}

async function eliminarPaciente(id) {
  if (!id || !window.confirm("Deseas eliminar este paciente?")) {
    return;
  }

  try {
    await del(`/pacientes/${encodeURIComponent(id)}`);
    showSuccess("Paciente eliminado correctamente.");
    await cargarPacientes();
  } catch (error) {
    showError(error.message);
  }
}

export function renderPacientesPage() {
  return `
    <main class="container-fluid app-shell py-4">
      <div class="page-toolbar mb-4">
        <div class="page-heading">
          <div class="page-icon">
            <i class="bi bi-people"></i>
          </div>
          <div>
            <h1 class="h3 mb-1">Pacientes</h1>
            <p class="text-secondary">Gestion de pacientes registrados.</p>
          </div>
        </div>
        <button id="nuevo-paciente" type="button" class="btn btn-primary">
          <i class="bi bi-plus-lg me-1"></i>Nuevo paciente
        </button>
      </div>

      ${renderAlertContainer()}
      <div id="pacientes-loading"></div>

      <section class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Edad</th>
                <th>Diagnostico</th>
                <th>Email</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="pacientes-tbody"></tbody>
          </table>
        </div>
      </section>

      <div class="modal fade" id="paciente-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <form id="paciente-form" class="modal-content" novalidate>
            <div class="modal-header">
              <h2 id="paciente-modal-title" class="modal-title fs-5">Crear paciente</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="paciente-nombre" class="form-label">Nombre</label>
                <input id="paciente-nombre" class="form-control" type="text" required />
                <div class="invalid-feedback">El nombre es requerido.</div>
              </div>
              <div class="mb-3">
                <label for="paciente-rut" class="form-label">RUT</label>
                <input id="paciente-rut" class="form-control" type="text" required />
                <div class="invalid-feedback">El RUT es requerido.</div>
              </div>
              <div class="mb-3">
                <label for="paciente-edad" class="form-label">Edad</label>
                <input id="paciente-edad" class="form-control" type="number" min="0" step="1" required />
                <div class="invalid-feedback">La edad es requerida y debe ser numerica.</div>
              </div>
              <div class="mb-3">
                <label for="paciente-diagnostico" class="form-label">Diagnostico</label>
                <textarea id="paciente-diagnostico" class="form-control" rows="3" required></textarea>
                <div class="invalid-feedback">El diagnostico es requerido.</div>
              </div>
              <div>
                <label for="paciente-email" class="form-label">Email</label>
                <input id="paciente-email" class="form-control" type="email" />
                <div class="invalid-feedback">Ingresa un email valido.</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  `;
}

export function setupPacientesPage() {
  const modalElement = document.querySelector("#paciente-modal");
  pacienteModal = Modal.getOrCreateInstance(modalElement);

  document.querySelector("#nuevo-paciente")?.addEventListener("click", () => {
    limpiarFormulario();
    pacienteModal.show();
  });

  document.querySelector("#paciente-form")?.addEventListener("submit", guardarPaciente);

  document.querySelector("#pacientes-tbody")?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const paciente = pacientes.find((item) => String(obtenerId(item)) === String(id));

    if (button.dataset.action === "edit" && paciente) {
      pacienteEditando = paciente;
      document.querySelector("#paciente-modal-title").textContent = "Editar paciente";
      completarFormulario(paciente);
      pacienteModal.show();
      return;
    }

    if (button.dataset.action === "delete") {
      eliminarPaciente(id);
    }
  });

  cargarPacientes();
}
