import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    // Estado para controlar la visibilidad del submenú
    const [configOpen, setConfigOpen] = useState(false);

    const toggleConfig = () => {
        setConfigOpen(!configOpen);
    };

    return (
        <aside className="sidebar-container">
            <div className="sidebar-menu">
                <h3 className="sidebar-title">Panel {user?.tipo}</h3>
                
                <Link to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} className="enlace-sidebar">
                    📊 Dashboard
                </Link>
                <Link to="/gestion-usuarios" className="enlace-sidebar">Comercios Afiliados</Link>

                {/* 🛡️ Solo para Administrador */}
                {user?.tipo === 'administrador' && (
                    <>
                        <Link to="/gestion-usuarios" className="enlace-sidebar">👥 Usuarios</Link>
                        <Link to="/reportes-financieros" className="enlace-sidebar">💰 Finanzas</Link>
                    </>
                )}

                <Link to="/pedidos" className="enlace-sidebar">📦 Gestión de Pedidos</Link>
                <Link to="/profile" className="enlace-sidebar">👤 Mi Perfil</Link>

                {/* --- SECCIÓN CONFIGURACIÓN CON SUBMENÚ --- */}
                <div className="submenu-container">
                    <button onClick={toggleConfig} className="enlace-sidebar btn-submenu">
                        ⚙️ Configuración {configOpen ? '▲' : '▼'}
                    </button>
                    
                    {configOpen && (
                        <div className="submenu-items" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                            <Link to="/typevehicle" className="enlace-sidebar submenu-link"> Tipo  Vehiculos</Link>
                            <Link to="/typeService" className="enlace-sidebar submenu-link"> Tipo Servicio</Link>

                            {/* Submenú condicional dentro de configuración */}
                            {user?.tipo === 'administrador' && (
                                <>
                                    <Link to="/config/tarifas" className="enlace-sidebar submenu-link">💵 Tarifas de Envío</Link>
                                    <Link to="/config/zonas" className="enlace-sidebar submenu-link">📍 Zonas de Entrega</Link>
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


// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/AuthContext';

// const Sidebar = () => {
//     const { user } = useAuth();

//     return (
//         <aside className="sidebar-container">
//             <div className="sidebar-menu">
//                 <h3 className="sidebar-title">Panel {user?.tipo}</h3>
                
//                 {/* Link común pero con ruta dinámica */}
//                 <Link to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} className="enlace-sidebar">
//                     📊 Dashboard
//                 </Link>

//                 {/* 🛡️ Solo para Administrador */}
//                 {user?.tipo === 'administrador' && (
//                     <>
//                         <Link to="/gestion-usuarios" className="enlace-sidebar">👥 Usuarios</Link>
//                         <Link to="/reportes-financieros" className="enlace-sidebar">💰 Finanzas</Link>
//                     </>
//                 )}

//                 {/* 🛡️ Para ambos (Admin y Supervisor) */}
//                 <Link to="/pedidos" className="enlace-sidebar">📦 Gestión de Pedidos</Link>
                
//                 <Link to="/profile" className="enlace-sidebar">👤 Mi Perfil</Link>
//                 <Link to="/config" className="enlace-sidebar">Configuración</Link>
//             </div>
//         </aside>
//     );
// };
// export default Sidebar;

// // src/components/Sidebar.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/AuthContext';

// const Sidebar = () => {
//     const { user } = useAuth();

//     return (
//         <aside className="sidebar-container">
//             <div className="sidebar-menu">
//                 <h3 className="sidebar-title">Menú Principal</h3>
                
//                 {/* Enlaces dinámicos según rol */}
//                 <Link to={user?.tipo === 'administrador' ? '/DashboardAdmin' : '/DashboardSupervisor'} className="enlace-sidebar">
//                     📊 Dashboard
//                 </Link>
                
//                 {user?.tipo === 'cliente' && (
//                     <Link to="/client/orders" className="enlace-sidebar">📦 Mis Pedidos</Link>
//                 )}

//                 <Link to="/profile" className="enlace-sidebar">👤 Mi Perfil</Link>
//                 <Link to="/settings" className="enlace-sidebar">⚙️ Configuración</Link>
//             </div>
//         </aside>
//     );
// };

// export default Sidebar;