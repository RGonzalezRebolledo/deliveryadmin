import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 

const DriverRegisterModal = ({ driver, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState({ perfil: false, vehiculo: false });
    
    // --- LÓGICA EXTRAÍDA DE ORDERFORM ---
    const [vehicleTypes, setVehicleTypes] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        usuario_id: driver.usuario_id,
        documento_identidad: '',
        tipo_documento: 'CI',
        tipo_vehiculo_id: '', // Se enviará el ID numérico
        vehicleDescript: '',   // Para el manejo del select
        foto: '',
        foto_vehiculo: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Usando el endpoint de utilidades del componente pasado
                const response = await axios.get(`${API_BASE_URL}/utils/vehicle`, { withCredentials: true });
                setVehicleTypes(response.data);
                
                // Inicializar con el primer vehículo si existe
                if (response.data.length > 0) {
                    setFormData(prev => ({ 
                        ...prev, 
                        tipo_vehiculo_id: response.data[0].id,
                        vehicleDescript: response.data[0].descript 
                    }));
                }
            } catch (err) {
                console.error('Error al cargar tipos de vehículos:', err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleVehicleChange = (e) => {
        const selectedDescript = e.target.value;
        // Buscar el objeto original para obtener su ID (Lógica extraída)
        const vehicleObj = vehicleTypes.find(v => v.descript === selectedDescript);
        
        setFormData(prev => ({
            ...prev,
            vehicleDescript: selectedDescript,
            tipo_vehiculo_id: vehicleObj?.id
        }));
    };
    // --- FIN DE LÓGICA EXTRAÍDA ---

    const handleImageUpload = async (file, field) => {
        if (!file) return;
        const fieldKey = field === 'foto' ? 'perfil' : 'vehiculo';
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
        if (!formData.foto || !formData.foto_vehiculo) return alert("Sube ambas fotos.");

        setLoading(true);
        try {
            // Se envía el payload con el tipo_vehiculo_id numérico obtenido del find
            await axios.post(`${API_BASE_URL}/driver/driver-register-modal`, formData, { withCredentials: true });
            alert("¡Registro exitoso!");
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
                    Completar Registro: <span style={{ color: '#333', display: 'block' }}>{driver.nombre}</span>
                </h3>
                
                <form onSubmit={handleSubmit} style={formStyle}>
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
                            <option value="" disabled hidden>
                                {isLoadingData ? "Cargando vehículos..." : "Seleccione un vehículo"}
                            </option>
                            {vehicleTypes.map((v) => (
                                <option key={v.id} value={v.descript}>
                                    {v.descript} (+${v.amount_pay})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={photoSectionStyle}>
                        <div style={photoColumnStyle}>
                            <label style={labelStyle}>Foto Perfil</label>
                            <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto')} />
                            <div style={previewBoxStyle}>
                                {uploading.perfil ? <span style={loaderStyle}>...</span> : 
                                 formData.foto ? <img src={formData.foto} style={imgStyle} /> : '📷'}
                            </div>
                        </div>
                        <div style={photoColumnStyle}>
                            <label style={labelStyle}>Foto Vehículo</label>
                            <input type="file" accept="image/*" style={fileInputStyle} onChange={(e) => handleImageUpload(e.target.files[0], 'foto_vehiculo')} />
                            <div style={previewBoxStyle}>
                                {uploading.vehiculo ? <span style={loaderStyle}>...</span> : 
                                 formData.foto_vehiculo ? <img src={formData.foto_vehiculo} style={imgStyle} /> : '🚲'}
                            </div>
                        </div>
                    </div>

                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={btnCancelStyle}>Cerrar</button>
                        <button 
                            type="submit" 
                            className="btn-success" 
                            disabled={loading || uploading.perfil || uploading.vehiculo || isLoadingData}
                            style={{ padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {loading ? 'Guardando...' : 'Finalizar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Estilos mantenidos exactamente igual para no romper el diseño
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' };
const headerStyle = { color: '#ff4d4d', textAlign: 'center', margin: '0 0 20px 0', fontSize: '1.4rem' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: '800', marginBottom: '6px', color: '#888', textTransform: 'uppercase' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const photoSectionStyle = { display: 'flex', gap: '15px', width: '100%', boxSizing: 'border-box' };
const photoColumnStyle = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' };
const fileInputStyle = { fontSize: '0.65rem', width: '100%', marginBottom: '5px' };
const previewBoxStyle = { width: '100%', height: '110px', backgroundColor: '#fcfcfc', borderRadius: '12px', border: '2px dashed #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', color: '#ddd', fontSize: '1.8rem', boxSizing: 'border-box' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const loaderStyle = { fontSize: '0.75rem', color: '#ff4d4d', fontWeight: 'bold' };
const footerStyle = { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '20px' };
const btnCancelStyle = { backgroundColor: 'transparent', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#999' };

export default DriverRegisterModal;


// import React, { useState } from 'react';
// import axios from 'axios';


// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const DriverRegisterModal = ({ driver, onClose, onSuccess }) => {
//     const [formData, setFormData] = useState({
//         usuario_id: driver.usuario_id,
//         documento_identidad: '',
//         tipo_documento: 'DNI',
//         tipo_vehiculo_id: 1, // Por defecto
//     });


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post(`${API_BASE_URL}/driver/register-interview`, formData, { withCredentials: true });
//             alert("Registro completado con éxito");
//             onSuccess(); // Refresca la lista principal
//             onClose();   // Cierra el modal
//         } catch (error) {
//             alert("Error al completar el registro");
//         }
//     };

//     return (
//         <div style={modalOverlayStyle}>
//             <div style={modalContentStyle}>
//                 <h3>Completar Registro: {driver.nombre}</h3>
//                 <form onSubmit={handleSubmit}>
//                     <div style={{ marginBottom: '15px' }}>
//                         <label>Tipo de Documento:</label>
//                         <select 
//                             style={inputStyle}
//                             value={formData.tipo_documento}
//                             onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
//                         >
//                             <option value="DNI">DNI</option>
//                             <option value="Pasaporte">Pasaporte</option>
//                             <option value="Licencia">Licencia</option>
//                         </select>
//                     </div>

//                     <div style={{ marginBottom: '15px' }}>
//                         <label>Número de Documento:</label>
//                         <input 
//                             style={inputStyle}
//                             type="text" 
//                             required
//                             onChange={(e) => setFormData({...formData, documento_identidad: e.target.value})} 
//                         />
//                     </div>

//                     <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
//                         <button type="button" onClick={onClose} style={btnCancelStyle}>Cancelar</button>
//                         <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>Finalizar Registro</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// // Estilos rápidos para el modal
// const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
// const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
// const inputStyle = { width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' };
// const btnCancelStyle = { backgroundColor: '#eee', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' };

// export default DriverRegisterModal;