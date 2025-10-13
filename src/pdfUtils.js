import { PDFDocument, rgb } from 'pdf-lib';

export async function generarContratoPDF({
  basePdfBytes,
  datos,
  firmaPropietario,
  firmaCadete
}) {
  // Cargar el PDF base
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const page = pdfDoc.getPages()[0];
  const fechaActual = new Date();
  const fecha = `${String(fechaActual.getDate()).padStart(2, '0')}/${String(fechaActual.getMonth() + 1).padStart(2, '0')}/${fechaActual.getFullYear()}`;

  // Insertar datos alineados según el contrato
  // Ajusta estos valores si necesitas mover los campos
  // Coordenadas ajustadas para imprimir sobre las líneas vacías del contrato
  // Coordenadas ajustadas para centrar los campos sobre las líneas vacías
  // NOMBRE PROPIETARIO sobre la línea 'Yo, _______________________________'
  page.drawText(datos.nombrePropietario.toUpperCase() || '', { x: 130, y: 603, size: 14, color: rgb(0,0,0) });
  page.drawText(datos.nombrePropietario.toUpperCase() || '', { x: 180, y: 438, size: 14, color: rgb(0,0,0) });

  page.drawText(datos.cedulaPropietario || '', { x: 180, y: 580, size: 14, color: rgb(0,0,0) }); // CEDULA PROPIETARIO
  page.drawText(datos.cedulaPropietario || '', { x: 120, y: 412 , size: 14, color: rgb(0,0,0) }); // CEDULA PROPIETARIO

  page.drawText(datos.numeroOrden || '', { x: 215, y: 565, size: 14, color: rgb(0,0,0) }); // NUMERO DE ORDEN

  page.drawText(datos.empresaCadeteria.toUpperCase() || '', { x: 240, y: 551, size: 14, color: rgb(0,0,0) }); // EMPRESA CADETERIA
  page.drawText(datos.empresaCadeteria.toUpperCase() || '', { x: 200, y: 271, size: 14, color: rgb(0,0,0) }); // EMPRESA CADETERIA

  page.drawText(datos.nombreCadete.toUpperCase() || '', { x: 185, y: 325, size: 14, color: rgb(0,0,0) }); // NOMBRE CADETE

  page.drawText(datos.cedulaCadete || '', { x: 150, y: 529, size: 14, color: rgb(0,0,0) }); // CEDULA CADETE
  page.drawText(datos.cedulaCadete || '', { x: 110, y: 300, size: 14, color: rgb(0,0,0) }); // CEDULA CADETE

  page.drawText(fecha || '', { x: 125, y: 385, size: 14, color: rgb(0,0,0) }); // FECHA ACTUAL
  page.drawText(fecha || '', { x: 125, y: 244, size: 14, color: rgb(0,0,0) }); // FECHA ACTUAL

  // Firmas sobre las líneas correspondientes, centradas
  if (firmaPropietario) {
    const firmaImg = await pdfDoc.embedPng(firmaPropietario);
    page.drawImage(firmaImg, { x: 180, y: 450, width: 150, height: 55 }); // Firma propietario (más grande y abajo)
  }
  if (firmaCadete) {
    const firmaImg = await pdfDoc.embedPng(firmaCadete);
    page.drawImage(firmaImg, { x: 210, y: 330, width: 150, height: 55 }); // Firma cadete (más grande y abajo)
  }

  // Retornar el PDF modificado
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
