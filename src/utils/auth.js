const TOKEN_KEY = "token";

export function guardarToken(token) {
  if (!token) {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function eliminarToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function estaAutenticado() {
  return Boolean(obtenerToken());
}

export function verificarSesionActiva() {
  return estaAutenticado();
}

export function cerrarSesion({ redirigir = true } = {}) {
  eliminarToken();

  if (redirigir && window.location.pathname !== "/login") {
    window.history.replaceState({}, "", "/login");
    window.dispatchEvent(new CustomEvent("routechange", { detail: { path: "/login" } }));
  }
}
