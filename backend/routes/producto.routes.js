const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }
  
  jwt.verify(token, "secreto123", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
    req.usuarioId = decoded.id;
    next();
  });
};

// 🟢 OBTENER TODOS LOS PRODUCTOS (para admin - incluye inhabilitados)
router.get("/", (req, res) => {
  const sql = `
    SELECT p.*, 
           u.Nombre_usuario as Nombre_Proveedor, 
           u.Apellido as Apellido_Proveedor,
           p.calificacion_promedio,
           p.total_resenas
    FROM producto p
    LEFT JOIN usuario u ON p.ID_Proveedor = u.ID_Usuario
    ORDER BY p.ID_Producto DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 🟢 OBTENER PRODUCTOS ACTIVOS (para el catálogo público)
router.get("/activos", (req, res) => {
  const sql = `
    SELECT p.*, 
           u.Nombre_usuario as Nombre_Proveedor,
           p.calificacion_promedio,
           p.total_resenas
    FROM producto p
    LEFT JOIN usuario u ON p.ID_Proveedor = u.ID_Usuario
    WHERE p.Estado = 1
    ORDER BY p.ID_Producto DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 🟢 OBTENER UN PRODUCTO POR ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  
  db.query(
    "SELECT * FROM producto WHERE ID_Producto = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(results[0]);
    }
  );
});

// 🟢 CREAR NUEVO PRODUCTO
router.post("/", (req, res) => {
  const { Nombre_producto, Descripcion, Categoria, Precio, Stock, imagen, ID_Proveedor } = req.body;
  
  if (!Nombre_producto || !Categoria || !Precio || Stock === undefined) {
    return res.status(400).json({ 
      message: "Faltan campos obligatorios: Nombre_producto, Categoria, Precio, Stock" 
    });
  }
  
  const sql = `
    INSERT INTO producto (Nombre_producto, Descripcion, Categoria, Precio, Stock, imagen, Estado, ID_Proveedor)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `;
  
  db.query(
    sql,
    [Nombre_producto, Descripcion || null, Categoria, Precio, Stock, imagen || null, ID_Proveedor || null],
    (err, result) => {
      if (err) {
        console.error("Error al crear producto:", err);
        return res.status(500).json({ message: "Error al crear producto" });
      }
      
      res.status(201).json({ 
        message: "Producto creado correctamente",
        id: result.insertId 
      });
    }
  );
});

// 🟡 ACTUALIZAR PRODUCTO
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { Nombre_producto, Descripcion, Categoria, Precio, Stock, imagen, ID_Proveedor } = req.body;
  
  const sql = `
    UPDATE producto 
    SET Nombre_producto = ?, Descripcion = ?, Categoria = ?, Precio = ?, Stock = ?, imagen = ?, ID_Proveedor = ?
    WHERE ID_Producto = ?
  `;
  
  db.query(
    sql,
    [Nombre_producto, Descripcion, Categoria, Precio, Stock, imagen, ID_Proveedor || null, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar producto:", err);
        return res.status(500).json({ message: "Error al actualizar producto" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      
      res.json({ message: "Producto actualizado correctamente" });
    }
  );
});

// 🟠 INHABILITAR PRODUCTO
router.patch("/:id/inhabilitar", (req, res) => {
  const id = req.params.id;
  
  const sql = "UPDATE producto SET Estado = 0 WHERE ID_Producto = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al inhabilitar producto:", err);
      return res.status(500).json({ message: "Error al inhabilitar producto" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    res.json({ message: "Producto inhabilitado correctamente" });
  });
});

// 🟢 HABILITAR PRODUCTO
router.patch("/:id/habilitar", (req, res) => {
  const id = req.params.id;
  
  const sql = "UPDATE producto SET Estado = 1 WHERE ID_Producto = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al habilitar producto:", err);
      return res.status(500).json({ message: "Error al habilitar producto" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    res.json({ message: "Producto habilitado correctamente" });
  });
});

// 🔴 ELIMINAR PRODUCTO
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  
  db.query(
    "DELETE FROM producto WHERE ID_Producto = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error al eliminar producto:", err);
        return res.status(500).json({ message: "Error al eliminar producto" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      
      res.json({ message: "Producto eliminado correctamente" });
    }
  );
});

router.get("/buscar/:texto", (req, res) => {
  const texto = req.params.texto;

  db.query(
    "SELECT * FROM producto WHERE Nombre_producto LIKE ?",
    [`%${texto}%`],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

module.exports = router;