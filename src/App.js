import React, { useRef, useState } from "react";
import mammoth from "mammoth";
import SignaturePad from "react-signature-canvas";
import { generarContratoPDF } from "./pdfUtils";

function App() {
  const firmaPropietarioRef = useRef();
  const [form, setForm] = useState({
    nombrePropietario: "",
    cedulaPropietario: "",
    numeroOrden: "",
    empresaCadeteria: "",
    nombreCadete: "",
    cedulaCadete: "",
  });
  const [acepto, setAcepto] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [termsHtml, setTermsHtml] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  // constantes para los nombres de los campos del formulario
  const CAMPOS_NAMES = {
    nombrePropietario: "Nombres y Apellidos del Propietario",
    cedulaPropietario: "Cédula o R.U.T del Titular",
    numeroOrden: "Número de Orden",
    empresaCadeteria: "Empresa de Cadetería",
    nombreCadete: "Nombre del Autorizado quien Retira",
    cedulaCadete: "Cédula o R.U.T del Autorizado a Retirar",
  };

  const limpiarFirmaPropietario = () => {
    firmaPropietarioRef.current.clear();
    actualizarPDF();
  };

  // Debounce para actualizar el PDF solo después de que el usuario deje de escribir
  // const debounceRef = useRef();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));

    // borra mensajes de error si el usuario empieza a escribir
    const existingError = document
      .querySelector(`[name="${name}"]`)
      .parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
  };

  // Función para generar y actualizar el PDF
  const actualizarPDF = React.useCallback(async () => {
    try {
      // borrar el mensaje de error cuando el usuario firma
      const existingError = document
        .querySelector(`.firma-error-message`)
        .querySelector(".error-message");
      if (existingError) {
        existingError.remove();
      }

      const response = await fetch("/assets/PANTALLA-VERDE.pdf");
      const basePdfBytes = await response.arrayBuffer();
      const firmaPropietario =
        firmaPropietarioRef.current && !firmaPropietarioRef.current.isEmpty()
          ? firmaPropietarioRef.current.getCanvas().toDataURL("image/png")
          : null;

      const pdfBytes = await generarContratoPDF({
        basePdfBytes,
        datos: form,
        firmaPropietario,
      });
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } catch (err) {
      setPdfUrl(null);
    }
  }, [form]);

  // Generar PDF en tiempo real cada vez que cambian los datos o acepto
  React.useEffect(() => {
    actualizarPDF();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line
  }, [acepto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acepto) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }

    let flagEmptyField = false;
    // Validar campos obligatorios
    // recorrer los campos del form y verificar que no estén vacíos
    for (const key in form) {
      if (form[key].trim() === "" && key !== "empresaCadeteria") {
        // marcar en rojo el campo vacío
        // agrega mensaje de error html
        const errorMessage = document.createElement("div");
        errorMessage.className = "error-message";
        errorMessage.innerText =
          "Este campo es obligatorio: " + CAMPOS_NAMES[key];

        // verificar si ya existe un mensaje de error para este campo
        // si ya existe, no agregar otro
        const existingError = document
          .querySelector(`[name="${key}"]`)
          .parentNode.querySelector(".error-message");
        if (existingError) continue;

        document
          .querySelector(`[name="${key}"]`)
          .parentNode.appendChild(errorMessage);

        flagEmptyField = true;
      }
    }

    // validar que la firma no esté vacía
    if (firmaPropietarioRef.current.isEmpty()) {
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      errorMessage.innerText = "La firma del propietario es obligatoria.";

      // verificar si ya existe un mensaje de error para este campo
      // si ya existe, no agregar otro
      const existingError = document
        .querySelector(`.firma-error-message`)
        .querySelector(".error-message");
      if (!existingError) {
        document
          .querySelector(`[class="firma-error-message"]`)
          .appendChild(errorMessage);
      }
      flagEmptyField = true;
    }

    if (flagEmptyField) return;

    // eliminar mensajes de error previos
    document.querySelectorAll(".error-message").forEach((el) => el.remove());

    setGenerando(true);
    try {
      // Cargar el PDF base
      const response = await fetch("/assets/PANTALLA-VERDE.pdf");
      const basePdfBytes = await response.arrayBuffer();
      // Obtener firmas como PNG
      const firmaPropietario = firmaPropietarioRef.current.isEmpty()
        ? null
        : firmaPropietarioRef.current.getCanvas().toDataURL("image/png");

      // Generar PDF
      const pdfBytes = await generarContratoPDF({
        basePdfBytes,
        datos: form,
        firmaPropietario,
      });
      // Descargar PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contrato_firmado_pantalla_verde.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error generando el PDF: " + err.message);
    }
    setGenerando(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Header */}
      <header className="App-header">
        <img src="/assets/logo-pantalla.png" alt="logo" className="App-logo" />
        <div className="header-title">
          <img
            src="/assets/logo-letras.png"
            alt="logo"
            className="logo-letra"
          />
        </div>
      </header>

      {/* Main content */}
      <div className="main-content">
        {/* Formulario */}
        <form className="form-section" onSubmit={handleSubmit}>
          <div>
            <label>Nombres y Apellidos del Propietario</label>
            <input
              type="text"
              name="nombrePropietario"
              value={form.nombrePropietario}
              onChange={handleChange}
              placeholder="Ingrese Nombres y Apellidos"
            />
          </div>
          <div>
            <label>Cédula o R.U.T del Propietario</label>
            <input
              type="text"
              name="cedulaPropietario"
              value={form.cedulaPropietario}
              onChange={handleChange}
              placeholder="Ingrese Cédula o R.U.T del Titular"
            />
          </div>
          <div>
            <label>E-Factura o número de orden</label>
            <input
              type="text"
              name="numeroOrden"
              value={form.numeroOrden}
              onChange={handleChange}
              placeholder="Ingrese E-Factura o Número de Orden"
            />
          </div>
          <div>
            <label>Nombre del Autorizado quien Retira</label>
            <input
              type="text"
              name="nombreCadete"
              value={form.nombreCadete}
              onChange={handleChange}
              placeholder="Ingrese nombre de autorizado quien retira"
            />
          </div>
          <div>
            <label>Cédula o R.U.T del Autorizado a Retirar</label>
            <input
              type="text"
              name="cedulaCadete"
              value={form.cedulaCadete}
              onChange={handleChange}
              placeholder="Ingrese Cédula o R.U.T del Autorizado"
            />
          </div>
          <div>
            <label>Empresa de Cadetería</label>
            <input
              type="text"
              name="empresaCadeteria"
              value={form.empresaCadeteria}
              onChange={handleChange}
              placeholder="Ejemplo: Pedidos Ya y Uber."
            />
          </div>
          <div>
            <label>Firma del Propietario</label>
            <div className="firma-box">
              <SignaturePad
                ref={firmaPropietarioRef}
                onEnd={actualizarPDF}
                canvasProps={{
                  width: 400,
                  height: 100,
                  style: {
                    borderRadius: 8,
                    border: "none",
                    background: "#fcfdf6",
                  },
                }}
              />
              <button
                type="button"
                className="btn-clear"
                onClick={limpiarFirmaPropietario}
              >
                Limpiar
              </button>
              <div className="firma-error-message"></div>
            </div>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="acepto"
              checked={acepto}
              onChange={(e) => setAcepto(e.target.checked)}
            />
            <span
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/assets/terminos-condiciones.docx"
                  );
                  const arrayBuffer = await response.arrayBuffer();
                  const result = await mammoth.convertToHtml({ arrayBuffer });
                  setTermsHtml(result.value);
                } catch (err) {
                  setTermsHtml(
                    "No se pudo cargar el archivo de términos y condiciones."
                  );
                }
                setShowTerms(true);
              }}
            >
              ACEPTO LOS TERMINOS Y CONDICIONES
            </span>
          </div>
          <button type="submit" disabled={generando} className="btn-generar">
            {generando ? "Generando..." : "GENERAR PANTALLA VERDE"}
          </button>
        </form>

        {/* Visualización del contrato PDF */}
        <div className="pdf-section">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Contrato PDF Preview"
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#fff",
                width: "100%",
                height: "900px",
              }}
            />
          ) : (
            <div style={{ color: "#888", marginTop: 40 }}>
              Previsualización no disponible
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">COPYRIGHT PANTALLA VERDE 2025</footer>

      {/* Modal de términos y condiciones */}
      {showTerms && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: 12,
              maxWidth: 600,
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ color: "#b2c800" }}>Términos y Condiciones</h2>
            <div
              style={{
                maxHeight: 400,
                overflowY: "auto",
                marginBottom: 20,
                color: "#222",
                fontSize: 15,
              }}
              dangerouslySetInnerHTML={{ __html: termsHtml }}
            />
            <button
              style={{
                background: "#b2c800",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                borderRadius: 8,
                padding: "0.7rem 1.5rem",
                fontSize: 16,
                cursor: "pointer",
              }}
              onClick={() => setShowTerms(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Padding global al body
export default App;
