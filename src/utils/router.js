import { estaAutenticado } from "./auth.js";

export const RUTAS = {
  login: "/login",
  dashboard: "/dashboard",
  pacientes: "/pacientes",
  medicos: "/medicos",
  examenes: "/examenes",
};

const rutasPrivadas = [
  RUTAS.dashboard,
  RUTAS.pacientes,
  RUTAS.medicos,
  RUTAS.examenes,
];

function normalizarRuta(path = window.location.pathname) {
  const ruta = path.replace(/\/$/, "");
  return ruta || RUTAS.dashboard;
}

function resolverRuta(path) {
  const ruta = normalizarRuta(path);
  const autenticado = estaAutenticado();

  if (!autenticado && ruta !== RUTAS.login) {
    return RUTAS.login;
  }

  if (autenticado && ruta === RUTAS.login) {
    return RUTAS.dashboard;
  }

  if (ruta !== RUTAS.login && !rutasPrivadas.includes(ruta)) {
    return autenticado ? RUTAS.dashboard : RUTAS.login;
  }

  return ruta;
}

export function navegar(path, { reemplazar = false } = {}) {
  const ruta = resolverRuta(path);

  if (reemplazar) {
    window.history.replaceState({}, "", ruta);
  } else {
    window.history.pushState({}, "", ruta);
  }

  window.dispatchEvent(new CustomEvent("routechange", { detail: { path: ruta } }));
  return ruta;
}

export function obtenerRutaActual() {
  return resolverRuta(window.location.pathname);
}

export function protegerRuta() {
  const ruta = resolverRuta(window.location.pathname);

  if (ruta !== window.location.pathname) {
    window.history.replaceState({}, "", ruta);
  }

  return ruta;
}

export function esRutaPrivada(ruta) {
  return rutasPrivadas.includes(normalizarRuta(ruta));
}

export function iniciarRouter(renderizarRuta) {
  const renderizar = () => {
    const ruta = protegerRuta();
    renderizarRuta?.(ruta);
  };

  document.addEventListener("click", (event) => {
    const enlace = event.target.closest("a[data-link]");

    if (!enlace) {
      return;
    }

    event.preventDefault();
    navegar(enlace.getAttribute("href"));
  });

  window.addEventListener("popstate", renderizar);
  window.addEventListener("routechange", renderizar);

  renderizar();
}
