import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";
import { renderNavbar, setupNavbar } from "./components/navbar.js";
import { renderLoginPage, setupLoginPage } from "./pages/loginPage.js";
import { renderPrivatePage } from "./pages/privatePages.js";
import { iniciarRouter, RUTAS } from "./utils/router.js";

const app = document.querySelector("#app");

function renderizarRuta(ruta) {
  if (ruta === RUTAS.login) {
    app.innerHTML = renderLoginPage();
    setupLoginPage();
    return;
  }

  app.innerHTML = `
    ${renderNavbar(ruta)}
    ${renderPrivatePage(ruta)}
  `;
  setupNavbar();
}

iniciarRouter(renderizarRuta);
