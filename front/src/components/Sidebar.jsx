import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    
    // Estados para controlar la visibilidad de los submenús
    const [configOpen, setConfigOpen] = useState(false);
    const [gestionConductoresOpen, setGestionConductoresOpen] = useState(false);

    const toggleConfig = () => {
        setConfigOpen(!configOpen);
    };

    const toggleGestionConductores = () => {
        setGestionConductoresOpen(!gestionConductoresOpen);
    };

    return (
        <aside className="sidebar-container">
            <div className="sidebar-menu">
                <h3 className="sidebar-title">Panel {user?.tipo}</h3>
                
                <Link to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} className="enlace-sidebar">
                    📊 Dashboard
                </Link>
                {/* <Link to="/gestion-usuarios" className="enlace-sidebar">Comercios Afiliados</Link> */}
            
                <Link to="/administrador/AdminClientsList" className="enlace-sidebar">Clientes</Link>
                <Link to="/administrador/AdminActiveOrders" className="enlace-sidebar">Pedidos</Link>
                

                {/* --- SECCIÓN GESTIÓN DE CONDUCTORES CON SUBMENÚ --- */}
                <div className="submenu-container">
                    <button onClick={toggleGestionConductores} className="enlace-sidebar btn-submenu">
                        💳 Gestión de Conductores {gestionConductoresOpen ? '▲' : '▼'}
                    </button>
                    
                    {gestionConductoresOpen && (
                        <div className="submenu-items" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                            <Link to="/administrador/AdminDriversMonitor" className="enlace-sidebar submenu-link">Conductores-Pedidos</Link>
                            <Link to="/conductores/ResumenDrivers" className="enlace-sidebar submenu-link">Conductores</Link>
                            <Link to="/administrador/AdminAvailableDrivers" className="enlace-sidebar submenu-link">Conductores Activos</Link>
                            <Link to="/administrador/LiquidacionPagos" className="enlace-sidebar submenu-link">
                                CxP a Conductores
                            </Link>
                            <Link to="/administrador/HistorialPagosRepartidores" className="enlace-sidebar submenu-link">
                                Historial de Pagos
                            </Link>
                        </div>
                    )}
                </div>
                {/* ------------------------------------------------ */}

                {/* 🛡️ Solo para Administrador */}
                {user?.tipo === 'administrador' && (
                    <>
                        {/* <Link to="/gestion-usuarios" className="enlace-sidebar">👥 Usuarios</Link>
                        <Link to="/reportes-financieros" className="enlace-sidebar">💰 Finanzas</Link> */}
                    </>
                )}

                {/* <Link to="/pedidos" className="enlace-sidebar">📦 Gestión de Pedidos</Link>
                <Link to="/profile" className="enlace-sidebar">👤 Mi Perfil</Link> */}

                {/* --- SECCIÓN CONFIGURACIÓN CON SUBMENÚ --- */}
                <div className="submenu-container">
                    <button onClick={toggleConfig} className="enlace-sidebar btn-submenu">
                        ⚙️ Configuración {configOpen ? '▲' : '▼'}
                    </button>
                    
                    {configOpen && (
                        <div className="submenu-items" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                            <Link to="/typevehicle" className="enlace-sidebar submenu-link"> Tipo Vehiculos</Link>
                            <Link to="/typeService" className="enlace-sidebar submenu-link"> Tipo Servicio</Link>

                            {/* Submenú condicional dentro de configuración */}
                            {user?.tipo === 'administrador' && (
                                <>
                                    {/* <Link to="/config/tarifas" className="enlace-sidebar submenu-link">💵 Tarifas de Envío</Link>
                                    <Link to="/config/zonas" className="enlace-sidebar submenu-link">📍 Zonas de Entrega</Link> */}
                                </>
                            )}
                        </div>
                    )}
                </div>
                {/* ------------------------------------------ */}

            </div>
        </aside>
    );
};

export default Sidebar;

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/AuthContext';

// const Sidebar = () => {
//     const { user } = useAuth();
//     // Estado para controlar la visibilidad del submenú
//     const [configOpen, setConfigOpen] = useState(false);

//     const toggleConfig = () => {
//         setConfigOpen(!configOpen);
//     };

//     return (
//         <aside className="sidebar-container">
//             <div className="sidebar-menu">
//                 <h3 className="sidebar-title">Panel {user?.tipo}</h3>
                
//                 <Link to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} className="enlace-sidebar">
//                     📊 Dashboard
//                 </Link>
//                 {/* <Link to="/gestion-usuarios" className="enlace-sidebar">Comercios Afiliados</Link> */}
//                 <Link to="/conductores/ResumenDrivers" className="enlace-sidebar">Conductores</Link>
//                 <Link to="/administrador/AdminAvailableDrivers" className="enlace-sidebar">Conductores Activos</Link>
//                 <Link to="/administrador/AdminClientsList" className="enlace-sidebar">Clientes</Link>
//                 <Link to="/administrador/AdminActiveOrders" className="enlace-sidebar">Pedidos</Link>
//                 <Link to="/administrador/AdminDriversMonitor" className="enlace-sidebar">Conductores-Pedidos</Link>
//                 <Link to="/administrador/LiquidacionPagos" className="enlace-sidebar">CxP a conductores</Link>
//                 <Link to="/administrador/HistorialPagosRepartidores" className="enlace-sidebar">Historial de Pagos a Conductores</Link>

//                 {/* 🛡️ Solo para Administrador */}
//                 {user?.tipo === 'administrador' && (
//                     <>
//                         {/* <Link to="/gestion-usuarios" className="enlace-sidebar">👥 Usuarios</Link>
//                         <Link to="/reportes-financieros" className="enlace-sidebar">💰 Finanzas</Link> */}
//                     </>
//                 )}

//                 {/* <Link to="/pedidos" className="enlace-sidebar">📦 Gestión de Pedidos</Link>
//                 <Link to="/profile" className="enlace-sidebar">👤 Mi Perfil</Link> */}

//                 {/* --- SECCIÓN CONFIGURACIÓN CON SUBMENÚ --- */}
//                 <div className="submenu-container">
//                     <button onClick={toggleConfig} className="enlace-sidebar btn-submenu">
//                         ⚙️ Configuración {configOpen ? '▲' : '▼'}
//                     </button>
                    
//                     {configOpen && (
//                         <div className="submenu-items" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
//                             <Link to="/typevehicle" className="enlace-sidebar submenu-link"> Tipo  Vehiculos</Link>
//                             <Link to="/typeService" className="enlace-sidebar submenu-link"> Tipo Servicio</Link>

//                             {/* Submenú condicional dentro de configuración */}
//                             {user?.tipo === 'administrador' && (
//                                 <>
//                                     {/* <Link to="/config/tarifas" className="enlace-sidebar submenu-link">💵 Tarifas de Envío</Link>
//                                     <Link to="/config/zonas" className="enlace-sidebar submenu-link">📍 Zonas de Entrega</Link> */}
//                                 </>
//                             )}
//                         </div>
//                     )}
//                 </div>
//                 {/* ------------------------------------------ */}

//             </div>
//         </aside>
//     );
// };

// export default Sidebar;


