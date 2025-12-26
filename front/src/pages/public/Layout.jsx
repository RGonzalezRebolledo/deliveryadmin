
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar'; 
import Sidebar from '../../components/Sidebar'; // Nuevo
import { useAuth } from '../../hooks/AuthContext';
import '../../App.css';

const Layout = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="app-container">
            {/* 💡 Navbar siempre arriba */}
            <Navbar /> 
            
            <div className={`layout-body ${isAuthenticated && user ? 'has-sidebar' : ''}`}>
                {/* 💡 Sidebar solo si hay sesión */}
                {isAuthenticated && user && <Sidebar />}
                
                {/* 💡 Contenido de las rutas */}
                <main className="content-area">
                    <div className="app-container">
                        <Outlet /> 
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;


// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import Navbar from '../../components/Navbar'; // Ajusta la ruta si es necesario
// import '../../App.css';

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const Layout = () => {
//   return (
//     <div className="app-container">
//       {/* 💡 1. Navbar se renderiza siempre en la parte superior */}
//       <Navbar /> 
      
//       {/* 💡 2. Outlet renderiza el componente de la ruta actual */}
//       <div> 
//         <Outlet /> 
//       </div>
      
//       {/* Opcional: Footer aquí */}
//     </div>
//   );
// };

// export default Layout;