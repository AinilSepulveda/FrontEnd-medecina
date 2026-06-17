export function renderAlertContainer() {
  return `<div id="alert-container" class="mb-3"></div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function clearAlert(containerSelector = "#alert-container") {
  const container = document.querySelector(containerSelector);

  if (container) {
    container.innerHTML = "";
  }
}

export function showAlert(message, type = "success", containerSelector = "#alert-container") {
  const container = document.querySelector(containerSelector);

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
}

export function showSuccess(message) {
  showAlert(message, "success");
}

export function showError(message) {
  showAlert(message, "danger");
}
