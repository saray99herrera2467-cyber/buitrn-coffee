const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'buitroncoffee'
});

const cancelarPedidosVencidos = () => {
  const sql = `
    SELECT p.ID_Pedido, 
           GROUP_CONCAT(dp.ID_Producto, ':', dp.Cantidad SEPARATOR ',') as productos
    FROM pedido p
    INNER JOIN detalle_pedido dp ON p.ID_Pedido = dp.ID_Pedido
    WHERE p.Estado = 'Pendiente' 
      AND p.Fecha_Limite < NOW()
      AND p.Pagado = 0
    GROUP BY p.ID_Pedido
  `;

  connection.query(sql, (err, pedidosVencidos) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    if (pedidosVencidos.length === 0) {
      console.log('No hay pedidos vencidos');
      connection.end();
      return;
    }

    pedidosVencidos.forEach(pedido => {
      connection.query("UPDATE pedido SET Estado = 'Cancelado' WHERE ID_Pedido = ?", [pedido.ID_Pedido]);
      
      const productos = pedido.productos.split(',');
      productos.forEach(item => {
        const [productoId, cantidad] = item.split(':');
        connection.query("UPDATE producto SET Stock = Stock + ? WHERE ID_Producto = ?", [parseInt(cantidad), productoId]);
      });
      
      console.log(`✅ Pedido #${pedido.ID_Pedido} cancelado y stock devuelto`);
    });

    console.log(`Total: ${pedidosVencidos.length} pedidos cancelados`);
    connection.end();
  });
};

cancelarPedidosVencidos();