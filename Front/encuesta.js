/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Encuesta (encuesta.ejs)
   ════════════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-encuesta");
  if (!form) return;

  const sliderPuntuacion = document.getElementById("puntuacion");
  const valorPuntuacion  = document.getElementById("valor-puntuacion");
  const btnOmitir        = document.getElementById("btn-omitir");
  const modalGracias     = document.getElementById("modal-gracias");
  const btnCerrarGracias = document.getElementById("btn-cerrar-gracias");

  // Slider: mostrar valor en vivo
  sliderPuntuacion.addEventListener("input", () => {
    valorPuntuacion.textContent = sliderPuntuacion.value;
  });

  // Botón Omitir: limpia la sesión del cliente y vuelve al inicio
  btnOmitir.addEventListener("click", () => {
    localStorage.removeItem("gamezone_ultimo_ticket");
    limpiarSesionCliente(); // definida en app.js: borra cliente + vacía carrito
    window.location.href = "/index.html";
  });

  // Cerrar modal de agradecimiento → limpia sesión y vuelve al inicio
  btnCerrarGracias.addEventListener("click", () => {
    localStorage.removeItem("gamezone_ultimo_ticket");
    limpiarSesionCliente();
    window.location.href = "/index.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const formData = new FormData(form);
    // El checkbox no se envía si está sin marcar; lo forzamos a 'false' explícito
    if (!document.getElementById("acepta_contacto").checked) {
      formData.set("acepta_contacto", "false");
    }

    try {
      const res = await fetch("/api/encuestas", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.ok) {
        mostrarErroresBackend(data.errores || [data.error]);
        return;
      }

      modalGracias.classList.add("activo");
    } catch (error) {
      console.error("Error al enviar la encuesta:", error);
      document.getElementById("error-general").textContent =
        "No se pudo enviar la encuesta. Intentá de nuevo.";
    }
  });

  function limpiarErrores() {
    document.querySelectorAll(".error-campo").forEach((el) => (el.textContent = ""));
    document.getElementById("error-general").textContent = "";
    document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
  }

  function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    const opinion = document.getElementById("opinion");
    if (opinion.value.trim().length < 10) {
      document.getElementById("error-opinion").textContent =
        "Contanos un poco más (mínimo 10 caracteres).";
      opinion.classList.add("input-error");
      esValido = false;
    }

    const email = document.getElementById("email");
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.value.trim())) {
      document.getElementById("error-email").textContent = "Ingresá un email válido.";
      email.classList.add("input-error");
      esValido = false;
    }

    const imagenInput = document.getElementById("imagen");
    if (imagenInput.files.length > 0) {
      const archivo = imagenInput.files[0];
      const tiposValidos = ["image/jpeg", "image/png", "image/webp"];
      if (!tiposValidos.includes(archivo.type)) {
        document.getElementById("error-imagen").textContent =
          "La imagen debe ser JPG, PNG o WEBP.";
        esValido = false;
      } else if (archivo.size > 5 * 1024 * 1024) {
        document.getElementById("error-imagen").textContent =
          "La imagen no puede superar los 5MB.";
        esValido = false;
      }
    }

    return esValido;
  }

  function mostrarErroresBackend(errores) {
    // errores puede venir como array de strings (encuestaController) o
    // array de objetos { msg, path, ... } de express-validator (validators.js)
    const mensajes = errores.map((e) => (typeof e === 'string' ? e : e.msg));
    document.getElementById("error-general").textContent = mensajes.join(" ");
  }
});
