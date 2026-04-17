
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DriverRegisterModal from './DriverRegisterModal'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDriverVerification = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

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

    const handleOpenRegister = (driver) => {
        setSelectedDriver(driver);
        setShowModal(true);
    };

    // Función unificada que decide el endpoint según la acción
    const handleAction = async (driver, actionType) => {
        const confirmMsg = actionType === 'activar' 
            ? `¿Deseas activar a ${driver.nombre}?` 
            : `¿Estás seguro de suspender a ${driver.nombre}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            // BACKEND SEPARADO: Endpoint dinámico
            const endpoint = actionType === 'suspender' 
                ? `${API_BASE_URL}/driver/suspend-driver` 
                : `${API_BASE_URL}/driver/activate-driver`; 

            const payload = { usuario_id: driver.usuario_id };

            // Usamos PUT para actualizaciones de estado
            await axios.put(endpoint, payload, { withCredentials: true });
            
            alert(`Conductor ${actionType === 'activar' ? 'activado' : 'suspendido'} con éxito`);
            fetchDrivers(); 
        } catch (error) {
            console.error("Error en handleAction:", error);
            alert(error.response?.data?.error || "Error al procesar la solicitud");
        }
    };

    return (
        <div className="content-area">
            {showModal && (
                <DriverRegisterModal 
                    driver={selectedDriver} 
                    onClose={() => setShowModal(false)} 
                    onSuccess={fetchDrivers} 
                />
            )}

            <div className="admin-table-container">
                <div style={{ 
                    padding: 'var(--spacing-lg)', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Gestión de Conductores</h2>
                    
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
                                <th style={{ textAlign: 'left' }}>Nombre</th>
                                <th style={{ textAlign: 'left' }}>Email</th>
                                <th style={{ textAlign: 'center' }}>Contacto</th>
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
                                        <td style={{ fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>
                                            {d.telefono || 'N/A'}
                                        </td>
                                        
                                        {/* COLUMNA ESTATUS COMPACTA */}
                                        <td style={{ textAlign: 'center', width: '1%', whiteSpace: 'nowrap' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '5px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                display: 'inline-block',
                                                minWidth: '85px',
                                                textAlign: 'center',
                                                border: '1px solid #ccc',
                                                backgroundColor: esNuevo ? '#f0f0f0' : (esSuspendido ? '#ffebee' : '#e8f5e9'),
                                                color: esNuevo ? '#666' : (esSuspendido ? '#c62828' : '#2e7d32')
                                            }}>
                                                {esNuevo ? 'PENDIENTE' : d.is_active}
                                            </span>
                                        </td>

                                        {/* COLUMNA ACCIÓN COMPACTA */}
                                        <td style={{ textAlign: 'center', width: '1%', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                {esNuevo && (
                                                    <button 
                                                        className="btn-success" 
                                                        style={{ fontSize: '0.7rem', borderRadius: '5px', padding: '6px 12px', minWidth: '90px' }}
                                                        onClick={() => handleOpenRegister(d)}
                                                    >
                                                        Registrar
                                                    </button>
                                                )}

                                                {esActivo && (
                                                    <button
                                                        className="btn-primary"
                                                        style={{ fontSize: '0.7rem', borderRadius: '5px', padding: '6px 12px', minWidth: '90px' }}
                                                        onClick={() => handleAction(d, 'suspender')}
                                                    >
                                                        Suspender
                                                    </button>
                                                )}

                                                {esSuspendido && (
                                                    <button 
                                                        className="btn-success"
                                                        // style={{ fontSize: '0.7rem', borderRadius: '5px', padding: '6px 12px', minWidth: '90px' }}
                                                        style={{ 
                                                            fontSize: '0.7rem', 
                                                            borderRadius: '5px', 
                                                            padding: '6px 12px', 
                                                            minWidth: '90px',
                                                            backgroundColor: '#00BFFF', // Tu color secundario
                                                            borderColor: '#00BFFF',     // Para que el borde coincida
                                                            color: '#fff',               // Texto blanco para que resalte
                                                            fontWeight: 'bold'
                                                        }}
                                                        onClick={() => handleAction(d, 'activar')}
                                                    >
                                                        Activar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {drivers.length === 0 && !loading && (
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
// import DriverRegisterModal from './DriverRegisterModal'; // Importamos el nuevo componente

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AdminDriverVerification = () => {
//     const [drivers, setDrivers] = useState([]);
//     const [loading, setLoading] = useState(true);
    
//     // Estados para el control del Modal
//     const [showModal, setShowModal] = useState(false);
//     const [selectedDriver, setSelectedDriver] = useState(null);

//     const fetchDrivers = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/driver/getdrivers`, { withCredentials: true });
//             setDrivers(response.data);
//             setLoading(false);
//         } catch (error) {
//             console.error("Error cargando conductores:", error);
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchDrivers(); }, []);

//     // Función para abrir el modal de registro
//     const handleOpenRegister = (driver) => {
//         setSelectedDriver(driver);
//         setShowModal(true);
//     };

//     // Maneja acciones simples (activar/suspender) que no requieren datos extra
//     const handleAction = async (driver, actionType) => {
//         try {
//             const endpoint = `${API_BASE_URL}/driver/update-status`;
//             const payload = { 
//                 usuario_id: driver.usuario_id, 
//                 is_active: actionType === 'activar' ? 'activo' : 'suspendido' 
//             };

//             await axios.post(endpoint, payload, { withCredentials: true });
//             alert(`Conductor ${actionType === 'activar' ? 'activado' : 'suspendido'} con éxito`);
//             fetchDrivers(); 
//         } catch (error) {
//             alert("Error al procesar la solicitud");
//         }
//     };

//     // if (loading) return <div className="p-10 text-center font-sans text-gray-500">Cargando flota de Gazzella...</div>;

//     return (
//         <div className="content-area">
//             {/* RENDERIZADO CONDICIONAL DEL MODAL */}
//             {showModal && (
//                 <DriverRegisterModal 
//                     driver={selectedDriver} 
//                     onClose={() => setShowModal(false)} 
//                     onSuccess={fetchDrivers} 
//                 />
//             )}

//             <div className="admin-table-container">
//                 <div style={{ 
//                     padding: 'var(--spacing-lg)', 
//                     borderBottom: '1px solid #eee',
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center'
//                 }}>
//                     <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Gestión de Conductores</h2>
                    
//                     <span style={{ 
//                         fontSize: '0.9rem', 
//                         color: 'var(--color-primary)', 
//                         backgroundColor: '#f5f5f5', 
//                         padding: '4px 12px', 
//                         borderRadius: '15px',
//                         fontWeight: '500'
//                     }}>
//                         Total conductores: <strong>{drivers.length}</strong>
//                     </span>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="admin-table">
//                         <thead>
//                             <tr>
//                                 <th style={{ textAlign: 'center' }}>Nombre</th>
//                                 <th style={{ textAlign: 'center' }}>Email</th>
//                                 <th style={{ textAlign: 'center' }}>Contacto</th>
//                                 <th style={{ textAlign: 'center' }}>Estatus</th>
//                                 <th style={{ textAlign: 'center' }}>Acción</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {drivers.map((d) => {
//                                 const esNuevo = !d.repartidor_id;
//                                 const esSuspendido = d.is_active === 'suspendido';
//                                 const esActivo = d.is_active === 'activo';

//                                 return (
//                                     <tr key={d.usuario_id}>
//                                         <td><strong>{d.nombre}</strong></td>
//                                         <td style={{ fontSize: '0.85rem' }}>{d.email}</td>
//                                         <td style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>
//                                             {d.telefono || 'N/A'}
//                                         </td>
//                                         <td style={{ textAlign: 'center' , width: '1%', whiteSpace: 'nowrap', padding: '2px' }}>
//                                         <span style={{
//                                         padding: '6px 12px',
//                                         borderRadius: '5px',
//                                         fontSize: '10px',
//                                         fontWeight: 'bold',
//                                         textTransform: 'uppercase',
//                                         display: 'inline-block', // Para que respete el minWidth
//                                         minWidth: '85px',       // Ajusta según el largo de "PENDIENTE"
//                                         textAlign: 'center',    // Centra el texto dentro del badge
    
//                                         // --- BORDE FIJO ---
//                                         //border: '1px solid #ccc', // Un gris suave que queda bien con rojo, verde o gris
    
//                                         // Colores de fondo y texto dinámicos
//                                         backgroundColor: esNuevo ? '#f0f0f0' : (esSuspendido ? '#ffebee' : '#e8f5e9'),
//                                         color: esNuevo ? '#666' : (esSuspendido ? '#c62828' : '#2e7d32')
//                                         }}>
//                                         {esNuevo ? 'PENDIENTE' : d.is_active}
//                                         </span>
//                                         </td>
//                                         <td style={{ textAlign: 'center' }}>
//                                             {/* BOTÓN REGISTRAR: Ahora abre el Modal */}
//                                             {esNuevo && (
//                                                 <button 
//                                                     className="btn-success" 
//                                                     style={{ fontSize: '0.7rem', borderRadius: '5px', padding: '8px 14px', minWidth: '90px' }}
//                                                     onClick={() => handleOpenRegister(d)}
//                                                 >
//                                                     Registrar
//                                                 </button>
//                                             )}

//                                             {/* BOTÓN SUSPENDER */}
//                                             {esActivo && (
//                                                 <button
//                                                 className="btn-primary"
//                                                 style={{ fontSize: '0.7rem', borderRadius: '5px', padding: '8px 14px', minWidth: '90px' }}

//                                                     onClick={() => handleAction(d, 'suspender')}
//                                                 >
//                                                     Suspender
//                                                 </button>
//                                             )}

//                                             {/* BOTÓN ACTIVAR */}
//                                             {esSuspendido && (
//                                                 <button 
//                                                     className="btn-success"
//                                                     style={{ fontSize: '0.7rem', borderRadius: '5px', padding: '6px 12px' }}
//                                                     onClick={() => handleAction(d, 'activar')}
//                                                 >
//                                                     Activar
//                                                 </button>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>

//                 {drivers.length === 0 && (
//                     <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: '#999' }}>
//                         No hay repartidores registrados.
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AdminDriverVerification;

