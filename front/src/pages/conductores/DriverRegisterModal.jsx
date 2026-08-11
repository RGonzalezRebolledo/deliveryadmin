import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 

const DriverRegisterModal = ({ driver, onClose, onSuccess }) => {
    console.log("1. PROP DRIVER RECIBIDO:", driver);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState({ perfil: false, vehiculo: false, documento: false });
    const [vehicleTypes, setVehicleTypes] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const isEditing = !!driver?.repartidor_id;

    // Normaliza el tipo de conductor a minúsculas
    const normalizeConductorType = (type) => {
        if (!type) return 'interno';
        const val = String(type).toLowerCase().trim();
        return (val === 'foraneo' || val === 'foráneo') ? 'foraneo' : 'interno';
    };

    // Construcción del estado inicial con saneamiento numérico
    const buildInitialFormData = (data) => ({
        usuario_id: data?.usuario_id || data?.id || '',
        telefono: (data?.telefono || data?.phone || '').replace(/\D/g, '').slice(0, 11), // Solo números, máx 11
        documento_identidad: (data?.documento_identidad || data?.cedula || '').replace(/\D/g, '').slice(0, 10), // Solo números
        tipo_documento: data?.tipo_documento || 'CI',
        tipo_vehiculo_id: data?.tipo_vehiculo_id || '', 
        vehicleDescript: data?.tipo_vehiculo || data?.vehiculo || '',   
        foto: data?.foto || data?.foto_perfil || '',
        foto_vehiculo: data?.foto_vehiculo || '',
        tipo_conductor: normalizeConductorType(data?.tipo_conductor || data?.tipo || data?.tipo_repartidor), 
        foto_documento: data?.foto_documento || data?.foto_cedula || data?.foto_doc || data?.documento_foto || ''
    });

    const [formData, setFormData] = useState(() => buildInitialFormData(driver));

    useEffect(() => {
        if (driver) {
            setFormData(buildInitialFormData(driver));
        }
    }, [driver]);

    useEffect(() => {
        let isMounted = true;

        const fetchVehicles = async () => {
            setIsLoadingData(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true });
                const vehicles = response.data || [];

                if (!isMounted) return;
                setVehicleTypes(vehicles);

                if (driver && vehicles.length > 0) {
                    const matchedVehicle = vehicles.find(v => 
                        v.id === driver?.tipo_vehiculo_id || 
                        String(v.descript).toLowerCase() === String(driver?.tipo_vehiculo || driver?.vehiculo).toLowerCase()
                    );

                    if (matchedVehicle) {
                        setFormData(prev => ({
                            ...prev,
                            tipo_vehiculo_id: matchedVehicle.id,
                            vehicleDescript: matchedVehicle.descript
                        }));
                    }
                }
            } catch (err) {
                console.error('Error al cargar tipos de vehículos:', err);
                setErrorMessage('No se pudieron cargar los tipos de vehículos.');
            } finally {
                if (isMounted) setIsLoadingData(false);
            }
        };

        fetchVehicles();

        return () => {
            isMounted = false;
        };
    }, [driver]);

    // MANEJADOR TELÉFONO: Solo dígitos y máx 11 caracteres
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 11) {
            setFormData(prev => ({ ...prev, telefono: value }));
            setErrorMessage('');
        }
    };

    // MANEJADOR DOCUMENTO / CÉDULA: Solo dígitos y máx 10 caracteres
    const handleDocNumberChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setFormData(prev => ({ ...prev, documento_identidad: value }));
            setErrorMessage('');
        }
    };

    const handleVehicleChange = (e) => {
        const selectedDescript = e.target.value;
        const vehicleObj = vehicleTypes.find(v => v.descript === selectedDescript);
        setFormData(prev => ({
            ...prev,
            vehicleDescript: selectedDescript,
            tipo_vehiculo_id: vehicleObj?.id || ''
        }));
    };

    const handleImageUpload = async (file, field) => {
        if (!file) return;
        setErrorMessage('');
        
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
            setErrorMessage("Error al subir la imagen. Por favor intenta de nuevo.");
        } finally {
            setUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!formData.usuario_id) {
            return setErrorMessage("Error: No se ha especificado el ID del usuario.");
        }

        if (!formData.telefono) {
            return setErrorMessage("Por favor ingresa un número de teléfono.");
        }

        if (formData.telefono.length !== 11) {
            return setErrorMessage("El número de teléfono debe tener exactamente 11 dígitos.");
        }

        if (!formData.documento_identidad) {
            return setErrorMessage("Por favor ingresa el número de documento de identidad.");
        }

        if (!formData.foto || !formData.foto_vehiculo || !formData.foto_documento) {
            return setErrorMessage("Sube las 3 fotos requeridas (Perfil, Vehículo y Documento).");
        }

        const { vehicleDescript, ...payload } = formData;

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/driver/driver-register-modal`, payload, { withCredentials: true });
            onSuccess();
            onClose();
        } catch (error) {
            setErrorMessage(error.response?.data?.error || "Error al guardar los datos del repartidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h3 style={headerStyle}>
                    {isEditing ? 'Editar Registro:' : 'Completar Registro:'} 
                    <span style={{ color: '#333', display: 'block' }}>{driver?.nombre}</span>
                </h3>

                {/* BANNER DE ERROR VISUAL */}
                {errorMessage && (
                    <div style={errorBannerStyle}>
                        <span>⚠️ {errorMessage}</span>
                        <button type="button" onClick={() => setErrorMessage('')} style={closeErrorBtnStyle}>×</button>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    {/* CAMPO: Tipo Conductor */}
                    <div>
                        <label style={labelStyle}>Tipo de Conductor</label>
                        <select 
                            style={inputStyle}
                            value={formData.tipo_conductor}
                            onChange={(e) => setFormData(prev => ({ ...prev, tipo_conductor: e.target.value }))}
                            required
                        >
                            <option value="interno">Conductor Interno (Prioritario)</option>
                            <option value="foraneo">Conductor Foráneo</option>
                        </select>
                    </div>

                    {/* CAMPO: Teléfono (Solo números y máx 11 dígitos) */}
                    <div>
                        <label style={labelStyle}>Número de Teléfono (11 dígitos)</label>
                        <input 
                            style={inputStyle}
                            type="text" 
                            inputMode="numeric"
                            placeholder="Ej: 04121234567" 
                            required
                            maxLength={11}
                            value={formData.telefono}
                            onChange={handlePhoneChange} 
                        />
                    </div>

                    {/* CAMPO: Documento de Identidad (Solo números) */}
                    <div>
                        <label style={labelStyle}>Documento de Identidad</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select 
                                style={{ ...inputStyle, width: '35%' }}
                                value={formData.tipo_documento}
                                onChange={(e) => setFormData(prev => ({ ...prev, tipo_documento: e.target.value }))}
                            >
                                <option value="CI">CI</option>
                                <option value="Pasaporte">Pasaporte</option>
                                <option value="Licencia">Licencia</option>
                            </select>
                            <input 
                                style={{ ...inputStyle, width: '65%' }}
                                type="text" 
                                inputMode="numeric"
                                placeholder="Ej: 25888999" 
                                required
                                maxLength={10}
                                value={formData.documento_identidad}
                                onChange={handleDocNumberChange} 
                            />
                        </div>
                    </div>

                    {/* CAMPO: Tipo de Vehículo */}
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

                    {/* SECCIÓN DE FOTOS (3 Columnas) */}
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

                        {/* Foto Documento */}
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
const headerStyle = { color: '#ff4d4d', textAlign: 'center', margin: '0 0 15px 0', fontSize: '1.4rem' };
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

const errorBannerStyle = {
    backgroundColor: '#ffebe9',
    color: '#d93025',
    border: '1px solid #f5c2c7',
    padding: '10px 14px',
    borderRadius: '10px',
    marginBottom: '15px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};
const closeErrorBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#d93025',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: '1'
};

export default DriverRegisterModal;



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 

// const DriverRegisterModal = ({ driver, onClose, onSuccess }) => {
//     console.log("1. PROP DRIVER RECIBIDO:", driver);
//     const [loading, setLoading] = useState(false);
//     const [uploading, setUploading] = useState({ perfil: false, vehiculo: false, documento: false });
//     const [vehicleTypes, setVehicleTypes] = useState([]); 
//     const [isLoadingData, setIsLoadingData] = useState(true);

//     const isEditing = !!driver?.repartidor_id;

//     // Normaliza el tipo de conductor a minúsculas
//     const normalizeConductorType = (type) => {
//         if (!type) return 'interno';
//         const val = String(type).toLowerCase().trim();
//         return (val === 'foraneo' || val === 'foráneo') ? 'foraneo' : 'interno';
//     };

//     // Construcción del estado inicial con fallback para usuario_id / id
//     const buildInitialFormData = (data) => ({
//         usuario_id: data?.usuario_id || data?.id || '',
//         telefono: data?.telefono || data?.phone || '',
//         documento_identidad: data?.documento_identidad || data?.cedula || '',
//         tipo_documento: data?.tipo_documento || 'CI',
//         tipo_vehiculo_id: data?.tipo_vehiculo_id || '', 
//         vehicleDescript: data?.tipo_vehiculo || data?.vehiculo || '',   
//         foto: data?.foto || data?.foto_perfil || '',
//         foto_vehiculo: data?.foto_vehiculo || '',
//         tipo_conductor: normalizeConductorType(data?.tipo_conductor || data?.tipo || data?.tipo_repartidor), 
//         foto_documento: data?.foto_documento || data?.foto_cedula || data?.foto_doc || data?.documento_foto || ''
//     });

//     const [formData, setFormData] = useState(() => buildInitialFormData(driver));

//     useEffect(() => {
//         if (driver) {
//             setFormData(buildInitialFormData(driver));
//         }
//     }, [driver]);

//     useEffect(() => {
//         let isMounted = true;

//         const fetchVehicles = async () => {
//             setIsLoadingData(true);
//             try {
//                 const response = await axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true });
//                 const vehicles = response.data || [];

//                 if (!isMounted) return;
//                 setVehicleTypes(vehicles);

//                 if (driver && vehicles.length > 0) {
//                     const matchedVehicle = vehicles.find(v => 
//                         v.id === driver?.tipo_vehiculo_id || 
//                         String(v.descript).toLowerCase() === String(driver?.tipo_vehiculo || driver?.vehiculo).toLowerCase()
//                     );

//                     if (matchedVehicle) {
//                         setFormData(prev => ({
//                             ...prev,
//                             tipo_vehiculo_id: matchedVehicle.id,
//                             vehicleDescript: matchedVehicle.descript
//                         }));
//                     }
//                 }
//             } catch (err) {
//                 console.error('Error al cargar tipos de vehículos:', err);
//             } finally {
//                 if (isMounted) setIsLoadingData(false);
//             }
//         };

//         fetchVehicles();

//         return () => {
//             isMounted = false;
//         };
//     }, [driver]);

//     const handleVehicleChange = (e) => {
//         const selectedDescript = e.target.value;
//         const vehicleObj = vehicleTypes.find(v => v.descript === selectedDescript);
//         setFormData(prev => ({
//             ...prev,
//             vehicleDescript: selectedDescript,
//             tipo_vehiculo_id: vehicleObj?.id || ''
//         }));
//     };

//     const handleImageUpload = async (file, field) => {
//         if (!file) return;
        
//         let fieldKey = 'perfil';
//         if (field === 'foto_vehiculo') fieldKey = 'vehiculo';
//         if (field === 'foto_documento') fieldKey = 'documento';

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
        
//         if (!formData.usuario_id) {
//             return alert("Error: No se ha especificado el ID del usuario.");
//         }

//         if (!formData.telefono) {
//             return alert("Por favor ingresa un número de teléfono.");
//         }

//         if (!formData.foto || !formData.foto_vehiculo || !formData.foto_documento) {
//             return alert("Sube las 3 fotos requeridas (Perfil, Vehículo y Documento).");
//         }

//         // Se extrae vehicleDescript para limpiar el objeto payload que irá al servidor
//         const { vehicleDescript, ...payload } = formData;

//         setLoading(true);
//         try {
//             await axios.post(`${API_BASE_URL}/driver/driver-register-modal`, payload, { withCredentials: true });
//             alert(isEditing ? "¡Registro actualizado!" : "¡Registro exitoso!");
//             onSuccess();
//             onClose();
//         } catch (error) {
//             alert(error.response?.data?.error || "Error al guardar los datos.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div style={modalOverlayStyle}>
//             <div style={modalContentStyle}>
//                 <h3 style={headerStyle}>
//                     {isEditing ? 'Editar Registro:' : 'Completar Registro:'} 
//                     <span style={{ color: '#333', display: 'block' }}>{driver?.nombre}</span>
//                 </h3>
                
//                 <form onSubmit={handleSubmit} style={formStyle}>
                    
//                     {/* CAMPO: Tipo Conductor */}
//                     <div>
//                         <label style={labelStyle}>Tipo de Conductor</label>
//                         <select 
//                             style={inputStyle}
//                             value={formData.tipo_conductor}
//                             onChange={(e) => setFormData(prev => ({ ...prev, tipo_conductor: e.target.value }))}
//                             required
//                         >
//                             <option value="interno">Conductor Interno (Prioritario)</option>
//                             <option value="foraneo">Conductor Foráneo</option>
//                         </select>
//                     </div>

//                     {/* CAMPO: Teléfono */}
//                     <div>
//                         <label style={labelStyle}>Número de Teléfono</label>
//                         <input 
//                             style={inputStyle}
//                             type="text" 
//                             placeholder="Ej: +584121234567" 
//                             required
//                             value={formData.telefono}
//                             onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} 
//                         />
//                     </div>

//                     {/* CAMPO: Documento de Identidad */}
//                     <div>
//                         <label style={labelStyle}>Documento de Identidad</label>
//                         <div style={{ display: 'flex', gap: '8px' }}>
//                             <select 
//                                 style={{ ...inputStyle, width: '35%' }}
//                                 value={formData.tipo_documento}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, tipo_documento: e.target.value }))}
//                             >
//                                 <option value="CI">CI</option>
//                                 <option value="Pasaporte">Pasaporte</option>
//                                 <option value="Licencia">Licencia</option>
//                             </select>
//                             <input 
//                                 style={{ ...inputStyle, width: '65%' }}
//                                 type="text" placeholder="Ej: 25888999" required
//                                 value={formData.documento_identidad}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, documento_identidad: e.target.value }))} 
//                             />
//                         </div>
//                     </div>

//                     {/* CAMPO: Tipo de Vehículo */}
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

//                     {/* SECCIÓN DE FOTOS (3 Columnas) */}
//                     <div style={photoSectionStyle}>
//                         {/* Foto Perfil */}
//                         <div style={photoColumnStyle}>
//                             <label style={labelStyle}>Foto Perfil</label>
//                             <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto')} />
//                             <div style={previewBoxStyle}>
//                                 {uploading.perfil ? <span style={loaderStyle}>...</span> : 
//                                  formData.foto ? <img src={formData.foto} style={imgStyle} alt="Perfil" /> : '📷'}
//                             </div>
//                         </div>

//                         {/* Foto Vehículo */}
//                         <div style={photoColumnStyle}>
//                             <label style={labelStyle}>Foto Vehículo</label>
//                             <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto_vehiculo')} />
//                             <div style={previewBoxStyle}>
//                                 {uploading.vehiculo ? <span style={loaderStyle}>...</span> : 
//                                  formData.foto_vehiculo ? <img src={formData.foto_vehiculo} style={imgStyle} alt="Vehículo" /> : '🚲'}
//                             </div>
//                         </div>

//                         {/* Foto Documento */}
//                         <div style={photoColumnStyle}>
//                             <label style={labelStyle}>Foto C.I / Doc</label>
//                             <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto_documento')} />
//                             <div style={previewBoxStyle}>
//                                 {uploading.documento ? <span style={loaderStyle}>...</span> : 
//                                  formData.foto_documento ? <img src={formData.foto_documento} style={imgStyle} alt="Documento" /> : '🪪'}
//                             </div>
//                         </div>
//                     </div>

//                     <div style={footerStyle}>
//                         <button type="button" onClick={onClose} style={btnCancelStyle}>Cerrar</button>
//                         <button 
//                             type="submit" 
//                             disabled={loading || uploading.perfil || uploading.vehiculo || uploading.documento || isLoadingData}
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

// // Estilos
// const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' };
// const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '650px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' };
// const headerStyle = { color: '#ff4d4d', textAlign: 'center', margin: '0 0 20px 0', fontSize: '1.4rem' };
// const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
// const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: '800', marginBottom: '6px', color: '#888', textTransform: 'uppercase' };
// const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
// const photoSectionStyle = { display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' };
// const photoColumnStyle = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' };
// const fileInputStyle = { fontSize: '0.65rem', width: '100%', marginBottom: '5px' };
// const previewBoxStyle = { width: '100%', height: '100px', backgroundColor: '#fcfcfc', borderRadius: '12px', border: '2px dashed #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', color: '#ddd', fontSize: '1.8rem', boxSizing: 'border-box' };
// const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
// const loaderStyle = { fontSize: '0.75rem', color: '#ff4d4d', fontWeight: 'bold' };
// const footerStyle = { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '20px' };
// const btnCancelStyle = { backgroundColor: 'transparent', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#999' };

// export default DriverRegisterModal;

