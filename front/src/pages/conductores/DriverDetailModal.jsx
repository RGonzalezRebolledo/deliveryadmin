import React, { useState } from "react";

const DriverDetailModal = ({ driver, onClose }) => {
  if (!driver) return null;

  // Estado para controlar la imagen seleccionada en pantalla completa
  const [previewImage, setPreviewImage] = useState(null);

  // --- ESTILOS REUTILIZABLES ---
  const labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    color: "#888",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: "2px"
  };

  const valueStyle = {
    display: "block",
    fontSize: "1rem",
    color: "#333",
    marginBottom: "12px",
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: "4px"
  };

  const imgContainerStyle = {
    flex: 1,
    height: "280px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    position: "relative",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "zoom-in"
  };

  // Color dinámico según estatus
  const statusColor = driver.is_active === 'activo' ? '#16a34a' : '#dc2626';

  // Formateador visual para el Tipo de Conductor
  const getConductorLabel = (tipo) => {
    if (!tipo) return 'Sin asignar';
    return tipo.toLowerCase().includes('interno') 
      ? 'Interno (Prioritario)' 
      : 'Foráneo / Aliado';
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={modalStyle}>
        
        {/* CABECERA */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '25px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <div>
            {/* NOMBRE, STATUS Y TIPO DE CONDUCTOR EN LA MISMA LÍNEA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, color: "#333", fontSize: "1.1rem", fontWeight: '600', marginRight: '4px' }}>
                {driver.nombre}
              </p>
              
              {/* BADGE DE ESTATUS */}
              <span style={{
                backgroundColor: statusColor,
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textTransform: 'uppercase'
              }}>
                <span style={{ fontSize: '0.9rem' }}>●</span> {driver.is_active}
              </span>

              {/* BADGE DE TIPO DE CONDUCTOR */}
              <span style={{
                backgroundColor: '#e2e8f0',
                color: '#1e293b',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                textTransform: 'uppercase'
              }}>
                🚗 {getConductorLabel(driver.tipo_conductor)}
              </span>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            style={{ 
              border: '1px solid #ddd', 
              background: '#f5f5f5', 
              width: '32px',      
              height: '32px',     
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#444',
              fontSize: '1.1rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e2e2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          >
            &times;
          </button>
        </div>

        {/* 1. SECCIÓN DE IMÁGENES (3 Columnas con funcionalidad de ampliación) */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          {/* Foto Perfil */}
          <div 
            style={imgContainerStyle} 
            onClick={() => driver.foto && setPreviewImage(driver.foto)}
          >
            <div style={tagStyle}>FOTO PERFIL</div>
            <img 
              src={driver.foto} 
              alt="Perfil" 
              referrerPolicy="no-referrer"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/500x700?text=Sin+Foto+Perfil'; }}
            />
          </div>

          {/* Foto Vehículo */}
          <div 
            style={imgContainerStyle} 
            onClick={() => driver.foto_vehiculo && setPreviewImage(driver.foto_vehiculo)}
          >
            <div style={tagStyle}>FOTO VEHÍCULO</div>
            <img 
              src={driver.foto_vehiculo} 
              alt="Vehículo" 
              referrerPolicy="no-referrer"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/500x700?text=Sin+Foto+Veh%C3%ADculo'; }}
            />
          </div>

          {/* Foto C.I / Documento */}
          <div 
            style={imgContainerStyle} 
            onClick={() => driver.foto_documento && setPreviewImage(driver.foto_documento)}
          >
            <div style={tagStyle}>FOTO C.I / DOC</div>
            <img 
              src={driver.foto_documento} 
              alt="Documento C.I." 
              referrerPolicy="no-referrer"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/500x700?text=Sin+Foto+Documento'; }}
            />
          </div>
        </div>

        {/* 2. SECCIÓN DE DATOS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '15px 40px',
          backgroundColor: '#f8fafc',
          padding: '25px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <span style={labelStyle}>Correo Electrónico</span>
            <span style={valueStyle}>{driver.email}</span>
          </div>
          <div>
            <span style={labelStyle}>Teléfono</span>
            <span style={valueStyle}>{driver.telefono || 'No registrado'}</span>
          </div>
          <div>
            <span style={labelStyle}>Identificación</span>
            <span style={valueStyle}>{driver.tipo_documento} - {driver.documento_identidad}</span>
          </div>
          <div>
            <span style={labelStyle}>Tipo de Vehículo</span>
            <span style={valueStyle}>{driver.tipo_vehiculo || 'No asignado'}</span>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="btn-primary" 
          style={{ 
            width: '100%', 
            marginTop: '25px', 
            padding: '14px', 
            fontWeight: 'bold',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          Cerrar Revisión
        </button>
      </div>

      {/* LIGHTBOX: VISOR DE IMAGEN AMPLIADA */}
      {previewImage && (
        <div style={lightboxOverlayStyle} onClick={() => setPreviewImage(null)}>
          <div style={lightboxContentStyle} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              style={closeLightboxBtnStyle} 
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
            <img src={previewImage} alt="Vista Ampliada" style={lightboxImgStyle} />
          </div>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS DE APOYO ---
const overlayStyle = { 
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
  backgroundColor: 'rgba(15, 23, 42, 0.85)', 
  display: 'flex', justifyContent: 'center', alignItems: 'center', 
  zIndex: 1000, backdropFilter: 'blur(6px)' 
};

const modalStyle = { 
  backgroundColor: '#fff', padding: '30px', 
  borderRadius: '12px', 
  width: '95%', maxWidth: '900px', 
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
  maxHeight: '95vh', overflowY: 'auto' 
};

const tagStyle = { 
  position: 'absolute', top: '15px', left: '15px', 
  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
  color: '#1e293b', padding: '5px 12px', 
  borderRadius: '2px',
  fontSize: '0.7rem', fontWeight: '800', 
  zIndex: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

// ESTILOS PARA LIGHTBOX (VISTA AMPLIADA)
const lightboxOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 3000,
  backdropFilter: 'blur(5px)'
};

const lightboxContentStyle = {
  position: 'relative',
  maxWidth: '90%',
  maxHeight: '90%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const lightboxImgStyle = {
  maxWidth: '100%',
  maxHeight: '85vh',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  objectFit: 'contain'
};

const closeLightboxBtnStyle = {
  position: 'absolute',
  top: '-40px',
  right: '0px',
  background: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#333',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
};

export default DriverDetailModal;

// import React from "react";

// const DriverDetailModal = ({ driver, onClose }) => {
//   if (!driver) return null;

//   // --- ESTILOS REUTILIZABLES ---
//   const labelStyle = {
//     display: "block",
//     fontSize: "0.75rem",
//     color: "#888",
//     textTransform: "uppercase",
//     fontWeight: "bold",
//     marginBottom: "2px"
//   };

//   const valueStyle = {
//     display: "block",
//     fontSize: "1rem",
//     color: "#333",
//     marginBottom: "12px",
//     borderBottom: "1px solid #f0f0f0",
//     paddingBottom: "4px"
//   };

//   const imgContainerStyle = {
//     flex: 1,
//     height: "380px", 
//     borderRadius: "8px",
//     overflow: "hidden",
//     border: "1px solid #ddd",
//     backgroundColor: "#f9f9f9",
//     position: "relative",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
//   };

//   // Color dinámico según estatus
//   const statusColor = driver.is_active === 'activo' ? '#16a34a' : '#dc2626';

//   return (
//     <div className="modal-overlay" style={overlayStyle}>
//       <div className="modal-content" style={modalStyle}>
        
//         {/* CABECERA */}
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'space-between', 
//           alignItems: 'flex-start', 
//           marginBottom: '25px',
//           borderBottom: '1px solid #eee',
//           paddingBottom: '15px'
//         }}>
//           <div>
//             {/* <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.5rem' }}>
//               Revisión de Expediente
//             </h3> */}
            
//             {/* NOMBRE Y STATUS A LA PAR */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
//               <p style={{ margin: 0, color: "#333", fontSize: "1.1rem", fontWeight: '600' }}>
//                 {driver.nombre}
//               </p>
              
//               <span style={{
//                 backgroundColor: statusColor,
//                 color: '#fff',
//                 padding: '2px 8px',
//                 borderRadius: '4px',
//                 fontSize: '0.65rem',
//                 fontWeight: 'bold',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '4px',
//                 textTransform: 'uppercase'
//               }}>
//                 <span style={{ fontSize: '0.9rem' }}>●</span> {driver.is_active}
//               </span>
//             </div>
//           </div>
          
//           <button 
//             onClick={onClose} 
//             style={{ 
//               border: '1px solid #ddd', 
//               background: '#f5f5f5', 
//               width: '32px',      
//               height: '32px',     
//               borderRadius: '4px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#444',
//               fontSize: '1.1rem',
//               transition: 'all 0.2s ease',
//             }}
//             onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e2e2')}
//             onMouseLeave={(e) => (e.currentTarget.style.background = '#f5f5f5')}
//           >
//             &times;
//           </button>
//         </div>

//         {/* 1. SECCIÓN DE IMÁGENES */}
//         <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
//           <div style={imgContainerStyle}>
//             <div style={tagStyle}>FOTO PERFIL</div>
//             <img 
//               src={driver.foto} 
//               alt="Perfil" 
//               style={{ width: "100%", height: "100%", objectFit: "cover" }} 
//               onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/500x700?text=Sin+Foto+Perfil'; }}
//             />
//           </div>
//           <div style={imgContainerStyle}>
//             <div style={tagStyle}>FOTO VEHÍCULO</div>
//             <img 
//               src={driver.foto_vehiculo} 
//               alt="Vehículo" 
//               style={{ width: "100%", height: "100%", objectFit: "cover" }} 
//               onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/500x700?text=Sin+Foto+Vehículo'; }}
//             />
//           </div>
//         </div>

//         {/* 2. SECCIÓN DE DATOS */}
//         <div style={{ 
//           display: 'grid', 
//           gridTemplateColumns: 'repeat(2, 1fr)', 
//           gap: '15px 40px',
//           backgroundColor: '#f8fafc',
//           padding: '25px',
//           borderRadius: '8px',
//           border: '1px solid #e2e8f0'
//         }}>
//           <div>
//             <span style={labelStyle}>Correo Electrónico</span>
//             <span style={valueStyle}>{driver.email}</span>
//           </div>
//           <div>
//             <span style={labelStyle}>Teléfono</span>
//             <span style={valueStyle}>{driver.telefono || 'No registrado'}</span>
//           </div>
//           <div>
//             <span style={labelStyle}>Identificación</span>
//             <span style={valueStyle}>{driver.tipo_documento} - {driver.documento_identidad}</span>
//           </div>
//           <div>
//             <span style={labelStyle}>Tipo de Vehículo</span>
//             <span style={valueStyle}>{driver.tipo_vehiculo || 'No asignado'}</span>
//           </div>
//         </div>

//         <button 
//           onClick={onClose} 
//           className="btn-primary" 
//           style={{ 
//             width: '100%', 
//             marginTop: '25px', 
//             padding: '14px', 
//             fontWeight: 'bold',
//             borderRadius: '6px',
//             fontSize: '1rem'
//           }}
//         >
//           Cerrar Revisión
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- ESTILOS DE APOYO ---
// const overlayStyle = { 
//   position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
//   backgroundColor: 'rgba(15, 23, 42, 0.85)', 
//   display: 'flex', justifyContent: 'center', alignItems: 'center', 
//   zIndex: 1000, backdropFilter: 'blur(6px)' 
// };

// const modalStyle = { 
//   backgroundColor: '#fff', padding: '30px', 
//   borderRadius: '12px', 
//   width: '95%', maxWidth: '900px', 
//   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
//   maxHeight: '95vh', overflowY: 'auto' 
// };

// const tagStyle = { 
//   position: 'absolute', top: '15px', left: '15px', 
//   backgroundColor: 'rgba(255, 255, 255, 0.95)', 
//   color: '#1e293b', padding: '5px 12px', 
//   borderRadius: '2px',
//   fontSize: '0.7rem', fontWeight: '800', 
//   zIndex: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
// };

// export default DriverDetailModal;