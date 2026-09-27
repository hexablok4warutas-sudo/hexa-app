"use strict";


/* =====================================================
   HEXA - PDF ENGINE

   Global PDF helper untuk seluruh fitur HEXA.

   Template / layout PDF TIDAK dibuat di file ini.
   Setiap halaman tetap memiliki template masing-masing.
===================================================== */


window.HexaPDF = (() => {


  /* ===================================================
     CREATE DATE FILE NAME
  =================================================== */

  function getDateFileName() {

    const now =
      new Date();


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const year =
      now.getFullYear();


    return (
      day +
      "-" +
      month +
      "-" +
      year
    );
  }



  /* ===================================================
     BUILD FILE NAME

     Example:
     HEXA_Unit_History_27-09-2026.pdf
  =================================================== */

  function createFileName(
    documentName
  ) {

    const safeName =
      String(
        documentName || "Document"
      )
        .trim()
        .replace(
          /\s+/g,
          "_"
        )
        .replace(
          /[^a-zA-Z0-9_-]/g,
          ""
        );


    return (
      "HEXA_" +
      safeName +
      "_" +
      getDateFileName() +
      ".pdf"
    );
  }



  /* ===================================================
     CREATE PDF FILE

     Mengubah PDF Blob menjadi File yang dapat
     diberikan ke Web Share API.
  =================================================== */

  function createPdfFile(
    pdfBlob,
    fileName
  ) {

    if (!(pdfBlob instanceof Blob)) {

      throw new Error(
        "PDF Blob tidak valid."
      );
    }


    return new File(
      [pdfBlob],
      fileName,
      {
        type:
          "application/pdf",

        lastModified:
          Date.now()
      }
    );
  }



  /* ===================================================
     CHECK FILE SHARE SUPPORT
  =================================================== */

  function canShareFile(
    file
  ) {

    if (
      typeof navigator.share !==
      "function"
    ) {

      return false;
    }


    if (
      typeof navigator.canShare !==
      "function"
    ) {

      return false;
    }


    try {

      return navigator.canShare({
        files: [file]
      });

    } catch (error) {

      return false;
    }
  }



  /* ===================================================
     SHARE PDF FILE

     Android / supported browser:
     membuka native Share Sheet.

     Dari sana user dapat memilih:
     WhatsApp, Gmail, Drive, dll.
  =================================================== */

  async function shareFile(
    file,
    options = {}
  ) {

    if (!(file instanceof File)) {

      throw new Error(
        "File PDF tidak valid."
      );
    }


    if (!canShareFile(file)) {

      return {
        success: false,
        supported: false
      };
    }


    try {

      await navigator.share({

        files: [file],

        title:
          options.title ||
          file.name

      });


      return {
        success: true,
        supported: true
      };


    } catch (error) {

      /*
        AbortError berarti user menutup
        Share Sheet tanpa memilih aplikasi.
      */

      if (
        error &&
        error.name ===
        "AbortError"
      ) {

        return {
          success: false,
          supported: true,
          cancelled: true
        };
      }


      throw error;
    }
  }



  /* ===================================================
     DOWNLOAD FALLBACK

     Dipakai jika browser/perangkat tidak mendukung
     share file melalui Web Share API.
  =================================================== */

  function downloadFile(
    file
  ) {

    if (!(file instanceof Blob)) {

      throw new Error(
        "File PDF tidak valid."
      );
    }


    const url =
      URL.createObjectURL(
        file
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      file.name ||
      createFileName(
        "Document"
      );


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    window.setTimeout(
      function () {

        URL.revokeObjectURL(
          url
        );

      },
      1000
    );
  }



  /* ===================================================
     SHARE OR DOWNLOAD

     Fungsi utama yang nanti dipanggil
     Unit History / Register Backlog / dll.
  =================================================== */

  async function shareOrDownload(
    pdfBlob,
    options = {}
  ) {

    const documentName =
      options.documentName ||
      "Document";


    const fileName =
      options.fileName ||
      createFileName(
        documentName
      );


    const file =
      createPdfFile(
        pdfBlob,
        fileName
      );


    const shareResult =
      await shareFile(
        file,
        {
          title:
            options.title ||
            documentName
        }
      );


    if (
      shareResult.supported ===
      false
    ) {

      downloadFile(
        file
      );


      return {
        success: true,
        shared: false,
        downloaded: true,
        file: file
      };
    }


    return {
      success:
        shareResult.success,

      shared:
        shareResult.success,

      downloaded:
        false,

      cancelled:
        shareResult.cancelled ===
        true,

      file:
        file
    };
  }



  /* ===================================================
     PUBLIC API
  =================================================== */

  return {

    createFileName:
      createFileName,

    createPdfFile:
      createPdfFile,

    canShareFile:
      canShareFile,

    shareFile:
      shareFile,

    downloadFile:
      downloadFile,

    shareOrDownload:
      shareOrDownload

  };


})();
