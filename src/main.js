import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";
import { renderNavbar, setupNavbar } from "./components/navbar.js";
import { renderDashboardPage, setupDashboardPage } from "./pages/dashboardPage.js";
import { renderExamenesPage, setupExamenesPage } from "./pages/examenesPage.js";
import { renderLoginPage, setupLoginPage } from "./pages/loginPage.js";
import { renderMedicosPage, setupMedicosPage } from "./pages/medicosPage.js";
import { renderPacientesPage, setupPacientesPage } from "./pages/pacientesPage.js";
import { iniciarRouter, RUTAS } from "./utils/router.js";

const app = document.querySelector("#app");

const paginas = {
  [RUTAS.dashboard]: {
    render: renderDashboardPage,
    setup: setupDashboardPage,
  },
  [RUTAS.pacientes]: {
    render: renderPacientesPage,
    setup: setupPacientesPage,
  },
  [RUTAS.medicos]: {
    render: renderMedicosPage,
    setup: setupMedicosPage,
  },
  [RUTAS.examenes]: {
    render: renderExamenesPage,
    setup: setupExamenesPage,
  },
};

function renderizarRuta(ruta) {
  if (ruta === RUTAS.login) {
    app.innerHTML = renderLoginPage();
    setupLoginPage();
    return;
  }

  const pagina = paginas[ruta] || paginas[RUTAS.dashboard];

  app.innerHTML = `
    ${renderNavbar(ruta)}
    ${pagina.render()}
  `;
  setupNavbar();
  pagina.setup();
}

iniciarRouter(renderizarRuta);
