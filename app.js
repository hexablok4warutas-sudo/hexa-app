// ========================================
// HEXA APP
// LOGIN SYSTEM
// ========================================


// ========================================
// APPS SCRIPT API
// ========================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbzUafwfgn4mg_AApqnlj3ToZ3ml8kgDOzjuSaYXLeukwMzEAuCRWn2_aBzk5-5iWGhu1g/exec";


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


if (
  existingLogin === "true" &&
  existingUser
) {

  // Jika user kembali membuka halaman login
  // dalam tab yang sama dan session masih aktif,
  // langsung arahkan ke Main Page.

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

      // Mencegah form melakukan reload
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

                "Content-Type":
                  "text/plain;charset=utf-8"

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


        console.log(
          "Response HEXA API:",
          result
        );


        // ==================================
        // LOGIN BERHASIL
        // ==================================

        if (
          result.success &&
          result.user
        ) {

          // ==================================
          // SIMPAN SESSION USER
          // ==================================

          sessionStorage.setItem(
            "hexaUser",
            JSON.stringify(result.user)
          );


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

              window.location.replace(
                "main.html"
              );

            },
            700
          );


        // ==================================
        // LOGIN GAGAL
        // ==================================

        } else {

          // Bersihkan kemungkinan session lama

          sessionStorage.removeItem(
            "hexaLoggedIn"
          );

          sessionStorage.removeItem(
            "hexaUser"
          );


          showMessage(
            result.message ||
            "User ID atau Password salah.",
            "error"
          );

        }


      // ==================================
      // ERROR KONEKSI
      // ==================================

      } catch (error) {

        console.error(
          "HEXA Login Error:",
          error
        );


        showMessage(
          "Tidak dapat terhubung ke server.",
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

  }

  else if (type === "error") {

    loginMessage.style.color =
      "#d93025";

  }

  else {

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

  }

  else {

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
