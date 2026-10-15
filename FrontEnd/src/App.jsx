import { BrowserRouter, Routes, Route } from "react-router-dom";

// CONTEXT Y SERVICIOS
import { CarritoProvider } from "./context/CarritoContext";

// COMPONENTES DE PROTECCIÓN
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// USUARIOS PAGINAS
import Index from "./paginas/Index";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import OlvidoContrasena from "./paginas/OlvidoContrasena";
import Catalogo from "./paginas/catalogo";
import Usuario from "./paginas/usuario";
import MisPqrs from "./paginas/MisPqrs";
import PQRS from "./paginas/PQRS";
import Realizarpqrs from "./paginas/Realizarpqrs";
import Consultarpqrs from "./paginas/Consultarpqrs";
import ProductoDetalle from "./paginas/ProductoDetalle";
import Carrito from "./paginas/Carrito";
import ConfirmacionCompra from "./paginas/ConfirmacionCompra";
import Nosotros from "./paginas/Nosotros";

// ADMIN PAGINAS
import IndexAdmin from "./Admin-paginas/IndexAdmin";
import VerProductos from "./Admin-paginas/VerProductos";
import ActualizarProducto from "./Admin-paginas/ActualizarProducto";
import CrearProducto from "./Admin-paginas/CrearProducto";
import InhabilitarProducto from "./Admin-paginas/InhabilitarProducto";
import VerUsuarios from "./Admin-paginas/VerUsuarios";
import InhabilitarUsuarios from "./Admin-paginas/InhabilitarUsuarios";
import CambiarRolUsuario from "./Admin-paginas/CambiarRolUsuario";
import VerPqrs from "./Admin-paginas/VerPqrs";
import GestionResenas from "./Admin-paginas/GestionResenas";
import GestionPedidos from "./Admin-paginas/GestionPedidos";

function App() {
  return (
    <CarritoProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/olvido-contrasena" element={<OlvidoContrasena />} />

          {/* RUTAS PROTEGIDAS PARA USUARIOS AUTENTICADOS */}
          <Route
            path="/usuario"
            element={
              <PrivateRoute>
                <Usuario />
              </PrivateRoute>
            }
          />
          <Route
            path="/resenas/ver"
            element={
              <AdminRoute>
                <GestionResenas />
              </AdminRoute>
            }
          />
          <Route
            path="/mis-pqrs"
            element={
              <PrivateRoute>
                <MisPqrs />
              </PrivateRoute>
            }
          />
          <Route
            path="/carrito"
            element={
              <PrivateRoute>
                <Carrito />
              </PrivateRoute>
            }
          />
          <Route
            path="/confirmacion"
            element={
              <PrivateRoute>
                <ConfirmacionCompra />
              </PrivateRoute>
            }
          />
          <Route
            path="/pqrs"
            element={
              <PrivateRoute>
                <PQRS />
              </PrivateRoute>
            }
          />
          <Route
            path="/realizarpqrs"
            element={
              <PrivateRoute>
                <Realizarpqrs />
              </PrivateRoute>
            }
          />
          <Route
            path="/consultarpqrs"
            element={
              <PrivateRoute>
                <Consultarpqrs />
              </PrivateRoute>
            }
          />

          {/* RUTAS DE ADMIN - SOLO PARA ADMINISTRADORES */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <IndexAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/productos/crear"
            element={
              <AdminRoute>
                <CrearProducto />
              </AdminRoute>
            }
          />
          <Route
            path="/productos/actualizar"
            element={
              <AdminRoute>
                <ActualizarProducto />
              </AdminRoute>
            }
          />

          <Route
            path="/productos/ver"
            element={
              <AdminRoute>
                <VerProductos />
              </AdminRoute>
            }
          />
          <Route
            path="/productos/inhabilitar"
            element={
              <AdminRoute>
                <InhabilitarProducto />
              </AdminRoute>
            }
          />
          <Route
            path="/usuarios/ver"
            element={
              <AdminRoute>
                <VerUsuarios />
              </AdminRoute>
            }
          />
          <Route
            path="/usuarios/inhabilitar"
            element={
              <AdminRoute>
                <InhabilitarUsuarios />
              </AdminRoute>
            }
          />
          <Route
            path="/usuarios/cambiar-rol"
            element={
              <AdminRoute>
                <CambiarRolUsuario />
              </AdminRoute>
            }
          />
          <Route
            path="/pqrs/ver"
            element={
              <AdminRoute>
                <VerPqrs />
              </AdminRoute>
            }
          />
          <Route
            path="/resenas/ver"
            element={
              <AdminRoute>
                <GestionResenas />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pedidos"
            element={
              <AdminRoute>
                <GestionPedidos />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </CarritoProvider>
  );
}

export default App;
