import { PDFDocument, rgb } from "pdf-lib";

export async function generarContratoPDF({
  basePdfBytes,
  datos,
  firmaPropietario,
}) {
  // Cargar el PDF base
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const page = pdfDoc.getPages()[0];
  const fechaActual = new Date();
  const fecha = `${String(fechaActual.getDate()).padStart(2, "0")}/${String(
    fechaActual.getMonth() + 1
  ).padStart(2, "0")}/${fechaActual.getFullYear()}`;

  // Insertar datos alineados según el contrato
  // Ajusta estos valores si necesitas mover los campos
  // Coordenadas ajustadas para imprimir sobre las líneas vacías del contrato
  // Coordenadas ajustadas para centrar los campos sobre las líneas vacías
  // NOMBRE PROPIETARIO sobre la línea 'Yo, _______________________________'
  page.drawText(fecha || "", { x: 400, y: 710, size: 14, color: rgb(0, 0, 0) }); // FECHA ACTUAL
  page.drawText(datos.nombrePropietario.toUpperCase() || "", {
    x: 110,
    y: 710,
    size: 12,
    color: rgb(0, 0, 0),
  });

  page.drawText(datos.cedulaPropietario || "", {
    x: 173,
    y: 687,
    size: 12,
    color: rgb(0, 0, 0),
  }); // CEDULA PROPIETARIO

  page.drawText(datos.numeroOrden || "", {
    x: 210,
    y: 672,
    size: 12,
    color: rgb(0, 0, 0),
  }); // NUMERO DE ORDEN

  page.drawText(
    datos.empresaCadeteria.toUpperCase() +
      " / " +
      datos.nombreCadete.toUpperCase() || "",
    { x: 263, y: 658, size: 12, color: rgb(0, 0, 0) }
  ); // EMPRESA CADETERIA + NOMBRE CADETE

  page.drawText(datos.cedulaCadete || "", {
    x: 150,
    y: 644,
    size: 12,
    color: rgb(0, 0, 0),
  }); // CEDULA CADETE

  // Firmas sobre las líneas correspondientes, centradas
  if (firmaPropietario) {
    const firmaImg = await pdfDoc.embedPng(firmaPropietario);
    page.drawImage(firmaImg, { x: 330, y: 105, width: 150, height: 55 }); // Firma propietario (más grande y abajo)
  }

  // Retornar el PDF modificado
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
