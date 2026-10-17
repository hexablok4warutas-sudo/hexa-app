// ========================================
// HEXA APP
// LOGIN SYSTEM
// ========================================


// ========================================
// APPS SCRIPT API
// ========================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


// ========================================
// AMBIL ELEMENT DARI HTML
// ========================================

const loginForm =
  document.getElementById("loginForm");

const userIdInput =
  document.getElementById("userId");

const passwordInput =
  document.getElementById("password");

const togglePassword =
  document.getElementById("togglePassword");

const loginMessage =
  document.getElementById("loginMessage");

const loginButton =
  document.querySelector(".login-button");


// ========================================
// CEK JIKA USER SUDAH LOGIN
// ========================================

const existingLogin =
  sessionStorage.getItem("hexaLoggedIn");

const existingUser =
  sessionStorage.getItem("hexaUser");

const existingToken =
  sessionStorage.getItem("hexaAuthToken");

if (
  existingLogin === "true" &&
  existingUser &&
  existingToken
) {

  // Session lengkap: arahkan ke Main Page.
  window.location.replace("main.html");

}


// ========================================
// SHOW / HIDE PASSWORD
// ========================================

if (togglePassword && passwordInput) {

  togglePassword.addEventListener(
    "click",
    function () {

      const passwordHidden =
        passwordInput.type === "password";

      if (passwordHidden) {

        passwordInput.type = "text";
        togglePassword.textContent = "🙈";

      } else {

        passwordInput.type = "password";
        togglePassword.textContent = "👁";

      }

    }
  );

}


// ========================================
// PROSES LOGIN
// ========================================

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      // ==================================
      // AMBIL USER ID DAN PASSWORD
      // ==================================

      const userId =
        userIdInput.value.trim();

      const password =
        passwordInput.value.trim();

      // ==================================
      // VALIDASI INPUT
      // ==================================

      if (!userId || !password) {

        showMessage(
          "User ID dan Password wajib diisi.",
          "error"
        );

        return;

      }

      // ==================================
      // LOADING
      // ==================================

      setLoading(true);

      showMessage(
        "Memeriksa akun...",
        "loading"
      );

      try {

        // ==================================
        // KIRIM LOGIN KE APPS SCRIPT
        // ==================================

        const response =
          await fetch(
            API_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "text/plain;charset=utf-8"
              },
              body: JSON.stringify({
                action: "login",
                userId: userId,
                password: password
              })
            }
          );

        // ==================================
        // BACA RESPONSE
        // ==================================

        const result =
          await response.json();

        // Jangan log seluruh result karena berisi authToken.

        // ==================================
        // LOGIN BERHASIL
        // ==================================

        if (
          result.success &&
          result.user
        ) {

          // Pastikan backend benar-benar mengirim token.
          if (
            typeof result.authToken !== "string" ||
            !result.authToken.trim()
          ) {
            throw new Error(
              "Token autentikasi tidak diterima dari server."
            );
          }

          // ==================================
          // SIMPAN SESSION USER
          // ==================================

          sessionStorage.setItem(
            "hexaUser",
            JSON.stringify(result.user)
          );

          // ==================================
          // SIMPAN TOKEN AUTENTIKASI
          // ==================================

          sessionStorage.setItem(
            "hexaAuthToken",
            result.authToken
          );

          // ==================================
          // SIMPAN STATUS LOGIN
          // ==================================

          sessionStorage.setItem(
            "hexaLoggedIn",
            "true"
          );

          // ==================================
          // MESSAGE
          // ==================================

          showMessage(
            "Selamat datang, " +
            result.user.nama +
            "!",
            "success"
          );

          // ==================================
          // REDIRECT KE MAIN PAGE
          // ==================================

          setTimeout(
            function () {
              window.location.replace("main.html");
            },
            700
          );

        // ==================================
        // LOGIN GAGAL
        // ==================================

        } else {

          sessionStorage.removeItem("hexaLoggedIn");
          sessionStorage.removeItem("hexaUser");
          sessionStorage.removeItem("hexaAuthToken");

          showMessage(
            result.message ||
            "User ID atau Password salah.",
            "error"
          );

        }

      // ==================================
      // ERROR KONEKSI / TOKEN
      // ==================================

      } catch (error) {

        // Jangan pertahankan session parsial.
        sessionStorage.removeItem("hexaLoggedIn");
        sessionStorage.removeItem("hexaUser");
        sessionStorage.removeItem("hexaAuthToken");

        console.error(
          "HEXA Login Error:",
          error.message
        );

        showMessage(
          error.message === "Token autentikasi tidak diterima dari server."
            ? error.message
            : "Tidak dapat terhubung ke server.",
          "error"
        );

      } finally {

        // ==================================
        // KEMBALIKAN LOGIN BUTTON
        // ==================================

        setLoading(false);

      }

    }
  );

}


// ========================================
// FUNCTION MESSAGE
// ========================================

function showMessage(
  message,
  type
) {

  if (!loginMessage) {
    return;
  }

  loginMessage.textContent =
    message;

  if (type === "success") {

    loginMessage.style.color =
      "#16803c";

  } else if (type === "error") {

    loginMessage.style.color =
      "#d93025";

  } else {

    loginMessage.style.color =
      "#555555";

  }

}


// ========================================
// FUNCTION LOADING BUTTON
// ========================================

function setLoading(
  isLoading
) {

  if (!loginButton) {
    return;
  }

  if (isLoading) {

    loginButton.disabled =
      true;

    loginButton.textContent =
      "Memeriksa...";

    loginButton.style.opacity =
      "0.75";

    loginButton.style.cursor =
      "not-allowed";

  } else {

    loginButton.disabled =
      false;

    loginButton.textContent =
      "Log in";

    loginButton.style.opacity =
      "1";

    loginButton.style.cursor =
      "pointer";

  }

}
