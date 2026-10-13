const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET = "secreto123";

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
    req.usuarioId = decoded.id;
    next();
  });
};

// 🟢 OBTENER CARRITO DEL USUARIO
router.get("/", verificarToken, (req, res) => {
  const usuarioId = req.usuarioId;

  const sql = `
    SELECT c.ID_Carrito, c.Cantidad, p.ID_Producto, p.Nombre_producto, 
           p.Precio, p.imagen, p.Descripcion
    FROM carrito c
    INNER JOIN producto p ON c.ID_Producto = p.ID_Producto
    WHERE c.ID_Usuario = ?
  `;

  db.query(sql, [usuarioId], (err, results) => {
    if (err) return res.status(500).json(err);
    
    const total = results.reduce((sum, item) => sum + (item.Precio * item.Cantidad), 0);
    
    res.json({
      items: results,
      total: total
    });
  });
});

// 🟢 AGREGAR PRODUCTO AL CARRITO
router.post("/agregar", verificarToken, (req, res) => {
  const usuarioId = req.usuarioId;
  const { productoId, cantidad = 1 } = req.body;

  console.log("========== AGREGAR AL CARRITO ==========");
  console.log("usuarioId:", usuarioId);
  console.log("productoId:", productoId);
  console.log("cantidad:", cantidad);

  if (!productoId) {
    return res.status(400).json({ message: "ID de producto requerido" });
  }

  // Verificar si el producto ya está en el carrito
  const checkSql = "SELECT * FROM carrito WHERE ID_Usuario = ? AND ID_Producto = ?";
  
  db.query(checkSql, [usuarioId, productoId], (err, results) => {
    if (err) {
      console.error("Error al verificar carrito:", err);
      return res.status(500).json(err);
    }

    if (results.length > 0) {
      // Actualizar cantidad
      const nuevaCantidad = results[0].Cantidad + cantidad;
      const updateSql = "UPDATE carrito SET Cantidad = ? WHERE ID_Carrito = ?";
      
      db.query(updateSql, [nuevaCantidad, results[0].ID_Carrito], (err) => {
        if (err) {
          console.error("Error al actualizar:", err);
          return res.status(500).json(err);
        }
        console.log("✅ Cantidad actualizada a:", nuevaCantidad);
        res.json({ message: "Cantidad actualizada" });
      });
    } else {
      // Insertar nuevo producto
      const insertSql = "INSERT INTO carrito (ID_Usuario, ID_Producto, Cantidad) VALUES (?, ?, ?)";
      
      db.query(insertSql, [usuarioId, productoId, cantidad], (err, result) => {
        if (err) {
          console.error("Error al insertar:", err);
          return res.status(500).json(err);
        }
        console.log("✅ Producto insertado, ID:", result.insertId);
        res.json({ message: "Producto agregado al carrito" });
      });
    }
  });
});

// 🟢 ACTUALIZAR CANTIDAD
router.put("/actualizar/:itemId", verificarToken, (req, res) => {
  const itemId = req.params.itemId;
  const { cantidad } = req.body;

  if (cantidad < 1) {
    return res.status(400).json({ message: "La cantidad debe ser al menos 1" });
  }

  const sql = "UPDATE carrito SET Cantidad = ? WHERE ID_Carrito = ? AND ID_Usuario = ?";
  
  db.query(sql, [cantidad, itemId, req.usuarioId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Cantidad actualizada" });
  });
});

// 🟢 ELIMINAR PRODUCTO DEL CARRITO
router.delete("/eliminar/:itemId", verificarToken, (req, res) => {
  const itemId = req.params.itemId;
  
  const sql = "DELETE FROM carrito WHERE ID_Carrito = ? AND ID_Usuario = ?";
  
  db.query(sql, [itemId, req.usuarioId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Producto eliminado del carrito" });
  });
});

// 🟢 VACIAR CARRITO
router.delete("/vaciar", verificarToken, (req, res) => {
  const sql = "DELETE FROM carrito WHERE ID_Usuario = ?";
  
  db.query(sql, [req.usuarioId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Carrito vaciado" });
  });
});

module.exports = router;