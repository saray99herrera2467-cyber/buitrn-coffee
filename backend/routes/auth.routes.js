const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { enviarBienvenida, enviarRecuperacionContrasena } = require('../services/emailService');

// CLAVE JWT 
const SECRET = "secreto123";

// =========================
// 🟢 REGISTRO
// =========================
router.post("/register", async (req, res) => {
  const { Nombre_usuario, Apellido, Correo, Documento, Telefono, Clave } = req.body;

  if (!Nombre_usuario || !Apellido || !Correo || !Clave) {
    return res.status(400).json({ message: "Campos obligatorios faltantes" });
  }

  try {
    const checkSql = "SELECT * FROM usuario WHERE Correo = ?";
    db.query(checkSql, [Correo], async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(Clave, 10);

      const sql = `
        INSERT INTO usuario 
        (Nombre_usuario, Apellido, Correo, Documento, Telefono, Clave, ID_Rol)
        VALUES (?,?,?,?,?,?,2)
      `;

      db.query(
        sql,
        [Nombre_usuario, Apellido, Correo, Documento, Telefono, hashedPassword],
        async (err, result) => {
          if (err) return res.status(500).json(err);

          try {
            await enviarBienvenida(Correo, Nombre_usuario);
            console.log(`📧 Bienvenida enviada a ${Correo}`);
          } catch (error) {
            console.error("Error al enviar bienvenida:", error);
          }

          res.status(201).json({ message: "Usuario registrado correctamente" });
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// =========================
// 🔵 LOGIN
// =========================
router.post("/login", (req, res) => {
  const { Correo, Clave } = req.body;

  if (!Correo || !Clave) {
    return res.status(400).json({ message: "Correo y contraseña requeridos" });
  }

  const sql = "SELECT * FROM usuario WHERE Correo = ?";

  db.query(sql, [Correo], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ message: "Usuario no existe" });
    }

    const user = result[0];

    // 🔐 Validar contraseña
    const validPassword = await bcrypt.compare(Clave, user.Clave);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    if (user.Estado === 0) {
      return res.status(401).json({ message: "Tu cuenta ha sido inhabilitada. Contacta al administrador." });
    }

    // 🎟 Token
    const token = jwt.sign(
      { id: user.ID_Usuario, rol: user.ID_Rol },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        ID_Usuario: user.ID_Usuario,
        Nombre_usuario: user.Nombre_usuario,
        Apellido: user.Apellido,
        Correo: user.Correo,
        Documento: user.Documento,
        Telefono: user.Telefono,
        ID_Rol: user.ID_Rol,
        Estado: user.Estado
      }
    });
  });
});

// =========================
// RECUPERACIÓN DE CONTRASEÑA
// =========================
const codigosRecuperacion = new Map();

router.post("/olvido-contrasena", async (req, res) => {
  const { Correo } = req.body;

  if (!Correo) {
    return res.status(400).json({ message: "El correo es obligatorio" });
  }

  const sql = "SELECT ID_Usuario, Nombre_usuario, Correo FROM usuario WHERE Correo = ? AND Estado = 1";
  
  db.query(sql, [Correo], async (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "No existe una cuenta con este correo" });
    }

    const usuario = result[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    codigosRecuperacion.set(usuario.Correo, {
      codigo: codigo,
      expira: Date.now() + 5 * 60 * 1000,
      id_usuario: usuario.ID_Usuario
    });

    try {
      await enviarRecuperacionContrasena(usuario.Correo, usuario.Nombre_usuario, codigo);
      res.json({ message: "Código enviado a tu correo" });
    } catch (error) {
      console.error("Error al enviar correo:", error);
      res.status(500).json({ message: "Error al enviar el correo" });
    }
  });
});

// =========================
// VERIFICAR CÓDIGO
// =========================
router.post("/verificar-codigo", (req, res) => {
  const { Correo, codigo } = req.body;
  const registro = codigosRecuperacion.get(Correo);

  if (!registro) {
    return res.status(404).json({ message: "Código no encontrado" });
  }

  if (registro.codigo !== codigo) {
    return res.status(400).json({ message: "Código incorrecto" });
  }

  if (Date.now() > registro.expira) {
    codigosRecuperacion.delete(Correo);
    return res.status(400).json({ message: "Código expirado" });
  }

  res.json({ message: "Código verificado" });
});

// =========================
// RESTABLECER CONTRASEÑA
// =========================
router.post("/restablecer-contrasena", async (req, res) => {
  const { Correo, codigo, nuevaClave } = req.body;

  if (nuevaClave.length < 6) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
  }

  const registro = codigosRecuperacion.get(Correo);

  if (!registro || registro.codigo !== codigo) {
    return res.status(400).json({ message: "Código inválido" });
  }

  if (Date.now() > registro.expira) {
    codigosRecuperacion.delete(Correo);
    return res.status(400).json({ message: "Código expirado" });
  }

  const hashedPassword = await bcrypt.hash(nuevaClave, 10);
  const sql = "UPDATE usuario SET Clave = ? WHERE ID_Usuario = ?";
  
  db.query(sql, [hashedPassword, registro.id_usuario], (err, result) => {
    if (err) return res.status(500).json(err);
    
    codigosRecuperacion.delete(Correo);
    res.json({ message: "Contraseña actualizada correctamente" });
  });
});


// =========================
// 🟡 PERFIL (GET)
// =========================
router.get("/perfil", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const sql = "SELECT * FROM usuario WHERE ID_Usuario=?";

    db.query(sql, [decoded.id], (err, result) => {
      if (err) return res.status(500).json(err);

      res.json(result[0]);
    });
  });
});


// =========================
// 🟠 PERFIL (PUT)
// =========================
router.put("/perfil", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const { Nombre_usuario, Correo, Documento, Telefono } = req.body;

    const sql = `
      UPDATE usuario
      SET Nombre_usuario=?, Correo=?, Documento=?, Telefono=?
      WHERE ID_Usuario=?
    `;

    db.query(
      sql,
      [Nombre_usuario, Correo, Documento, Telefono, decoded.id],
      (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Usuario actualizado correctamente" });
      }
    );
  });
});


// =========================
// 🔵 OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
// =========================
router.get("/usuarios", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Verificar que el usuario es administrador (ID_Rol = 1)
    const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
    
    db.query(checkAdminSql, [decoded.id], (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length === 0 || result[0].ID_Rol !== 1) {
        return res.status(403).json({ message: "No tienes permisos para ver usuarios" });
      }

      // Si es admin, obtener todos los usuarios incluyendo Estado
      const sql = `
        SELECT u.ID_Usuario, u.Nombre_usuario, u.Apellido, u.Correo, u.Documento, u.Telefono, r.Tipo_rol, u.ID_Rol, u.Estado
        FROM usuario u
        INNER JOIN rol r ON u.ID_Rol = r.ID_Rol
        ORDER BY u.ID_Usuario DESC
      `;
      
      db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
      });
    });
  });
});

// =========================
// 🔵 OBTENER PROVEEDORES (SOLO ADMIN)
// =========================
router.get("/proveedores", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Verificar que el usuario es administrador
    const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
    
    db.query(checkAdminSql, [decoded.id], (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length === 0 || result[0].ID_Rol !== 1) {
        return res.status(403).json({ message: "No tienes permisos para ver proveedores" });
      }

      // Obtener usuarios con rol de proveedor (ID_Rol = 3)
      const sql = `
        SELECT ID_Usuario, Nombre_usuario, Apellido, Correo, Telefono
        FROM usuario
        WHERE ID_Rol = 3 AND Estado = 1
        ORDER BY Nombre_usuario ASC
      `;
      
      db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
      });
    });
  });
});

// =========================
// 🔵 OBTENER UN USUARIO POR ID
// =========================
router.get("/usuarios/:id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const id = req.params.id;

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Verificar que el usuario es administrador
    const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
    
    db.query(checkAdminSql, [decoded.id], (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length === 0 || result[0].ID_Rol !== 1) {
        return res.status(403).json({ message: "No tienes permisos para ver usuarios" });
      }

      // Si es admin, obtener el usuario específico
      const sql = `
        SELECT u.ID_Usuario, u.Nombre_usuario, u.Apellido, u.Correo, u.Documento, u.Telefono, r.Tipo_rol, u.ID_Rol
        FROM usuario u
        INNER JOIN rol r ON u.ID_Rol = r.ID_Rol
        WHERE u.ID_Usuario = ?
      `;
      
      db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(results[0]);
      });
    });
  });
});
// =========================
// 🟠 INHABILITAR USUARIO
// =========================
router.patch("/usuarios/:id/inhabilitar", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const id = req.params.id;

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Verificar que el usuario es administrador
    const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
    
    db.query(checkAdminSql, [decoded.id], (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length === 0 || result[0].ID_Rol !== 1) {
        return res.status(403).json({ message: "No tienes permisos para inhabilitar usuarios" });
      }

      // Verificar que no se está inhabilitando a sí mismo
      if (decoded.id == id) {
        return res.status(400).json({ message: "No puedes inhabilitar tu propio usuario" });
      }

      // Inhabilitar usuario
      const sql = "UPDATE usuario SET Estado = 0 WHERE ID_Usuario = ?";
      
      db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        res.json({ message: "Usuario inhabilitado correctamente" });
      });
    });
  });
});


// =========================
// 🟢 HABILITAR USUARIO
// =========================
router.patch("/usuarios/:id/habilitar", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const id = req.params.id;

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Verificar que el usuario es administrador
    const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
    
    db.query(checkAdminSql, [decoded.id], (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length === 0 || result[0].ID_Rol !== 1) {
        return res.status(403).json({ message: "No tienes permisos para habilitar usuarios" });
      }

      // Habilitar usuario
      const sql = "UPDATE usuario SET Estado = 1 WHERE ID_Usuario = ?";
      
      db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        res.json({ message: "Usuario habilitado correctamente" });
      });
    });
  });
});

// =========================
// 🔄 CAMBIAR ROL DE USUARIO
// =========================
router.patch("/usuarios/:id/cambiar-rol", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const id = req.params.id;
  const { nuevoRol } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  if (!nuevoRol || (nuevoRol !== 1 && nuevoRol !== 2 && nuevoRol !== 3)) {
    return res.status(400).json({ message: "Rol inválido. Debe ser 1 (Admin), 2 (Usuario) o 3 (Proveedor)" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Verificar que el usuario es administrador
    const checkAdminSql = "SELECT ID_Rol FROM usuario WHERE ID_Usuario = ?";
    
    db.query(checkAdminSql, [decoded.id], (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length === 0 || result[0].ID_Rol !== 1) {
        return res.status(403).json({ message: "No tienes permisos para cambiar roles" });
      }

      // Verificar que no se está cambiando el rol a sí mismo
      if (decoded.id == id) {
        return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
      }

      // Verificar que el usuario existe
      const checkUserSql = "SELECT ID_Usuario, Nombre_usuario FROM usuario WHERE ID_Usuario = ?";
      
      db.query(checkUserSql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        
        if (result.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Cambiar el rol
        const sql = "UPDATE usuario SET ID_Rol = ? WHERE ID_Usuario = ?";
        
        db.query(sql, [nuevoRol, id], (err, result) => {
          if (err) return res.status(500).json(err);
          
          res.json({ 
            message: `Rol cambiado correctamente a ${nuevoRol === 1 ? 'Administrador' : nuevoRol === 2 ? 'Usuario' : 'Proveedor'}`,
            usuario: result[0]
          });
        });
      });
    });
  });
});
module.exports = router;