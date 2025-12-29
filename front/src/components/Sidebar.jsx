
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="sidebar-container">
            <div className="sidebar-menu">
                <h3 className="sidebar-title">Panel {user?.tipo}</h3>
                
                {/* Link común pero con ruta dinámica */}
                <Link to={user?.tipo === 'administrador' ? '/dashboardAdmin' : '/dashboardSupervisor'} className="mi-enlace">
                    📊 Dashboard
                </Link>

                {/* 🛡️ Solo para Administrador */}
                {user?.tipo === 'administrador' && (
                    <>
                        <Link to="/gestion-usuarios" className="mi-enlace">👥 Usuarios</Link>
                        <Link to="/reportes-financieros" className="mi-enlace">💰 Finanzas</Link>
                    </>
                )}

                {/* 🛡️ Para ambos (Admin y Supervisor) */}
                <Link to="/pedidos" className="mi-enlace">📦 Gestión de Pedidos</Link>
                
                <Link to="/profile" className="mi-enlace">👤 Mi Perfil</Link>
            </div>
        </aside>
    );
};
export default Sidebar;

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