const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { enviarCodigoVerificacion } = require('../utils/emailService');
const { verificarEmail, corregirEmail, generarCodigo } = require('../utils/emailValidator');

// =============================================
//  ENVIAR CÓDIGO DE VERIFICACIÓN
// =============================================
router.post("/enviar-codigo", async (req, res) => {
    const { Correo } = req.body;

    console.log(' Verificando email:', Correo);

    if (!Correo || !Correo.includes('@')) {
        return res.status(400).json({ 
            success: false, 
            message: "❌ Correo inválido. Ingresa un correo válido." 
        });
    }

    const emailCorregido = corregirEmail(Correo);
    const correccionAplicada = emailCorregido !== Correo;

    const verificacion = await verificarEmail(emailCorregido);

    console.log('📊 Resultado verificación:', verificacion);

    if (!verificacion.valido) {
        return res.status(400).json({ 
            success: false, 
            message: verificacion.mensaje,
            correo_sugerido: verificacion.correo_sugerido || null
        });
    }

    const checkSql = "SELECT ID_Usuario FROM usuario WHERE Correo = ?";
    db.query(checkSql, [emailCorregido], (err, result) => {
        if (err) {
            console.error(" Error al verificar correo:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al verificar correo" 
            });
        }

        if (result.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: " El correo ya está registrado. Inicia sesión." 
            });
        }

        const codigo = generarCodigo();
        const fechaExpiracion = new Date();
        fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 10);

        const sql = `
            INSERT INTO verificaciones_email (Correo, Codigo, Fecha_Expiracion, Verificado, Intentos)
            VALUES (?, ?, ?, 0, 0)
            ON DUPLICATE KEY UPDATE 
                Codigo = VALUES(Codigo),
                Fecha_Expiracion = VALUES(Fecha_Expiracion),
                Verificado = 0,
                Intentos = 0
        `;

        db.query(sql, [emailCorregido, codigo, fechaExpiracion], async (err) => {
            if (err) {
                console.error(" Error al guardar código:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al generar código de verificación" 
                });
            }

            // 🔥 Enviar correo con el código
            try {
                await enviarCodigoVerificacion(emailCorregido, codigo);
                console.log(`📧 Código enviado a ${emailCorregido}`);

                const respuesta = {
                    success: true,
                    message: " Código de verificación enviado a tu correo",
                    email: emailCorregido
                };

                if (correccionAplicada) {
                    respuesta.correo_original = Correo;
                    respuesta.mensaje_correccion = `Tu correo fue corregido a "${emailCorregido}"`;
                }

                if (verificacion.advertencia) {
                    respuesta.advertencia = "⚠️ No se pudo verificar completamente. Se permitirá el registro.";
                }

                res.status(200).json(respuesta);

            } catch (emailError) {
                console.error(" Error al enviar correo:", emailError);
                res.status(500).json({ 
                    success: false, 
                    message: "Error al enviar el código de verificación" 
                });
            }
        });
    });
});

// =============================================
//  VERIFICAR CÓDIGO
// =============================================
router.post("/verificar-codigo", (req, res) => {
    const { Correo, Codigo } = req.body;

    if (!Correo || !Codigo) {
        return res.status(400).json({ 
            success: false, 
            message: "Correo y código son obligatorios" 
        });
    }

    const emailCorregido = corregirEmail(Correo);

    const sql = `
        SELECT * FROM verificaciones_email 
        WHERE Correo = ? AND Verificado = 0
    `;

    db.query(sql, [emailCorregido], (err, results) => {
        if (err) {
            console.error(" Error al verificar código:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al verificar código" 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No se encontró una verificación pendiente para este correo" 
            });
        }

        const verificacion = results[0];

        if (new Date() > new Date(verificacion.Fecha_Expiracion)) {
            return res.status(400).json({ 
                success: false, 
                message: " El código ha expirado. Solicita uno nuevo." 
            });
        }

        if (verificacion.Intentos >= 5) {
            return res.status(400).json({ 
                success: false, 
                message: " Demasiados intentos fallidos. Solicita un nuevo código." 
            });
        }

        if (verificacion.Codigo !== Codigo) {
            const updateSql = "UPDATE verificaciones_email SET Intentos = Intentos + 1 WHERE Correo = ?";
            db.query(updateSql, [emailCorregido], (err) => {
                if (err) console.error(" Error al actualizar intentos:", err);
            });

            const intentosRestantes = 5 - (verificacion.Intentos + 1);
            return res.status(400).json({ 
                success: false, 
                message: ` Código incorrecto. Te quedan ${intentosRestantes} intentos.` 
            });
        }

        const updateSql = "UPDATE verificaciones_email SET Verificado = 1 WHERE Correo = ?";
        db.query(updateSql, [emailCorregido], (err) => {
            if (err) {
                console.error(" Error al verificar código:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al verificar código" 
                });
            }

            res.json({ 
                success: true, 
                message: " Correo verificado correctamente. Ya puedes completar tu registro." 
            });
        });
    });
});

// =============================================
// 🔄 REENVIAR CÓDIGO
// =============================================
router.post("/reenviar-codigo", async (req, res) => {
    const { Correo } = req.body;

    if (!Correo || !Correo.includes('@')) {
        return res.status(400).json({ 
            success: false, 
            message: "Correo inválido" 
        });
    }

    const emailCorregido = corregirEmail(Correo);

    const checkSql = "SELECT * FROM verificaciones_email WHERE Correo = ? AND Verificado = 0";
    db.query(checkSql, [emailCorregido], (err, results) => {
        if (err) {
            console.error(" Error al verificar:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al verificar" 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No hay una verificación pendiente para este correo" 
            });
        }

        const nuevoCodigo = generarCodigo();
        const fechaExpiracion = new Date();
        fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 10);

        const updateSql = `
            UPDATE verificaciones_email 
            SET Codigo = ?, Fecha_Expiracion = ?, Intentos = 0 
            WHERE Correo = ?
        `;

        db.query(updateSql, [nuevoCodigo, fechaExpiracion, emailCorregido], async (err) => {
            if (err) {
                console.error(" Error al actualizar código:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al reenviar código" 
                });
            }

            try {
                await enviarCodigoVerificacion(emailCorregido, nuevoCodigo);
                res.json({ 
                    success: true, 
                    message: " Nuevo código enviado a tu correo" 
                });
            } catch (emailError) {
                console.error(" Error al enviar correo:", emailError);
                res.status(500).json({ 
                    success: false, 
                    message: "Error al enviar el código" 
                });
            }
        });
    });
});

module.exports = router;