export function renderLoading(message = "Cargando") {
  return `
    <div class="loading-state text-secondary py-4">
      <div class="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>
      <span>${message}</span>
    </div>
  `;
}

export function setLoading(containerSelector, message = "Cargando") {
  const container = document.querySelector(containerSelector);

  if (container) {
    container.innerHTML = renderLoading(message);
  }
}

export function clearLoading(containerSelector) {
  const container = document.querySelector(containerSelector);

  if (container) {
    container.innerHTML = "";
  }
}
