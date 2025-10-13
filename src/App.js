import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { generarContratoPDF } from './pdfUtils';

function App() {
  const firmaPropietarioRef = useRef();
  const firmaCadeteRef = useRef();
  const [form, setForm] = useState({
    nombrePropietario: '',
    cedulaPropietario: '',
    numeroOrden: '',
    empresaCadeteria: '',
    nombreCadete: '',
    cedulaCadete: ''
  });
  const [acepto, setAcepto] = useState(false);
  const [generando, setGenerando] = useState(false);

  const limpiarFirmaPropietario = () => firmaPropietarioRef.current.clear();
  const limpiarFirmaCadete = () => firmaCadeteRef.current.clear();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!acepto) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    setGenerando(true);
    try {
      // Cargar el PDF base
      const response = await fetch(process.env.PUBLIC_URL + '/AUTORIZACIÓN DE RETIRO DE EQUIPO (1).pdf');
      const basePdfBytes = await response.arrayBuffer();
      // Obtener firmas como PNG
      const firmaPropietario = firmaPropietarioRef.current.isEmpty() ? null : firmaPropietarioRef.current.getTrimmedCanvas().toDataURL('image/png');
      const firmaCadete = firmaCadeteRef.current.isEmpty() ? null : firmaCadeteRef.current.getTrimmedCanvas().toDataURL('image/png');
      // Generar PDF
      const pdfBytes = await generarContratoPDF({
        basePdfBytes,
        datos: form,
        firmaPropietario,
        firmaCadete
      });
      // Descargar PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contrato_firmado.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error generando el PDF: ' + err.message);
    }
    setGenerando(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: '#222', color: '#fff', padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img src={process.env.PUBLIC_URL + '/logoPantallaVerde.png'} alt="logo" style={{ position: 'absolute', left: 30, top: 10, height: 50 }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, letterSpacing: 2 }}>TIENDA DE TECNOLOGÍA</div>
          <div style={{ fontSize: 36, fontWeight: 'bold', letterSpacing: 2 }}>
            <span style={{ color: '#fff' }}>PANTALLA</span><span style={{ color: '#b2c800' }}>VERDE</span>
          </div>
        </div>
      </header>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', background: '#fff' }}>
        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ flex: 1, maxWidth: 500, padding: '2rem 2rem 0 2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>NOMBRES Y APELLIDOS DEL PROPIETARIO</label>
            <input type="text" name="nombrePropietario" value={form.nombrePropietario} onChange={handleChange} placeholder="INGRESE NOMBRES Y APELLIDOS" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>CEDULA DEL PROPIETARIO</label>
            <input type="text" name="cedulaPropietario" value={form.cedulaPropietario} onChange={handleChange} placeholder="INGRESE NUMERO DE CEDULA" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>NUMERO DE ORDEN</label>
            <input type="text" name="numeroOrden" value={form.numeroOrden} onChange={handleChange} placeholder="INGRESE NUMERO DE ORDEN" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>EMPRESA DE CADETERIA</label>
            <input type="text" name="empresaCadeteria" value={form.empresaCadeteria} onChange={handleChange} placeholder="EJEM: PEDIDOS YA! U OTRAS..." style={inputStyle} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>NOMBRE COMPLETO DEL CADETE</label>
            <input type="text" name="nombreCadete" value={form.nombreCadete} onChange={handleChange} placeholder="INGRESE  NOMBRE COMPLETO DEL CADETE AUTORIZADO" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>CEDULA DEL CADETE:</label>
            <input type="text" name="cedulaCadete" value={form.cedulaCadete} onChange={handleChange} placeholder="INGRESE  CEDULA DEL CADETE AUTORIZADO" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>FIRMA DEL PROPIETARIO</label>
            <div style={firmaBoxStyle}>
              <SignaturePad
                ref={firmaPropietarioRef}
                canvasProps={{ width: 400, height: 100, style: { borderRadius: 8, border: '1px solid #e6eec7', background: '#fcfdf6' } }}
              />
              <button type="button" style={btnClearStyle} onClick={limpiarFirmaPropietario}>Limpiar</button>
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>FIRMA DEL AUTORIZADO / CADETE</label>
            <div style={firmaBoxStyle}>
              <SignaturePad
                ref={firmaCadeteRef}
                canvasProps={{ width: 400, height: 100, style: { borderRadius: 8, border: '1px solid #e6eec7', background: '#fcfdf6' } }}
              />
              <button type="button" style={btnClearStyle} onClick={limpiarFirmaCadete}>Limpiar</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="acepto" checked={acepto} onChange={e => setAcepto(e.target.checked)} />
            <label htmlFor="acepto" style={{ color: '#b2c800', fontWeight: 'bold', fontSize: 15 }}>ACEPTO LOS TERMINOS Y CONDICIONES</label>
          </div>
          <button type="submit" disabled={generando} style={{ background: '#b2c800', color: '#fff', fontWeight: 'bold', fontSize: 18, border: 'none', borderRadius: 8, padding: '1rem', marginTop: 10 }}>{generando ? 'Generando...' : 'GENERAR PANTALLA VERDE'}</button>
        </form>
        {/* Visualización del contrato PDF */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <iframe
            src={process.env.PUBLIC_URL + '/AUTORIZACIÓN DE RETIRO DE EQUIPO (1).pdf'}
            title="Contrato PDF"
            width="100%"
            height="600px"
            style={{ border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}
          />
        </div>
      </div>
      {/* Footer */}
      <footer style={{ background: '#222', color: '#b2c800', textAlign: 'center', padding: '1rem', fontSize: 13, letterSpacing: 1 }}>
        COPYRIGHT PANTALLA VERDE 2025<br />
        DESIGNER BY CYBER STAFF C.A
      </footer>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '1rem',
  borderRadius: 8,
  border: '1px solid #e6eec7',
  background: '#fcfdf6',
  fontSize: 16,
  marginTop: 6,
  marginBottom: 6,
};

const firmaBoxStyle = {
  width: '100%',
  minHeight: 100,
  borderRadius: 8,
  border: '1px solid #e6eec7',
  background: '#fcfdf6',
  color: '#d3d3d3',
  fontSize: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 6,
  marginBottom: 6,
  gap: 8,
};

const btnClearStyle = {
  marginTop: 8,
  background: '#e6eec7',
  color: '#b2c800',
  border: 'none',
  borderRadius: 6,
  padding: '0.5rem 1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default App;
