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

  // Insertar datos en posiciones aproximadas (ajustar según el PDF)
  page.drawText(datos.nombrePropietario || '', { x: 70, y: 520, size: 12, color: rgb(0,0,0) });
  page.drawText(datos.cedulaPropietario || '', { x: 70, y: 500, size: 12, color: rgb(0,0,0) });
  page.drawText(datos.numeroOrden || '', { x: 70, y: 480, size: 12, color: rgb(0,0,0) });
  page.drawText(datos.empresaCadeteria || '', { x: 70, y: 460, size: 12, color: rgb(0,0,0) });
  page.drawText(datos.nombreCadete || '', { x: 70, y: 440, size: 12, color: rgb(0,0,0) });
  page.drawText(datos.cedulaCadete || '', { x: 70, y: 420, size: 12, color: rgb(0,0,0) });

  // Insertar firmas como imágenes PNG
  if (firmaPropietario) {
    const firmaImg = await pdfDoc.embedPng(firmaPropietario);
    page.drawImage(firmaImg, { x: 70, y: 350, width: 120, height: 40 });
  }
  if (firmaCadete) {
    const firmaImg = await pdfDoc.embedPng(firmaCadete);
    page.drawImage(firmaImg, { x: 70, y: 290, width: 120, height: 40 });
  }

  // Retornar el PDF modificado
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
