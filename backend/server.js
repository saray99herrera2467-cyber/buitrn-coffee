  const express = require("express");
  const cors = require("cors");
  const cron = require('node-cron');
const axios = require('axios');
  require("dotenv").config();

  const connection = require("./config/db");

  const authRoutes = require("./routes/auth.routes");
  const productoRoutes = require("./routes/producto.routes");
  const carritoRoutes = require("./routes/carrito.routes");
  const pedidoRoutes = require("./routes/pedido.routes");
  const pqrsRoutes = require("./routes/pqrs.routes");
  const resenasRoutes = require("./routes/resenas.routes");


  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/imagenes", express.static("imagenes"));

  app.use("/api/auth", authRoutes);

  app.use("/api/pedidos", pedidoRoutes);

  app.use("/api/productos", productoRoutes);

  app.use("/api/carrito", carritoRoutes);

  app.use("/api/pqrs", pqrsRoutes);

  app.use("/api/resenas", resenasRoutes);

  app.get("/api/productos/:id", (req, res) => {
    const id = req.params.id;

    connection.query(
      "SELECT * FROM producto WHERE ID_Producto = ?",
      [id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(results[0]);
      }
    );
  });

  cron.schedule('0 * * * *', async () => {
  console.log('🔄 Verificando pedidos vencidos...', new Date().toLocaleString());
  try {
    const response = await axios.post('http://localhost:3001/api/pedidos/cancelar-vencidos');
    console.log('✅', response.data.message, `(${response.data.actualizados} cancelados)`);
  } catch (error) {
    console.error('❌ Error al cancelar pedidos vencidos:', error.message);
  }
});

console.log(' Cron job programado: verificar pedidos vencidos cada hora');


  // 🚀 SERVER
  app.listen(process.env.PORT, () => {
    console.log("Servidor corriendo en puerto", process.env.PORT);
  });