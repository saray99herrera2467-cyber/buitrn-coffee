const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { enviarCorreoAlertaStock } = require("../utils/emailService");

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const jwt = require("jsonwebtoken");
  const SECRET = process.env.JWT_SECRET || "secreto123";

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
    req.usuarioId = decoded.id;
    req.usuarioRol = decoded.rol;
    next();
  });
};

// Traduce una fila de producto (snake_case) al formato de nivel_stock + campos que espera el email
const conNivelStock = (p) => ({
  ID_Producto: p.id,
  Nombre_producto: p.nombre_producto,
  Stock: p.stock,
  Precio: p.precio,
  imagen: p.imagen,
  nivel_stock: p.stock <= 0 ? "Crítico - Sin stock" : p.stock <= 5 ? "Muy bajo" : "Bajo",
});

const obtenerProductosMasVendidos = async (soloActivos, limite) => {
  const { data: detalles, error } = await supabase
    .from("detalle_pedido")
    .select("cantidad, producto(id, nombre_producto, precio, imagen, estado)");

  if (error) throw error;

  const ventasPorProducto = new Map();

  for (const detalle of detalles || []) {
    const producto = detalle.producto;
    if (!producto || (soloActivos && !producto.estado)) continue;

    const venta = ventasPorProducto.get(producto.id) || {
      ...producto,
      cantidad_vendida: 0,
    };
    venta.cantidad_vendida += Number(detalle.cantidad) || 0;
    ventasPorProducto.set(producto.id, venta);
  }

  return [...ventasPorProducto.values()]
    .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida)
    .slice(0, limite);
};

// =============================================
// GET: Resumen productos (más vendidos + stock bajo)
// =============================================
router.get("/resumen-productos", verificarToken, async (req, res) => {
  const esAdmin = req.usuarioRol === 2;

  if (!esAdmin) {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Solo administradores.",
    });
  }

  try {
    const [productosMasVendidos, { data: stockBajoRaw, error: errStock }] =
      await Promise.all([
        obtenerProductosMasVendidos(false, 10),
        supabase.from("producto").select("id, nombre_producto, stock, precio, imagen").lte("stock", 10).order("stock", { ascending: true }),
      ]);

    if (errStock) throw errStock;

    const productosStockBajo = (stockBajoRaw || []).map(conNivelStock);

    if (productosStockBajo.length > 0) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@buitroncoffee.com";
      const adminNombre = "Administrador Buitrón Coffee";

      const alertaHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background: #e67e22; padding: 20px; text-align: center;">
            <h1 style="color: white;">⚠️ Alerta de Stock Bajo</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd;">
            <h2>Productos con stock bajo:</h2>
            <ul>
              ${productosStockBajo
                .map(
                  (p) => `
                <li><strong>${p.Nombre_producto}</strong> - Stock: ${p.Stock} (${p.nivel_stock})</li>
              `
                )
                .join("")}
            </ul>
          </div>
        </div>
      `;

      enviarCorreoAlertaStock(adminEmail, adminNombre, productosStockBajo, alertaHtml).catch((err) =>
        console.error("Error al enviar correo:", err)
      );
    }

    res.json({
      success: true,
      data: {
        productos_mas_vendidos: productosMasVendidos,
        productos_stock_bajo: productosStockBajo,
        total_mas_vendidos: productosMasVendidos.length,
        total_stock_bajo: productosStockBajo.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
    });
  }
});

// =============================================
// GET: Top productos
// =============================================
router.get("/top-productos", verificarToken, async (req, res) => {
  try {
    const data = await obtenerProductosMasVendidos(true, 10);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Error al obtener productos más vendidos:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
    });
  }
});

// =============================================
// 🔥 POST: Alerta de stock (DIFERENTE AL GET)
// =============================================
router.post("/alerta-stock", verificarToken, async (req, res) => {
  const esAdmin = req.usuarioRol === 2;

  if (!esAdmin) {
    return res.status(403).json({
      success: false,
      message: "Solo administradores",
    });
  }

  const { data: results, error } = await supabase
    .from("producto")
    .select("id, nombre_producto, stock")
    .lte("stock", 10)
    .order("stock", { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      message: "Error consultando stock",
    });
  }

  if (results.length === 0) {
    return res.json({
      success: true,
      message: "No hay productos con stock bajo",
    });
  }

  const alertas = results.map((p) => `${p.nombre_producto} tiene solo ${p.stock} unidades`);

  res.json({
    success: true,
    message: "Alerta generada correctamente",
    alertas,
  });
});

module.exports = router;