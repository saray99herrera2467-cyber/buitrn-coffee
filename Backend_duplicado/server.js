const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const productoRoutes = require("./routes/producto.routes");
const carritoRoutes = require("./routes/carrito.routes");
const pedidoRoutes = require("./routes/pedido.routes");
const pqrsRoutes = require("./routes/pqrs.routes");
const resenasRoutes = require("./routes/resenas.routes");
const promocionesRoutes = require("./routes/promociones.routes");
const pagoRoutes = require("./routes/pago.routes");
const estadisticasRoutes = require("./routes/estadisticas.routes");
const verificacionRoutes = require("./routes/verificacion.routes");

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
app.use("/api/promociones", promocionesRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/admin", estadisticasRoutes);
app.use("/api/verificacion-email", verificacionRoutes);
 //  SERVER
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
  });
}

module.exports = app;