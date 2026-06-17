import { post } from "../api/apiClient.js";
import { guardarToken } from "../utils/auth.js";
import { navegar } from "../utils/router.js";

function obtenerTokenDesdeRespuesta(respuesta) {
  return (
    respuesta?.token ||
    respuesta?.accessToken ||
    respuesta?.data?.token ||
    respuesta?.data?.accessToken ||
    respuesta?.usuario?.token
  );
}

function normalizarError(error) {
  return error?.message || "No se pudo iniciar sesion.";
}

export function renderLoginPage() {
  return `
    <main class="login-page">
      <section class="login-card card shadow-sm border-0">
        <div class="card-body p-4 p-sm-5">
          <div class="mb-4">
            <span class="brand-mark mb-3">
              <i class="bi bi-heart-pulse-fill"></i>
            </span>
            <h1 class="h3 mb-1">Clinica</h1>
            <p class="text-secondary">Ingreso de usuarios</p>
          </div>

          <div id="login-error" class="alert alert-danger d-none" role="alert"></div>

          <form id="login-form" novalidate>
            <div class="mb-3 text-start">
              <label for="email" class="form-label">Email</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                />
              </div>
            </div>

            <div class="mb-4 text-start">
              <label for="password" class="form-label">Password</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                />
              </div>
            </div>

            <button id="login-submit" type="submit" class="btn btn-primary w-100">
              <span class="submit-text">Ingresar</span>
              <span class="spinner-border spinner-border-sm d-none" aria-hidden="true"></span>
            </button>
          </form>
        </div>
      </section>
    </main>
  `;
}

export function setupLoginPage() {
  const form = document.querySelector("#login-form");
  const errorBox = document.querySelector("#login-error");
  const submitButton = document.querySelector("#login-submit");
  const submitText = submitButton?.querySelector(".submit-text");
  const spinner = submitButton?.querySelector(".spinner-border");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.classList.add("d-none");
    errorBox.textContent = "";

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const formData = new FormData(form);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    submitButton.disabled = true;
    submitText.textContent = "Ingresando";
    spinner.classList.remove("d-none");

    try {
      const respuesta = await post("/auth/login", credentials);

      if (respuesta?.codigo && respuesta.codigo !== 200) {
        throw new Error(respuesta?.message || respuesta?.error);
      }

      const token = obtenerTokenDesdeRespuesta(respuesta);

      if (!token) {
        throw new Error("El backend no envio un token valido.");
      }

      guardarToken(token);
      navegar("/dashboard", { reemplazar: true });
    } catch (error) {
      errorBox.textContent = normalizarError(error);
      errorBox.classList.remove("d-none");
    } finally {
      submitButton.disabled = false;
      submitText.textContent = "Ingresar";
      spinner.classList.add("d-none");
    }
  });
}
