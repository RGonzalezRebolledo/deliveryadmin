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
                
                <Link to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} className="mi-enlace">
                    📊 Dashboard
                </Link>
                <Link to="/gestion-usuarios" className="mi-enlace">Comercios Afiliados</Link>

                {/* 🛡️ Solo para Administrador */}
                {user?.tipo === 'administrador' && (
                    <>
                        <Link to="/gestion-usuarios" className="mi-enlace">👥 Usuarios</Link>
                        <Link to="/reportes-financieros" className="mi-enlace">💰 Finanzas</Link>
                    </>
                )}

                <Link to="/pedidos" className="mi-enlace">📦 Gestión de Pedidos</Link>
                <Link to="/profile" className="mi-enlace">👤 Mi Perfil</Link>

                {/* --- SECCIÓN CONFIGURACIÓN CON SUBMENÚ --- */}
                <div className="submenu-container">
                    <button onClick={toggleConfig} className="mi-enlace btn-submenu">
                        ⚙️ Configuración {configOpen ? '▲' : '▼'}
                    </button>
                    
                    {configOpen && (
                        <div className="submenu-items" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                            <Link to="/typevehicle" className="mi-enlace submenu-link"> Tipo  Vehiculos</Link>
                            <Link to="/config/servicio" className="mi-enlace submenu-link"> Tipo Servicio</Link>

                            {/* Submenú condicional dentro de configuración */}
                            {user?.tipo === 'administrador' && (
                                <>
                                    <Link to="/config/tarifas" className="mi-enlace submenu-link">💵 Tarifas de Envío</Link>
                                    <Link to="/config/zonas" className="mi-enlace submenu-link">📍 Zonas de Entrega</Link>
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
//                 <Link to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} className="mi-enlace">
//                     📊 Dashboard
//                 </Link>

//                 {/* 🛡️ Solo para Administrador */}
//                 {user?.tipo === 'administrador' && (
//                     <>
//                         <Link to="/gestion-usuarios" className="mi-enlace">👥 Usuarios</Link>
//                         <Link to="/reportes-financieros" className="mi-enlace">💰 Finanzas</Link>
//                     </>
//                 )}

//                 {/* 🛡️ Para ambos (Admin y Supervisor) */}
//                 <Link to="/pedidos" className="mi-enlace">📦 Gestión de Pedidos</Link>
                
//                 <Link to="/profile" className="mi-enlace">👤 Mi Perfil</Link>
//                 <Link to="/config" className="mi-enlace">Configuración</Link>
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
//                 <Link to={user?.tipo === 'administrador' ? '/DashboardAdmin' : '/DashboardSupervisor'} className="mi-enlace">
//                     📊 Dashboard
//                 </Link>
                
//                 {user?.tipo === 'cliente' && (
//                     <Link to="/client/orders" className="mi-enlace">📦 Mis Pedidos</Link>
//                 )}

//                 <Link to="/profile" className="mi-enlace">👤 Mi Perfil</Link>
//                 <Link to="/settings" className="mi-enlace">⚙️ Configuración</Link>
//             </div>
//         </aside>
//     );
// };

// export default Sidebar;