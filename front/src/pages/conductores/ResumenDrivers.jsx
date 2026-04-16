import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://delivery-backend-production-c3cb.up.railway.app';

const AdminDriverVerification = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDrivers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/driver/getdrivers`, { withCredentials: true });
            setDrivers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error cargando conductores:", error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    const handleAction = async (driver, actionType) => {
        try {
            let endpoint;
            let payload = {};

            if (actionType === 'registrar') {
                endpoint = `${API_BASE_URL}/driver/register-interview`;
                payload = { usuario_id: driver.usuario_id, is_active: 'activo' };
            } else {
                endpoint = `${API_BASE_URL}/driver/update-status`;
                payload = { 
                    usuario_id: driver.usuario_id, 
                    is_active: actionType === 'activar' ? 'activo' : 'suspendido' 
                };
            }

            await axios.post(endpoint, payload, { withCredentials: true });
            alert(`Operación exitosa: ${actionType}`);
            fetchDrivers(); 
        } catch (error) {
            alert("Error al procesar la solicitud");
        }
    };

    // if (loading) return <div className="p-10 text-center font-sans text-gray-500">Cargando Conductores de Gazella...</div>;

    return (
        <div className="content-area">
            <div className="admin-table-container">
                <div style={{ 
                    padding: 'var(--spacing-lg)', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Gestión de Conductores</h2>
                    {/* LÍNEA CON LA CANTIDAD DE CONDUCTORES */}
                    <span style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--color-primary)', 
                        backgroundColor: '#f5f5f5', 
                        padding: '4px 12px', 
                        borderRadius: '15px',
                        fontWeight: '500'
                    }}>
                        Total conductores: <strong>{drivers.length}</strong>
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Contacto</th>
                                <th style={{ textAlign: 'center' }}>Estatus</th>
                                <th style={{ textAlign: 'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((d) => {
                                const esNuevo = !d.repartidor_id;
                                const esSuspendido = d.is_active === 'suspendido';
                                const esActivo = d.is_active === 'activo';

                                return (
                                    <tr key={d.usuario_id}>
                                        <td><strong>{d.nombre}</strong></td>
                                        <td style={{ fontSize: '0.85rem' }}>{d.email}</td>
                                        <td style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>
                                            {d.telefono || 'N/A'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                backgroundColor: esNuevo ? '#f0f0f0' : (esSuspendido ? '#ffebee' : '#e8f5e9'),
                                                color: esNuevo ? '#666' : (esSuspendido ? '#c62828' : '#2e7d32')
                                            }}>
                                                {esNuevo ? 'PENDIENTE' : d.is_active}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {esNuevo && (
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ fontSize: '0.7rem', padding: '6px 12px' }}
                                                    onClick={() => handleAction(d, 'registrar')}
                                                >
                                                    Registrar
                                                </button>
                                            )}
                                            {esActivo && (
                                                <button 
                                                    style={{ 
                                                        fontSize: '0.7rem', padding: '6px 12px',
                                                        backgroundColor: '#f44336', color: 'white', 
                                                        borderRadius: 'var(--radius-sm)', border: 'none',
                                                        cursor: 'pointer', fontWeight: 'bold'
                                                    }}
                                                    onClick={() => handleAction(d, 'suspender')}
                                                >
                                                    Suspender
                                                </button>
                                            )}
                                            {esSuspendido && (
                                                <button 
                                                    className="btn-success"
                                                    style={{ fontSize: '0.7rem', padding: '6px 12px' }}
                                                    onClick={() => handleAction(d, 'activar')}
                                                >
                                                    Activar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {drivers.length === 0 && (
                    <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: '#999' }}>
                        No hay repartidores registrados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDriverVerification;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API_BASE_URL = 'https://delivery-backend-production-c3cb.up.railway.app';

// const AdminDriverVerification = () => {
//     const [pendingDrivers, setPendingDrivers] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchPendingDrivers = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/driver/getdrivers`, {
//                 withCredentials: true
//             });
//             setPendingDrivers(response.data);
//             setLoading(false);
//         } catch (error) {
//             console.error("Error cargando repartidores:", error);
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchPendingDrivers();
//     }, []);

//     const handleVerify = async (usuarioId) => {
//         try {
//             await axios.patch(`${API_BASE_URL}/driver/verify/${usuarioId}`, {}, {
//                 withCredentials: true
//             });
//             setPendingDrivers(prev => prev.filter(d => d.usuario_id !== usuarioId));
//             alert("Aspirante procesado exitosamente");
//         } catch (error) {
//             alert("Error al procesar el aspirante");
//         }
//     };

//     if (loading) return <div className="p-10 text-center text-gray-500">Cargando lista de aspirantes...</div>;

//     return (
//         <div className="content-area">
//             <div className="admin-table-container">
//                 {/* Cabecera del Panel */}
//                 <div style={{ 
//                     padding: 'var(--spacing-lg)', 
//                     display: 'flex', 
//                     justifyContent: 'between', 
//                     alignItems: 'center',
//                     borderBottom: '1px solid #eee'
//                 }}>
//                     <h2 style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
//                         Conductores
//                     </h2>
//                     <span style={{ 
//                         marginLeft: 'auto',
//                         backgroundColor: '#fff3f3', 
//                         color: 'var(--color-primary)', 
//                         padding: '4px 12px', 
//                         borderRadius: '20px', 
//                         fontSize: '0.8rem', 
//                         fontWeight: 'bold' 
//                     }}>
//                         {pendingDrivers.length} Pendientes Por Registro
//                     </span>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="admin-table">
//                         <thead>
//                             <tr>
//                                 <th>Nombre del Aspirante</th>
//                                 <th>Correo Electrónico</th>
//                                 <th>Telefono</th>
//                                 <th>Fecha de Registro</th>
//                                 <th style={{ textAlign: 'center' }}>Acciones</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {pendingDrivers.map((aspirante) => (
//                                 <tr key={aspirante.usuario_id}>
//                                     <td>
//                                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                                             <div style={{
//                                                 width: '35px', 
//                                                 height: '35px', 
//                                                 borderRadius: '50%', 
//                                                 backgroundColor: 'var(--color-primary)', 
//                                                 color: 'white',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center',
//                                                 fontSize: '14px',
//                                                 fontWeight: 'bold'
//                                             }}>
//                                                 {aspirante.nombre.charAt(0).toUpperCase()}
//                                             </div>
//                                             <span style={{ fontWeight: '600' }}>{aspirante.nombre}</span>
//                                         </div>
//                                     </td>
//                                     <td style={{ color: '#666' }}>{aspirante.email}</td>
//                                     <td style={{ color: '#666' }}>{aspirante.telefono}</td>
//                                     <td style={{ color: '#888' }}>
//                                         {aspirante.created_at 
//                                             ? new Date(aspirante.created_at).toLocaleDateString() 
//                                             : 'Pendiente'}
//                                     </td>
//                                     <td style={{ textAlign: 'center' }}>
//                                         <button 
//                                             className="btn-primary"
//                                             style={{ 
//                                                 padding: '8px 16px', 
//                                                 fontSize: '0.8rem',
//                                                 borderRadius: 'var(--radius-sm)' 
//                                             }}
//                                             onClick={() => handleVerify(aspirante.usuario_id)}
//                                         >
//                                             Iniciar Entrevista
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Estado Vacío */}
//                 {pendingDrivers.length === 0 && (
//                     <div style={{ 
//                         padding: 'var(--spacing-xl)', 
//                         textAlign: 'center', 
//                         color: '#999' 
//                     }}>
//                         <p>No hay nuevos conductores registrados en la plataforma.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AdminDriverVerification;

