import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [configOpen, setConfigOpen] = useState(false);
    const [gestionConductoresOpen, setGestionConductoresOpen] = useState(false);
    const [serviciosOpen, setServiciosOpen] = useState(false); // Estado para el submenú de Servicios

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const handleLinkClick = () => setIsCollapsed(true);
    const toggleConfig = () => setConfigOpen(!configOpen);
    const toggleGestionConductores = () => setGestionConductoresOpen(!gestionConductoresOpen);
    const toggleServicios = () => setServiciosOpen(!serviciosOpen);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            {/* Pestaña Flotante Perfectamente Encajada */}
            <button 
                className="sidebar-toggle-btn" 
                onClick={toggleSidebar}
                type="button"
                aria-label={isCollapsed ? 'Desplegar menú' : 'Plegar menú'}
            >
                <svg 
                    className={`toggle-icon ${isCollapsed ? '' : 'rotated'}`}
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#FF5A5F" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            <div className="sidebar-menu">
                <h3 className="sidebar-title">
                    Panel {user?.tipo}
                </h3>
                
                <Link 
                    to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} 
                    className={`enlace-sidebar ${isActive('/dashboardAdmin')} ${isActive('/dashboardSupervisor')}`}
                    onClick={handleLinkClick}
                >
                    <span>📊 Dashboard</span>
                </Link>

                <Link 
                    to="/administrador/AdminClientsList" 
                    className={`enlace-sidebar ${isActive('/administrador/AdminClientsList')}`}
                    onClick={handleLinkClick}
                >
                    <span>👥 Clientes</span>
                </Link>

                {/* Submenú Servicios */}
                <div className="submenu-container">
                    <button onClick={toggleServicios} className="enlace-sidebar btn-submenu" type="button">
                        <span>📦 Servicios</span>
                        <svg 
                            className={`sidebar-chevron-svg ${serviciosOpen ? 'open' : ''}`} 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    
                    {serviciosOpen && (
                        <div className="submenu-items">
                            <Link 
                                to="/administrador/AdminActiveOrders" 
                                className={`enlace-sidebar submenu-link ${isActive('/administrador/AdminActiveOrders')}`} 
                                onClick={handleLinkClick}
                            >
                                Servicios En Curso
                            </Link>
                            <Link 
                                to="/administrador/ServiciosRealizados" 
                                className={`enlace-sidebar submenu-link ${isActive('/administrador/ServiciosRealizados')}`} 
                                onClick={handleLinkClick}
                            >
                                Servicios Realizados
                            </Link>
                        </div>
                    )}
                </div>

                {/* Submenú Gestión Conductores */}
                <div className="submenu-container">
                    <button onClick={toggleGestionConductores} className="enlace-sidebar btn-submenu" type="button">
                        <span>💳 Gestión Conductores</span>
                        <svg 
                            className={`sidebar-chevron-svg ${gestionConductoresOpen ? 'open' : ''}`} 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    
                    {gestionConductoresOpen && (
                        <div className="submenu-items">
                            <Link 
                                to="/administrador/AdminDriversMonitor" 
                                className={`enlace-sidebar submenu-link ${isActive('/administrador/AdminDriversMonitor')}`} 
                                onClick={handleLinkClick}
                            >
                                Conductores-Pedidos
                            </Link>
                            <Link 
                                to="/conductores/ResumenDrivers" 
                                className={`enlace-sidebar submenu-link ${isActive('/conductores/ResumenDrivers')}`} 
                                onClick={handleLinkClick}
                            >
                                Conductores General
                            </Link>
                            <Link 
                                to="/conductores/ResumenType" 
                                className={`enlace-sidebar submenu-link ${isActive('/conductores/ResumenType')}`} 
                                onClick={handleLinkClick}
                            >
                                Conductores Registrados
                            </Link>
                            <Link 
                                to="/administrador/AdminAvailableDrivers" 
                                className={`enlace-sidebar submenu-link ${isActive('/administrador/AdminAvailableDrivers')}`} 
                                onClick={handleLinkClick}
                            >
                                Conductores Activos
                            </Link>
                            <Link 
                                to="/administrador/LiquidacionPagos" 
                                className={`enlace-sidebar submenu-link ${isActive('/administrador/LiquidacionPagos')}`} 
                                onClick={handleLinkClick}
                            >
                                CxP a Conductores
                            </Link>
                            <Link 
                                to="/administrador/HistorialPagosRepartidores" 
                                className={`enlace-sidebar submenu-link ${isActive('/administrador/HistorialPagosRepartidores')}`} 
                                onClick={handleLinkClick}
                            >
                                Historial de Pagos
                            </Link>
                        </div>
                    )}
                </div>

                {/* Submenú Configuración */}
                <div className="submenu-container">
                    <button onClick={toggleConfig} className="enlace-sidebar btn-submenu" type="button">
                        <span>⚙️ Configuración</span>
                        <svg 
                            className={`sidebar-chevron-svg ${configOpen ? 'open' : ''}`} 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    
                    {configOpen && (
                        <div className="submenu-items">
                            <Link to="/typevehicle" className={`enlace-sidebar submenu-link ${isActive('/typevehicle')}`} onClick={handleLinkClick}>Tipo Vehículos</Link>
                            <Link to="/typeService" className={`enlace-sidebar submenu-link ${isActive('/typeService')}`} onClick={handleLinkClick}>Tipo Servicio</Link>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;


// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../hooks/AuthContext';

// const Sidebar = () => {
//     const { user } = useAuth();
//     const location = useLocation();

//     const [isCollapsed, setIsCollapsed] = useState(true);
//     const [configOpen, setConfigOpen] = useState(false);
//     const [gestionConductoresOpen, setGestionConductoresOpen] = useState(false);

//     const toggleSidebar = () => setIsCollapsed(!isCollapsed);
//     const handleLinkClick = () => setIsCollapsed(true);
//     const toggleConfig = () => setConfigOpen(!configOpen);
//     const toggleGestionConductores = () => setGestionConductoresOpen(!gestionConductoresOpen);

//     const isActive = (path) => location.pathname === path ? 'active' : '';

//     return (
//         <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : 'expanded'}`}>
//             {/* Pestaña Flotante Perfectamente Encajada */}
//             <button
//                 className="sidebar-toggle-btn"
//                 onClick={toggleSidebar}
//                 type="button"
//                 aria-label={isCollapsed ? 'Desplegar menú' : 'Plegar menú'}
//             >
//                 <svg
//                     className={`toggle-icon ${isCollapsed ? '' : 'rotated'}`}
//                     width="18"
//                     height="18"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#FF5A5F"
//                     strokeWidth="3"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                 >
//                     <polyline points="9 18 15 12 9 6"></polyline>
//                 </svg>
//             </button>

//             <div className="sidebar-menu">
//                 <h3 className="sidebar-title">
//                     Panel {user?.tipo}
//                 </h3>

//                 <Link
//                     to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'}
//                     className={`enlace-sidebar ${isActive('/dashboardAdmin')} ${isActive('/dashboardSupervisor')}`}
//                     onClick={handleLinkClick}
//                 >
//                     <span>📊 Dashboard</span>
//                 </Link>

//                 <Link
//                     to="/administrador/AdminClientsList"
//                     className={`enlace-sidebar ${isActive('/administrador/AdminClientsList')}`}
//                     onClick={handleLinkClick}
//                 >
//                     <span>👥 Clientes</span>
//                 </Link>

//                 <Link
//                     to="/administrador/AdminActiveOrders"
//                     className={`enlace-sidebar ${isActive('/administrador/AdminActiveOrders')}`}
//                     onClick={handleLinkClick}
//                 >
//                     <span>📦 Servicios En Curso</span>
//                 </Link>

//                 <div className="submenu-container">
//                     <button onClick={toggleGestionConductores} className="enlace-sidebar btn-submenu" type="button">
//                         <span>💳 Gestión Conductores</span>
//                         <svg
//                             className={`sidebar-chevron-svg ${gestionConductoresOpen ? 'open' : ''}`}
//                             width="16"
//                             height="16"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                         >
//                             <polyline points="6 9 12 15 18 9"></polyline>
//                         </svg>
//                     </button>

//                     {gestionConductoresOpen && (
//     <div className="submenu-items">
//         <Link
//             to="/administrador/AdminDriversMonitor"
//             className={`enlace-sidebar submenu-link ${isActive('/administrador/AdminDriversMonitor')}`}
//             onClick={handleLinkClick}
//         >
//             Conductores-Pedidos
//         </Link>
//         <Link
//             to="/conductores/ResumenDrivers"
//             className={`enlace-sidebar submenu-link ${isActive('/conductores/ResumenDrivers')}`}
//             onClick={handleLinkClick}
//         >
//             Conductores General
//         </Link>
//         <Link
//             to="/conductores/ResumenType"
//             className={`enlace-sidebar submenu-link ${isActive('/conductores/ResumenType')}`}
//             onClick={handleLinkClick}
//         >
//             Conductores Registrados
//         </Link>
//         <Link
//             to="/administrador/AdminAvailableDrivers"
//             className={`enlace-sidebar submenu-link ${isActive('/administrador/AdminAvailableDrivers')}`}
//             onClick={handleLinkClick}
//         >
//             Conductores Activos
//         </Link>
//         <Link
//             to="/administrador/LiquidacionPagos"
//             className={`enlace-sidebar submenu-link ${isActive('/administrador/LiquidacionPagos')}`}
//             onClick={handleLinkClick}
//         >
//             CxP a Conductores
//         </Link>
//         <Link
//             to="/administrador/HistorialPagosRepartidores"
//             className={`enlace-sidebar submenu-link ${isActive('/administrador/HistorialPagosRepartidores')}`}
//             onClick={handleLinkClick}
//         >
//             Historial de Pagos
//         </Link>
//     </div>
// )}
//                 </div>

//                 <div className="submenu-container">
//                     <button onClick={toggleConfig} className="enlace-sidebar btn-submenu" type="button">
//                         <span>⚙️ Configuración</span>
//                         <svg
//                             className={`sidebar-chevron-svg ${configOpen ? 'open' : ''}`}
//                             width="16"
//                             height="16"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                         >
//                             <polyline points="6 9 12 15 18 9"></polyline>
//                         </svg>
//                     </button>

//                     {configOpen && (
//                         <div className="submenu-items">
//                             <Link to="/typevehicle" className={`enlace-sidebar submenu-link ${isActive('/typevehicle')}`} onClick={handleLinkClick}>Tipo Vehículos</Link>
//                             <Link to="/typeService" className={`enlace-sidebar submenu-link ${isActive('/typeService')}`} onClick={handleLinkClick}>Tipo Servicio</Link>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </aside>
//     );
// };

// export default Sidebar;
