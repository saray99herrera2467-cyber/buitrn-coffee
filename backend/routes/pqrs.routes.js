const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { enviarConfirmacionPQRS, enviarRespuestaPQRS } = require('../services/emailService');

const SECRET = "secreto123";

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });
  
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token inválido" });
    req.usuarioId = decoded.id;
    req.usuarioRol = decoded.rol;
    next();
  });
};

// =========================
// 🟢 CREAR PQRS (con envío de correo de confirmación)
// =========================
router.post("/", async (req, res) => {
  const { nombre, email, telefono, tipo, descripcion, codigo_referencia, id_usuario } = req.body;

  if (!nombre || !email || !tipo || !descripcion || !codigo_referencia) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const sql = `
    INSERT INTO pqrs (Codigo_Referencia, ID_Usuario, Nombre, Email, Telefono, Tipo, Descripcion, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
  `;

  db.query(sql, [codigo_referencia, id_usuario || null, nombre, email, telefono || null, tipo, descripcion], async (err, result) => {
    if (err) {
      console.error("Error al crear PQRS:", err);
      return res.status(500).json({ message: "Error al crear PQRS" });
    }
    
    // ✅ Enviar correo de confirmación con Brevo
    try {
      await enviarConfirmacionPQRS(email, nombre, codigo_referencia, tipo);
      console.log(`📧 Confirmación PQRS enviada a ${email}`);
    } catch (error) {
      console.error("Error al enviar confirmación PQRS:", error);
    }
    
    res.status(201).json({ 
      message: "PQRS creada correctamente",
      id: result.insertId,
      codigo_referencia
    });
  });
});

// =========================
// 🔵 CONSULTAR PQRS POR CÓDIGO (Público)
// =========================
router.get("/consultar/:codigo", (req, res) => {
  const codigo = req.params.codigo;

  const sql = `
    SELECT Codigo_Referencia, Tipo, Descripcion, Estado, Fecha_Creacion, Respuesta
    FROM pqrs 
    WHERE Codigo_Referencia = ?
  `;

  db.query(sql, [codigo], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.status(404).json({ message: "No se encontró ninguna PQRS con ese código" });
    }
    res.json(results[0]);
  });
});

// =========================
// 🔵 OBTENER PQRS POR USUARIO (Usuario autenticado)
// =========================
router.get("/mis-pqrs", verificarToken, (req, res) => {
  const usuarioId = req.usuarioId;

  const sql = `
    SELECT ID_PQRS, Codigo_Referencia, Tipo, Descripcion, Estado, 
           Fecha_Creacion, Respuesta
    FROM pqrs 
    WHERE ID_Usuario = ?
    ORDER BY Fecha_Creacion DESC
  `;

  db.query(sql, [usuarioId], (err, results) => {
    if (err) {
      console.error("Error al obtener PQRS del usuario:", err);
      return res.status(500).json({ message: "Error al obtener tus PQRS" });
    }
    res.json(results);
  });
});

// =========================
// 🔵 OBTENER TODAS LAS PQRS (SOLO ADMIN)
// =========================
router.get("/admin", verificarToken, (req, res) => {
  if (req.usuarioRol !== 1) {
    return res.status(403).json({ message: "No tienes permisos para ver PQRS" });
  }

  const sql = `
    SELECT p.*, u.Nombre_usuario as UsuarioNombre, u.Correo as UsuarioCorreo
    FROM pqrs p
    LEFT JOIN usuario u ON p.ID_Usuario = u.ID_Usuario
    ORDER BY p.Fecha_Creacion DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// =========================
// 🟡 ACTUALIZAR ESTADO DE PQRS (SOLO ADMIN) con envío de respuesta
// =========================
router.patch("/admin/:id", verificarToken, async (req, res) => {
  if (req.usuarioRol !== 1) {
    return res.status(403).json({ message: "No tienes permisos" });
  }

  const { id } = req.params;
  const { estado, respuesta } = req.body;

  // Primero obtener los datos del usuario para enviar el correo
  const getUserSql = `
    SELECT p.Email, p.Nombre, p.Codigo_Referencia
    FROM pqrs p
    WHERE p.ID_PQRS = ?
  `;

  db.query(getUserSql, [id], async (err, userResult) => {
    if (err) return res.status(500).json(err);
    
    const sql = "UPDATE pqrs SET Estado = ?, Respuesta = ? WHERE ID_PQRS = ?";
    db.query(sql, [estado, respuesta || null, id], async (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "PQRS no encontrada" });
      }
      
      // ✅ Enviar correo de respuesta con Brevo (solo si hay respuesta)
      if (respuesta && userResult.length > 0) {
        try {
          await enviarRespuestaPQRS(
            userResult[0].Email, 
            userResult[0].Nombre, 
            respuesta, 
            userResult[0].Codigo_Referencia
          );
          console.log(`📧 Respuesta PQRS enviada a ${userResult[0].Email}`);
        } catch (error) {
          console.error("Error al enviar respuesta PQRS:", error);
        }
      }
      
      res.json({ message: "PQRS actualizada correctamente" });
    });
  });
});

module.exports = router;