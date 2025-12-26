// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="sidebar-container">
            <div className="sidebar-menu">
                <h3 className="sidebar-title">Menú Principal</h3>
                
                {/* Enlaces dinámicos según rol */}
                <Link to={user?.tipo === 'cliente' ? '/client/dashboard' : '/delivery/dashboard'} className="mi-enlace">
                    📊 Dashboard
                </Link>
                
                {user?.tipo === 'cliente' && (
                    <Link to="/client/orders" className="mi-enlace">📦 Mis Pedidos</Link>
                )}

                <Link to="/profile" className="mi-enlace">👤 Mi Perfil</Link>
                <Link to="/settings" className="mi-enlace">⚙️ Configuración</Link>
            </div>
        </aside>
    );
};

export default Sidebar;