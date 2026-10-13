const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET = "secreto123";

// Middleware verificarToken (igual que en pedido.routes.js)
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

/**
 * Genera un número de autorización simulado, similar al que
 * entregaría una pasarela real (ej: Wompi / PayU / Stripe).
 */
function generarReferencia() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SIM-${Date.now()}-${random}`;
}

/**
 * Valida (de forma básica, NO real) los datos de una tarjeta.
 * Esto es solo una simulación pensada para fines educativos/demo,
 * no procesa dinero real ni se conecta a ninguna entidad bancaria.
 */
function validarTarjetaSimulada({ numeroTarjeta, nombreTitular, fechaExp, cvv }) {
  const errores = [];

  const numeroLimpio = (numeroTarjeta || "").replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(numeroLimpio)) {
    errores.push("El número de tarjeta debe tener entre 13 y 19 dígitos");
  }

  if (!nombreTitular || nombreTitular.trim().length < 3) {
    errores.push("El nombre del titular no es válido");
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaExp || "")) {
    errores.push("La fecha de expiración debe tener el formato MM/AA");
  } else {
    const [mes, anio] = fechaExp.split("/").map(Number);
    const ahora = new Date();
    const anioActual = ahora.getFullYear() % 100;
    const mesActual = ahora.getMonth() + 1;
    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      errores.push("La tarjeta está vencida");
    }
  }

  if (!/^\d{3,4}$/.test(cvv || "")) {
    errores.push("El CVV no es válido");
  }

  return { valido: errores.length === 0, errores, numeroLimpio };
}

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Simulación de pagos en línea (no procesa dinero real)
 */

/**
 * @swagger
 * /pagos/simular:
 *   post:
 *     summary: Simular el pago de un pedido con tarjeta
 *     description: >
 *       Simula una pasarela de pago. Valida el formato de la tarjeta,
 *       "procesa" el pago (con una pequeña espera artificial) y,
 *       si es aprobado, marca el pedido como pagado en la base de datos.
 *       NO se conecta a ninguna pasarela real ni almacena datos completos de tarjeta.
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pedidoId, numeroTarjeta, nombreTitular, fechaExp, cvv]
 *             properties:
 *               pedidoId:
 *                 type: integer
 *               numeroTarjeta:
 *                 type: string
 *                 example: "4111111111111111"
 *               nombreTitular:
 *                 type: string
 *                 example: "Laura Marroquin"
 *               fechaExp:
 *                 type: string
 *                 example: "12/28"
 *               cvv:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Pago aprobado
 *       400:
 *         description: Datos inválidos o pago rechazado
 *       404:
 *         description: Pedido no encontrado
 */
router.post("/simular", verificarToken, async (req, res) => {
  const usuarioId = req.usuarioId;
  const { pedidoId, numeroTarjeta, nombreTitular, fechaExp, cvv } = req.body;

  if (!pedidoId) {
    return res.status(400).json({ aprobado: false, message: "Falta el ID del pedido" });
  }

  const { valido, errores, numeroLimpio } = validarTarjetaSimulada({
    numeroTarjeta,
    nombreTitular,
    fechaExp,
    cvv,
  });

  if (!valido) {
    return res.status(400).json({ aprobado: false, message: errores.join(". ") });
  }

  // Verificar que el pedido exista y pertenezca al usuario autenticado
  const sqlPedido = "SELECT ID_Pedido, Total, Pagado, Estado FROM pedido WHERE ID_Pedido = ? AND ID_Usuario = ?";
  db.query(sqlPedido, [pedidoId, usuarioId], (err, result) => {
    if (err) {
      console.error("Error al buscar pedido para pago:", err);
      return res.status(500).json({ aprobado: false, message: "Error al procesar el pago" });
    }

    if (result.length === 0) {
      return res.status(404).json({ aprobado: false, message: "Pedido no encontrado" });
    }

    const pedido = result[0];

    if (pedido.Pagado) {
      return res.status(400).json({ aprobado: false, message: "Este pedido ya se encuentra pagado" });
    }

    // Simulamos latencia real de una pasarela de pago
    setTimeout(() => {
      // Simulación de rechazo: si la tarjeta termina en "0000" la marcamos como rechazada,
      // esto permite probar el flujo de error sin afectar el resto de tarjetas de prueba.
      const rechazada = numeroLimpio.endsWith("0000");

      if (rechazada) {
        return res.status(400).json({
          aprobado: false,
          message: "El banco emisor rechazó la transacción. Intenta con otra tarjeta.",
        });
      }

      const referencia = generarReferencia();
      const ultimos4 = numeroLimpio.slice(-4);

      const sqlUpdate = `
        UPDATE pedido
        SET Pagado = 1, Metodo_Pago = ?, Referencia_Pago = ?
        WHERE ID_Pedido = ?
      `;

      db.query(sqlUpdate, [`Tarjeta **** ${ultimos4}`, referencia, pedidoId], (err2) => {
        if (err2) {
          console.error("Error al marcar pedido como pagado:", err2);
          return res.status(500).json({ aprobado: false, message: "Pago simulado pero no se pudo actualizar el pedido" });
        }

        res.json({
          aprobado: true,
          message: "Pago aprobado",
          referencia,
          ultimos4,
          total: pedido.Total,
        });
      });
    }, 1200);
  });
});

module.exports = router;