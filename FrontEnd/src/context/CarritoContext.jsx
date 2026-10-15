import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem('token');

const obtenerCarrito = async () => {
  if (!token) return;
  
  console.log("🟢 Obteniendo carrito...");
  
  try {
    const res = await axios.get("http://localhost:3001/api/carrito", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Carrito recibido:", res.data);
    setCarrito(res.data);
  } catch (error) {
    console.error("❌ Error al obtener carrito:", error);
  }
};

const agregarAlCarrito = async (productoId, cantidad = 1) => {
  console.log("🟢 Llamando a agregarAlCarrito");
  console.log("productoId:", productoId);
  console.log("cantidad:", cantidad);
  console.log("token:", token);

  if (!token) {
    alert("Debes iniciar sesión para agregar productos al carrito");
    return false;
  }

  try {
    const response = await axios.post(
      "http://localhost:3001/api/carrito/agregar",
      { productoId, cantidad },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("✅ Respuesta del servidor:", response.data);
    
    await obtenerCarrito(); // Recargar carrito después de agregar
    
    alert("Producto agregado al carrito");
    return true;
  } catch (error) {
    console.error("❌ Error completo:", error);
    console.error("❌ Response:", error.response?.data);
    alert(error.response?.data?.message || "Error al agregar producto al carrito");
    return false;
  }
};

  const actualizarCantidad = async (itemId, cantidad) => {
    if (!token) return;

    try {
      await axios.put(`http://localhost:3001/api/carrito/actualizar/${itemId}`,
        { cantidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await obtenerCarrito();
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };

  const eliminarDelCarrito = async (itemId) => {
    if (!token) return;

    try {
      await axios.delete(`http://localhost:3001/api/carrito/eliminar/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await obtenerCarrito();
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
    }
  };

  const vaciarCarrito = async () => {
  if (!token) return;

  try {
    await axios.delete('http://localhost:3001/api/carrito/vaciar', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCarrito({ items: [], total: 0 });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
  }
};

  useEffect(() => {
    obtenerCarrito();
  }, [token]);

  return (
    <CarritoContext.Provider value={{
      carrito,
      cargando,
      agregarAlCarrito,
      actualizarCantidad,
      eliminarDelCarrito,
      vaciarCarrito,
      obtenerCarrito
    }}>
      {children}
    </CarritoContext.Provider>
  );
};