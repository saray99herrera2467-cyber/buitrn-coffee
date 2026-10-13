import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  
  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Si el usuario no es admin (ID_Rol !== 1), redirigir al catálogo
  if (usuario.ID_Rol !== 1) {
    return <Navigate to="/catalogo" />;
  }
  
  return children;
}

export default AdminRoute;