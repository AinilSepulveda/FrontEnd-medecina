import { Modal } from "bootstrap";
import { del, get, post, put } from "../api/apiClient.js";
import { renderAlertContainer, showError, showSuccess } from "../utils/alert.js";
import { setLoading } from "../utils/loading.js";

let medicos = [];
let medicoEditando = null;
let medicoModal = null;

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

  if (Array.isArray(respuesta?.medicos)) {
    return respuesta.medicos;
  }

  if (Array.isArray(respuesta?.data?.medicos)) {
    return respuesta.data.medicos;
  }

  return [];
}

function obtenerId(medico) {
  return medico?.id ?? medico?.idMedico ?? medico?._id;
}

function limpiarFormulario() {
  const form = document.querySelector("#medico-form");
  form?.reset();
  form?.classList.remove("was-validated");
  medicoEditando = null;
  document.querySelector("#medico-modal-title").textContent = "Crear medico";
}

function completarFormulario(medico) {
  document.querySelector("#medico-nombre").value = medico.nombre ?? "";
  document.querySelector("#medico-especialidad").value = medico.especialidad ?? "";
  document.querySelector("#medico-email").value = medico.email ?? "";
  document.querySelector("#medico-registro").value = medico.registroMedico ?? "";
}

function obtenerPayload() {
  return {
    nombre: document.querySelector("#medico-nombre").value.trim(),
    especialidad: document.querySelector("#medico-especialidad").value.trim(),
    email: document.querySelector("#medico-email").value.trim(),
    registroMedico: document.querySelector("#medico-registro").value.trim(),
  };
}

function renderFilas() {
  const tbody = document.querySelector("#medicos-tbody");

  if (!tbody) {
    return;
  }

  if (!medicos.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-secondary py-4">No hay medicos registrados.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = medicos
    .map((medico) => {
      const id = obtenerId(medico);

      return `
        <tr>
          <td>${escapeHtml(medico.nombre)}</td>
          <td>${escapeHtml(medico.especialidad)}</td>
          <td>${escapeHtml(medico.email)}</td>
          <td>${escapeHtml(medico.registroMedico)}</td>
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

async function cargarMedicos() {
  setLoading("#medicos-loading", "Cargando medicos");

  try {
    const respuesta = await get("/medicos");
    medicos = extraerLista(respuesta);
    renderFilas();
  } catch (error) {
    showError(error.message);
  } finally {
    const loading = document.querySelector("#medicos-loading");

    if (loading) {
      loading.innerHTML = "";
    }
  }
}

async function guardarMedico(event) {
  event.preventDefault();

  const form = event.currentTarget;
  form.classList.add("was-validated");

  if (!form.checkValidity()) {
    return;
  }

  const payload = obtenerPayload();
  const id = medicoEditando ? obtenerId(medicoEditando) : null;

  try {
    if (id) {
      await put(`/medicos/${encodeURIComponent(id)}`, payload);
      showSuccess("Medico actualizado correctamente.");
    } else {
      await post("/medicos", payload);
      showSuccess("Medico creado correctamente.");
    }

    medicoModal.hide();
    await cargarMedicos();
  } catch (error) {
    showError(error.message);
  }
}

async function eliminarMedico(id) {
  if (!id || !window.confirm("Deseas eliminar este medico?")) {
    return;
  }

  try {
    await del(`/medicos/${encodeURIComponent(id)}`);
    showSuccess("Medico eliminado correctamente.");
    await cargarMedicos();
  } catch (error) {
    showError(error.message);
  }
}

export function renderMedicosPage() {
  return `
    <main class="container-fluid app-shell py-4">
      <div class="page-toolbar mb-4">
        <div class="page-heading">
          <div class="page-icon">
            <i class="bi bi-person-badge"></i>
          </div>
          <div>
            <h1 class="h3 mb-1">Medicos</h1>
            <p class="text-secondary">Gestion de profesionales medicos.</p>
          </div>
        </div>
        <button id="nuevo-medico" type="button" class="btn btn-primary">
          <i class="bi bi-plus-lg me-1"></i>Nuevo medico
        </button>
      </div>

      ${renderAlertContainer()}
      <div id="medicos-loading"></div>

      <section class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Email</th>
                <th>Registro medico</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="medicos-tbody"></tbody>
          </table>
        </div>
      </section>

      <div class="modal fade" id="medico-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <form id="medico-form" class="modal-content" novalidate>
            <div class="modal-header">
              <h2 id="medico-modal-title" class="modal-title fs-5">Crear medico</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="medico-nombre" class="form-label">Nombre</label>
                <input id="medico-nombre" class="form-control" type="text" required />
                <div class="invalid-feedback">El nombre es requerido.</div>
              </div>
              <div class="mb-3">
                <label for="medico-especialidad" class="form-label">Especialidad</label>
                <input id="medico-especialidad" class="form-control" type="text" required />
                <div class="invalid-feedback">La especialidad es requerida.</div>
              </div>
              <div class="mb-3">
                <label for="medico-email" class="form-label">Email</label>
                <input id="medico-email" class="form-control" type="email" required />
                <div class="invalid-feedback">El email es requerido y debe ser valido.</div>
              </div>
              <div>
                <label for="medico-registro" class="form-label">Registro medico</label>
                <input id="medico-registro" class="form-control" type="text" required />
                <div class="invalid-feedback">El registro medico es requerido.</div>
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

export function setupMedicosPage() {
  const modalElement = document.querySelector("#medico-modal");
  medicoModal = Modal.getOrCreateInstance(modalElement);

  document.querySelector("#nuevo-medico")?.addEventListener("click", () => {
    limpiarFormulario();
    medicoModal.show();
  });

  document.querySelector("#medico-form")?.addEventListener("submit", guardarMedico);

  document.querySelector("#medicos-tbody")?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const medico = medicos.find((item) => String(obtenerId(item)) === String(id));

    if (button.dataset.action === "edit" && medico) {
      medicoEditando = medico;
      document.querySelector("#medico-modal-title").textContent = "Editar medico";
      completarFormulario(medico);
      medicoModal.show();
      return;
    }

    if (button.dataset.action === "delete") {
      eliminarMedico(id);
    }
  });

  cargarMedicos();
}
