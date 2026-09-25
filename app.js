// =========================
// ELEMENT
// =========================

const passwordInput =
  document.getElementById("password");


const togglePassword =
  document.getElementById("togglePassword");



// =========================
// SHOW / HIDE PASSWORD
// =========================

togglePassword.addEventListener(
  "click",
  function () {

    const passwordHidden =
      passwordInput.type === "password";


    if (passwordHidden) {

      passwordInput.type = "text";

      togglePassword.textContent = "🙈";

      togglePassword.setAttribute(
        "aria-label",
        "Sembunyikan password"
      );

    } else {

      passwordInput.type = "password";

      togglePassword.textContent = "👁";

      togglePassword.setAttribute(
        "aria-label",
        "Tampilkan password"
      );

    }

  }
);



// =========================
// LOGIN
// Sementara belum dihubungkan
// ke HEXA API
// =========================

const loginForm =
  document.getElementById("loginForm");


loginForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();

  }
);
