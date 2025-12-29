// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'; 

// Importar Layout y componentes de ruta
import Layout from './pages/public/Layout.jsx'; 
import Home from './pages/public/Home.jsx'; 
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import DashboardAdmin from './pages/administrador/dashboardAdmin.jsx';

// 💡 IMPORTACIONES DE PROTECCIÓN
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import PublicRoute from './components/PublicRoute.jsx'; // 💡 Importar el nuevo componente

import './styles/main.css';
import { AuthProvider } from './hooks/AuthContext.jsx'; 

// Definición de las rutas con la estructura anidada
const router = createBrowserRouter([
  {
    // RUTA PADRE PRINCIPAL: Siempre renderiza el Navbar y el Outlet del router
    path: "/",
    element: <Layout />,
    errorElement: <h2>404 - Página no encontrada</h2>,
    children: [
      
      // ------------------------------------------------------------------
      // 💡 GRUPO DE RUTAS PÚBLICAS PROTEGIDAS CONTRA USUARIOS LOGUEADOS
      // ------------------------------------------------------------------
      {
        // PublicRoute actúa como guardia: si el usuario está logueado, lo saca de aquí.
        element: <PublicRoute />, 
        children: [
          // Home
          {
            index: true, 
            element: <Home />,
          },
          // Login
          {
            path: "public/login", 
            element: <Login />,
          },
          // Register
          {
            path: "Register", 
            element: <Register />,
          },
        ]
      },

      // Ruta para errores de permisos (403)
      {
        path: "unauthorized",
        element: <h2>403 - Acceso no autorizado</h2>,
      },
      
      // ------------------------------------------------------------------
      // GRUPO DE RUTAS PROTEGIDAS PARA administrador (Rol: 'administrador')
      // ------------------------------------------------------------------
      {
        element: <ProtectedRoute allowedRoles={['administrador']} />,
        children: [
          {
            path: "dashboardAdmin", // Sin "/" inicial si es hijo, corregido typo
            element: <DashboardAdmin />,
          },
          // { path: "gestion-usuarios", element: <Usuarios /> }
        ]
      },
      
      {
        element: <ProtectedRoute allowedRoles={['supervisor', 'administrador']} />, // El admin suele poder ver lo del supervisor
        children: [
          // {
          //   path: "dashboardSupervisor",
          //   element: <DashboardSupervisor />,
          // },
          // { path: "pedidos", element: <Pedidos /> }
        ]
      },
      
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);