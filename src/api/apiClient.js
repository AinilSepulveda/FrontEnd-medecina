import { API_URL } from "../config.js";
import { cerrarSesion, obtenerToken } from "../utils/auth.js";

const ERROR_MESSAGES = {
  400: "La solicitud enviada no es valida.",
  401: "Tu sesion expiro. Inicia sesion nuevamente.",
  404: "El recurso solicitado no existe.",
  500: "Ocurrio un error en el servidor.",
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    throw new ApiError("El frontend solo puede consumir rutas relativas del backend local.", 400);
  }

  const baseUrl = API_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function createHeaders(body, customHeaders = {}) {
  const headers = new Headers(customHeaders);
  const token = obtenerToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  headers.set("Accept", "application/json");

  if (body !== undefined && !isFormData(body)) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function isFormData(body) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function getErrorMessage(status, data) {
  return (
    data?.message ||
    data?.error ||
    ERROR_MESSAGES[status] ||
    "No se pudo completar la solicitud."
  );
}

async function request(path, options = {}) {
  const { body, headers, ...restOptions } = options;
  const url = buildUrl(path);
  let response;

  try {
    response = await fetch(url, {
      ...restOptions,
      headers: createHeaders(body, headers),
      body: isFormData(body) || body === undefined ? body : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError("No se pudo conectar con el backend local.", 500, error);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      cerrarSesion();
    }

    throw new ApiError(getErrorMessage(response.status, data), response.status, data);
  }

  return data;
}

export function get(path) {
  return request(path, { method: "GET" });
}

export function post(path, body) {
  return request(path, { method: "POST", body });
}

export function put(path, body) {
  return request(path, { method: "PUT", body });
}

export function del(path) {
  return request(path, { method: "DELETE" });
}

export function upload(path, formData) {
  return request(path, { method: "POST", body: formData });
}

export default {
  request,
  get,
  post,
  put,
  del,
  upload,
};
