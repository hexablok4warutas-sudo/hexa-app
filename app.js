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

      // Mencegah form reload halaman
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
      // TAMPILKAN LOADING
      // ==================================

      setLoading(true);

      showMessage(
        "Memeriksa akun...",
        "loading"
      );


      try {

        // ==================================
        // KIRIM DATA KE APPS SCRIPT
        // ==================================

        const response =
          await fetch(API_URL, {

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

          });


        // ==================================
        // BACA HASIL DARI APPS SCRIPT
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

        if (result.success) {

          showMessage(
            "Login berhasil.",
            "success"
          );


          // ==================================
          // SIMPAN DATA USER
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
          // TAMPILKAN NAMA USER
          // ==================================
          // Untuk sementara belum redirect
          // karena Main Page belum dibuat.

          setTimeout(
            function () {

              showMessage(
                "Selamat datang, " +
                result.user.nama +
                "!",
                "success"
              );

            },
            500
          );


      // ==================================
      // LOGIN GAGAL
      // ==================================

        } else {

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
        // KEMBALIKAN BUTTON
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


  // WARNA MESSAGE

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

function setLoading(isLoading) {

  if (!loginButton) {
    return;
  }


  if (isLoading) {

    loginButton.disabled = true;

    loginButton.textContent =
      "Memeriksa...";

    loginButton.style.opacity =
      "0.75";

    loginButton.style.cursor =
      "not-allowed";


  } else {

    loginButton.disabled = false;

    loginButton.textContent =
      "Log in";

    loginButton.style.opacity =
      "1";

    loginButton.style.cursor =
      "pointer";

  }

}
