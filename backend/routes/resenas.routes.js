const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET = "secreto123";

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });
  
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token inválido" });
    req.usuarioId = decoded.id;
    next();
  });
};

const actualizarCalificacionProducto = (productoId) => {
  const sql = `
    SELECT AVG(calificacion) as promedio, COUNT(*) as total
    FROM reseñas
    WHERE producto_id = ? AND estado = 'aprobada'
  `;
  
  db.query(sql, [productoId], (err, results) => {
    if (err) {
      console.error("Error al calcular promedio:", err);
      return;
    }
    
    const promedio = results[0].promedio || 0;
    const total = results[0].total || 0;
    
    const updateSql = `
      UPDATE producto 
      SET calificacion_promedio = ?, total_resenas = ?
      WHERE ID_Producto = ?
    `;
    
    db.query(updateSql, [promedio, total, productoId], (err) => {
      if (err) console.error("Error al actualizar producto:", err);
    });
  });
};

// =========================
// 🟢 OBTENER RESEÑAS DE UN PRODUCTO
// =========================
router.get("/producto/:productoId", (req, res) => {
  const { productoId } = req.params;

  const sql = `
    SELECT r.*, u.Nombre_usuario 
    FROM reseñas r
    JOIN usuario u ON r.usuario_id = u.ID_Usuario
    WHERE r.producto_id = ? AND r.estado = 'aprobada'
    ORDER BY r.fecha DESC
  `;

  db.query(sql, [productoId], (err, results) => {
    if (err) {
      console.error("Error en GET /producto/:productoId:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// =========================
// 🟢 OBTENER PROMEDIO
// =========================
router.get("/producto/:productoId/promedio", (req, res) => {
  const { productoId } = req.params;

  const sql = `
    SELECT COALESCE(AVG(calificacion), 0) as promedio, COUNT(*) as total
    FROM reseñas
    WHERE producto_id = ? AND estado = 'aprobada'
  `;

  db.query(sql, [productoId], (err, results) => {
    if (err) {
      console.error("Error en GET /producto/:productoId/promedio:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      promedio: parseFloat(results[0].promedio) || 0,
      total: results[0].total || 0
    });
  });
});

// =========================
// 🟢 CREAR RESEÑA
// =========================
router.post("/", verificarToken, (req, res) => {
  const { producto_id, calificacion, comentario } = req.body;
  const usuario_id = req.usuarioId;

  if (!producto_id || !calificacion || !comentario) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const getUserSql = "SELECT Nombre_usuario FROM usuario WHERE ID_Usuario = ?";
  db.query(getUserSql, [usuario_id], (err, userResult) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const nombre_usuario = userResult[0].Nombre_usuario;

    const sql = `
      INSERT INTO reseñas (producto_id, usuario_id, nombre_usuario, calificacion, comentario, estado)
      VALUES (?, ?, ?, ?, ?, 'pendiente')
    `;

    db.query(sql, [producto_id, usuario_id, nombre_usuario, calificacion, comentario], (err, result) => {
      if (err) {
        console.error("Error en POST /:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Reseña enviada, esperando aprobación" });
    });
  });
});

// =========================
// 🔵 OBTENER TODAS LAS RESEÑAS (ADMIN)
// =========================
router.get("/admin", verificarToken, (req, res) => {
  console.log("Usuario ID:", req.usuarioId);
  
  const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
  
  db.query(checkAdminSql, [req.usuarioId], (err, result) => {
    if (err) {
      console.error("Error verificando admin:", err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log("Resultado admin check:", result);
    
    if (result.length === 0 || result[0].ID_Rol !== 1) {
      return res.status(403).json({ message: "No tienes permisos" });
    }

    const sql = `
      SELECT r.*, p.Nombre_producto as producto_nombre
      FROM reseñas r
      JOIN producto p ON r.producto_id = p.ID_Producto
      ORDER BY r.fecha DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error obteniendo reseñas:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
});

// =========================
// 🟡 APROBAR/RECHAZAR RESEÑA
// =========================
router.patch("/admin/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
  
  db.query(checkAdminSql, [req.usuarioId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0 || result[0].ID_Rol !== 1) {
      return res.status(403).json({ message: "No tienes permisos" });
    }

    const getProductoSql = "SELECT producto_id FROM reseñas WHERE id = ?";
    db.query(getProductoSql, [id], (err, resenaResult) => {
      if (err) return res.status(500).json({ error: err.message });
      if (resenaResult.length === 0) {
        return res.status(404).json({ message: "Reseña no encontrada" });
      }
      
      const productoId = resenaResult[0].producto_id;
      
      const sql = "UPDATE reseñas SET estado = ? WHERE id = ?";
      db.query(sql, [estado, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        actualizarCalificacionProducto(productoId);
        
        res.json({ message: "Reseña actualizada correctamente" });
      });
    });
  });
});

module.exports = router;