import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 

const DriverRegisterModal = ({ driver, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    // 🆕 Añadido estado para la subida de documento
    const [uploading, setUploading] = useState({ perfil: false, vehiculo: false, documento: false });
    const [vehicleTypes, setVehicleTypes] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true);

    const isEditing = !!driver.repartidor_id;

    const [formData, setFormData] = useState({
        usuario_id: driver.usuario_id,
        documento_identidad: driver.documento_identidad || driver.cedula || '',
        tipo_documento: driver.tipo_documento || 'CI',
        tipo_vehiculo_id: driver.tipo_vehiculo_id || '', 
        vehicleDescript: driver.tipo_vehiculo || driver.vehiculo || '',   
        foto: driver.foto || '',
        foto_vehiculo: driver.foto_vehiculo || '',
        tipo_conductor: driver.tipo_conductor || 'interno', // 🆕 Por defecto 'interno'
        foto_documento: driver.foto_documento || ''          // 🆕 Foto del documento
    });

    useEffect(() => {
        if (driver) {
            setFormData({
                usuario_id: driver.usuario_id,
                documento_identidad: driver.documento_identidad || driver.cedula || '',
                tipo_documento: driver.tipo_documento || 'CI',
                tipo_vehiculo_id: driver.tipo_vehiculo_id || '', 
                vehicleDescript: driver.tipo_vehiculo || driver.vehiculo || '',   
                foto: driver.foto || '',
                foto_vehiculo: driver.foto_vehiculo || '',
                tipo_conductor: driver.tipo_conductor || 'interno',
                foto_documento: driver.foto_documento || ''
            });
        }
    }, [driver]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true });
                setVehicleTypes(response.data);
                
                if (isEditing && response.data.length > 0) {
                    const currentVehicle = response.data.find(v => 
                        v.id === driver.tipo_vehiculo_id || v.descript === (driver.tipo_vehiculo || driver.vehiculo)
                    );
                    if (currentVehicle) {
                        setFormData(prev => ({ 
                            ...prev, 
                            tipo_vehiculo_id: currentVehicle.id,
                            vehicleDescript: currentVehicle.descript 
                        }));
                    }
                }
            } catch (err) {
                console.error('Error al cargar tipos de vehículos:', err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchInitialData();
    }, [isEditing, driver]);

    const handleVehicleChange = (e) => {
        const selectedDescript = e.target.value;
        const vehicleObj = vehicleTypes.find(v => v.descript === selectedDescript);
        setFormData(prev => ({
            ...prev,
            vehicleDescript: selectedDescript,
            tipo_vehiculo_id: vehicleObj?.id
        }));
    };

    // 🆕 Lógica actualizada para manejar la tercera foto
    const handleImageUpload = async (file, field) => {
        if (!file) return;
        
        let fieldKey = 'perfil';
        if (field === 'foto_vehiculo') fieldKey = 'vehiculo';
        if (field === 'foto_documento') fieldKey = 'documento';

        setUploading(prev => ({ ...prev, [fieldKey]: true }));
        const data = new FormData();
        data.append("image", file);
        try {
            const res = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, data);
            setFormData(prev => ({ ...prev, [field]: res.data.data.url }));
        } catch (err) {
            alert("Error al subir imagen");
        } finally {
            setUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 🆕 Validación de las 3 fotos obligatorias
        if (!formData.foto || !formData.foto_vehiculo || !formData.foto_documento) {
            return alert("Sube las 3 fotos requeridas (Perfil, Vehículo y Documento).");
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/driver/driver-register-modal`, formData, { withCredentials: true });
            alert(isEditing ? "¡Registro actualizado!" : "¡Registro exitoso!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Error al guardar los datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h3 style={headerStyle}>
                    {isEditing ? 'Editar Registro:' : 'Completar Registro:'} 
                    <span style={{ color: '#333', display: 'block' }}>{driver.nombre}</span>
                </h3>
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    {/* 🆕 CAMPO: Tipo Conductor */}
                    <div>
                        <label style={labelStyle}>Tipo de Conductor</label>
                        <select 
                            style={inputStyle}
                            value={formData.tipo_conductor}
                            onChange={(e) => setFormData({...formData, tipo_conductor: e.target.value})}
                            required
                        >
                            <option value="interno">Conductor Interno (Prioritario)</option>
                            <option value="foraneo">Conductor Foráneo</option>
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Documento de Identidad</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select 
                                style={{ ...inputStyle, width: '35%' }}
                                value={formData.tipo_documento}
                                onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
                            >
                                <option value="CI">CI</option>
                                <option value="Pasaporte">Pasaporte</option>
                                <option value="Licencia">Licencia</option>
                            </select>
                            <input 
                                style={{ ...inputStyle, width: '65%' }}
                                type="text" placeholder="Ej: 25888999" required
                                value={formData.documento_identidad}
                                onChange={(e) => setFormData({...formData, documento_identidad: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Tipo de Vehículo</label>
                        <select 
                            style={inputStyle}
                            value={formData.vehicleDescript}
                            onChange={handleVehicleChange}
                            disabled={isLoadingData}
                            required
                        >
                            <option value="" disabled hidden>Seleccione un vehículo</option>
                            {vehicleTypes.map((v) => (
                                <option key={v.id} value={v.descript}>
                                    {v.descript} (+${v.amount_pay})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 🆕 SECCIÓN DE FOTOS (3 Columnas) */}
                    <div style={photoSectionStyle}>
                        {/* Foto Perfil */}
                        <div style={photoColumnStyle}>
                            <label style={labelStyle}>Foto Perfil</label>
                            <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto')} />
                            <div style={previewBoxStyle}>
                                {uploading.perfil ? <span style={loaderStyle}>...</span> : 
                                 formData.foto ? <img src={formData.foto} style={imgStyle} alt="Perfil" /> : '📷'}
                            </div>
                        </div>

                        {/* Foto Vehículo */}
                        <div style={photoColumnStyle}>
                            <label style={labelStyle}>Foto Vehículo</label>
                            <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto_vehiculo')} />
                            <div style={previewBoxStyle}>
                                {uploading.vehiculo ? <span style={loaderStyle}>...</span> : 
                                 formData.foto_vehiculo ? <img src={formData.foto_vehiculo} style={imgStyle} alt="Vehículo" /> : '🚲'}
                            </div>
                        </div>

                        {/* 🆕 Foto Documento */}
                        <div style={photoColumnStyle}>
                            <label style={labelStyle}>Foto C.I / Doc</label>
                            <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto_documento')} />
                            <div style={previewBoxStyle}>
                                {uploading.documento ? <span style={loaderStyle}>...</span> : 
                                 formData.foto_documento ? <img src={formData.foto_documento} style={imgStyle} alt="Documento" /> : '🪪'}
                            </div>
                        </div>
                    </div>

                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={btnCancelStyle}>Cerrar</button>
                        <button 
                            type="submit" 
                            disabled={loading || uploading.perfil || uploading.vehiculo || uploading.documento || isLoadingData}
                            style={{ 
                                padding: '10px 24px', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: 'bold',
                                border: 'none',
                                color: '#fff',
                                backgroundColor: isEditing ? '#2c3e50' : '#28a745'
                            }}
                        >
                            {loading ? 'Guardando...' : (isEditing ? 'Editar Registro' : 'Finalizar Registro')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Estilos
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '650px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' };
const headerStyle = { color: '#ff4d4d', textAlign: 'center', margin: '0 0 20px 0', fontSize: '1.4rem' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: '800', marginBottom: '6px', color: '#888', textTransform: 'uppercase' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const photoSectionStyle = { display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' };
const photoColumnStyle = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' };
const fileInputStyle = { fontSize: '0.65rem', width: '100%', marginBottom: '5px' };
const previewBoxStyle = { width: '100%', height: '100px', backgroundColor: '#fcfcfc', borderRadius: '12px', border: '2px dashed #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', color: '#ddd', fontSize: '1.8rem', boxSizing: 'border-box' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const loaderStyle = { fontSize: '0.75rem', color: '#ff4d4d', fontWeight: 'bold' };
const footerStyle = { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '20px' };
const btnCancelStyle = { backgroundColor: 'transparent', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#999' };

export default DriverRegisterModal;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 

// const DriverRegisterModal = ({ driver, onClose, onSuccess }) => {
//     const [loading, setLoading] = useState(false);
//     const [uploading, setUploading] = useState({ perfil: false, vehiculo: false });
//     const [vehicleTypes, setVehicleTypes] = useState([]); 
//     const [isLoadingData, setIsLoadingData] = useState(true);

//     const isEditing = !!driver.repartidor_id;

//     const [formData, setFormData] = useState({
//         usuario_id: driver.usuario_id,
//         // Ajustamos estos nombres según lo que suele venir del backend
//         documento_identidad: driver.documento_identidad || driver.cedula || '',
//         tipo_documento: driver.tipo_documento || 'CI',
//         tipo_vehiculo_id: driver.tipo_vehiculo_id || '', 
//         vehicleDescript: driver.tipo_vehiculo || driver.vehiculo || '',   
//         foto: driver.foto || '',
//         foto_vehiculo: driver.foto_vehiculo || ''
//     });

//     // EFECTO CRÍTICO: Si el driver cambia (al abrir el modal), actualizamos el formulario
//     useEffect(() => {
//         if (driver) {
//             setFormData({
//                 usuario_id: driver.usuario_id,
//                 documento_identidad: driver.documento_identidad || driver.cedula || '',
//                 tipo_documento: driver.tipo_documento || 'CI',
//                 tipo_vehiculo_id: driver.tipo_vehiculo_id || '', 
//                 vehicleDescript: driver.tipo_vehiculo || driver.vehiculo || '',   
//                 foto: driver.foto || '',
//                 foto_vehiculo: driver.foto_vehiculo || ''
//             });
//         }
//     }, [driver]);

//     useEffect(() => {
//         const fetchInitialData = async () => {
//             try {
//                 const response = await axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true });
//                 setVehicleTypes(response.data);
                
//                 // Si estamos editando, intentar marcar el vehículo correcto en el select
//                 if (isEditing && response.data.length > 0) {
//                     const currentVehicle = response.data.find(v => 
//                         v.id === driver.tipo_vehiculo_id || v.descript === (driver.tipo_vehiculo || driver.vehiculo)
//                     );
//                     if (currentVehicle) {
//                         setFormData(prev => ({ 
//                             ...prev, 
//                             tipo_vehiculo_id: currentVehicle.id,
//                             vehicleDescript: currentVehicle.descript 
//                         }));
//                     }
//                 }
//             } catch (err) {
//                 console.error('Error al cargar tipos de vehículos:', err);
//             } finally {
//                 setIsLoadingData(false);
//             }
//         };
//         fetchInitialData();
//     }, [isEditing, driver]);

//     const handleVehicleChange = (e) => {
//         const selectedDescript = e.target.value;
//         const vehicleObj = vehicleTypes.find(v => v.descript === selectedDescript);
//         setFormData(prev => ({
//             ...prev,
//             vehicleDescript: selectedDescript,
//             tipo_vehiculo_id: vehicleObj?.id
//         }));
//     };

//     const handleImageUpload = async (file, field) => {
//         if (!file) return;
//         const fieldKey = field === 'foto' ? 'perfil' : 'vehiculo';
//         setUploading(prev => ({ ...prev, [fieldKey]: true }));
//         const data = new FormData();
//         data.append("image", file);
//         try {
//             const res = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, data);
//             setFormData(prev => ({ ...prev, [field]: res.data.data.url }));
//         } catch (err) {
//             alert("Error al subir imagen");
//         } finally {
//             setUploading(prev => ({ ...prev, [fieldKey]: false }));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!formData.foto || !formData.foto_vehiculo) return alert("Sube ambas fotos.");

//         setLoading(true);
//         try {
//             await axios.post(`${API_BASE_URL}/driver/driver-register-modal`, formData, { withCredentials: true });
//             alert(isEditing ? "¡Registro actualizado!" : "¡Registro exitoso!");
//             onSuccess();
//             onClose();
//         } catch (error) {
//             alert("Error al guardar los datos.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div style={modalOverlayStyle}>
//             <div style={modalContentStyle}>
//                 <h3 style={headerStyle}>
//                     {isEditing ? 'Editar Registro:' : 'Completar Registro:'} 
//                     <span style={{ color: '#333', display: 'block' }}>{driver.nombre}</span>
//                 </h3>
                
//                 <form onSubmit={handleSubmit} style={formStyle}>
//                     <div>
//                         <label style={labelStyle}>Documento de Identidad</label>
//                         <div style={{ display: 'flex', gap: '8px' }}>
//                             <select 
//                                 style={{ ...inputStyle, width: '35%' }}
//                                 value={formData.tipo_documento}
//                                 onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
//                             >
//                                 <option value="CI">CI</option>
//                                 <option value="Pasaporte">Pasaporte</option>
//                                 <option value="Licencia">Licencia</option>
//                             </select>
//                             <input 
//                                 style={{ ...inputStyle, width: '65%' }}
//                                 type="text" placeholder="Ej: 25888999" required
//                                 value={formData.documento_identidad}
//                                 onChange={(e) => setFormData({...formData, documento_identidad: e.target.value})} 
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <label style={labelStyle}>Tipo de Vehículo</label>
//                         <select 
//                             style={inputStyle}
//                             value={formData.vehicleDescript}
//                             onChange={handleVehicleChange}
//                             disabled={isLoadingData}
//                             required
//                         >
//                             <option value="" disabled hidden>Seleccione un vehículo</option>
//                             {vehicleTypes.map((v) => (
//                                 <option key={v.id} value={v.descript}>
//                                     {v.descript} (+${v.amount_pay})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div style={photoSectionStyle}>
//                         <div style={photoColumnStyle}>
//                             <label style={labelStyle}>Foto Perfil</label>
//                             <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto')} />
//                             <div style={previewBoxStyle}>
//                                 {uploading.perfil ? <span style={loaderStyle}>...</span> : 
//                                  formData.foto ? <img src={formData.foto} style={imgStyle} alt="Perfil" /> : '📷'}
//                             </div>
//                         </div>
//                         <div style={photoColumnStyle}>
//                             <label style={labelStyle}>Foto Vehículo</label>
//                             <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto_vehiculo')} />
//                             <div style={previewBoxStyle}>
//                                 {uploading.vehiculo ? <span style={loaderStyle}>...</span> : 
//                                  formData.foto_vehiculo ? <img src={formData.foto_vehiculo} style={imgStyle} alt="Vehículo" /> : '🚲'}
//                             </div>
//                         </div>
//                     </div>

//                     <div style={footerStyle}>
//                         <button type="button" onClick={onClose} style={btnCancelStyle}>Cerrar</button>
//                         <button 
//                             type="submit" 
//                             disabled={loading || uploading.perfil || uploading.vehiculo || isLoadingData}
//                             style={{ 
//                                 padding: '10px 24px', 
//                                 borderRadius: '8px', 
//                                 cursor: 'pointer', 
//                                 fontWeight: 'bold',
//                                 border: 'none',
//                                 color: '#fff',
//                                 backgroundColor: isEditing ? '#2c3e50' : '#28a745'
//                             }}
//                         >
//                             {loading ? 'Guardando...' : (isEditing ? 'Editar Registro' : 'Finalizar Registro')}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// // Estilos (se mantienen igual que en tu código original)
// const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' };
// const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' };
// const headerStyle = { color: '#ff4d4d', textAlign: 'center', margin: '0 0 20px 0', fontSize: '1.4rem' };
// const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
// const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: '800', marginBottom: '6px', color: '#888', textTransform: 'uppercase' };
// const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
// const photoSectionStyle = { display: 'flex', gap: '15px', width: '100%', boxSizing: 'border-box' };
// const photoColumnStyle = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' };
// const fileInputStyle = { fontSize: '0.65rem', width: '100%', marginBottom: '5px' };
// const previewBoxStyle = { width: '100%', height: '110px', backgroundColor: '#fcfcfc', borderRadius: '12px', border: '2px dashed #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', color: '#ddd', fontSize: '1.8rem', boxSizing: 'border-box' };
// const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
// const loaderStyle = { fontSize: '0.75rem', color: '#ff4d4d', fontWeight: 'bold' };
// const footerStyle = { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '20px' };
// const btnCancelStyle = { backgroundColor: 'transparent', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#999' };

// export default DriverRegisterModal;

