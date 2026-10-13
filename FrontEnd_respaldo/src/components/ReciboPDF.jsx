import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '1px solid #E0E0E0',
    paddingBottom: 20
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10
  },
  empresaInfo: {
    textAlign: 'right'
  },
  empresaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C49A6C',
    marginBottom: 5
  },
  empresaDetalle: {
    fontSize: 10,
    color: '#666666'
  },
  tituloRecibo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333333'
  },
  infoCliente: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 5
  },
  infoClienteTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#C49A6C'
  },
  infoClienteTexto: {
    fontSize: 10,
    marginBottom: 5,
    color: '#333333'
  },
  tabla: {
    marginBottom: 30
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderBottom: '1px solid #E0E0E0'
  },
  tablaHeaderTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666'
  },
  tablaFila: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1px solid #F0F0F0'
  },
  tablaFilaTexto: {
    fontSize: 9,
    color: '#333333'
  },
  columnaProducto: { width: '40%' },
  columnaCantidad: { width: '15%', textAlign: 'center' },
  columnaPrecioUnitario: { width: '20%', textAlign: 'right' },
  columnaSubtotal: { width: '25%', textAlign: 'right' },
  resumen: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 5
  },
  lineaResumenTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2px solid #C49A6C'
  },
  textoResumenTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C49A6C'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1px solid #E0E0E0',
    paddingTop: 15,
    fontSize: 8,
    color: '#999999'
  },
  advertencia: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 5,
    textAlign: 'center'
  },
  advertenciaTexto: {
    fontSize: 9,
    color: '#E67E22'
  }
});

const ReciboPDF = ({ compra, usuario, fecha, fechaLimite, numeroRecibo }) => {
  const items = compra?.items || [];
  const subtotal = compra?.subtotal || 0;
  const total = compra?.total || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} src="http://localhost:3001/imagenes/logob.png" />
            <View>
              <Text style={styles.empresaNombre}>Buitrón Coffee</Text>
              <Text style={styles.empresaDetalle}>Café de especialidad</Text>
            </View>
          </View>
          <View style={styles.empresaInfo}>
            <Text style={styles.empresaDetalle}>NIT: 901.234.567-8</Text>
            <Text style={styles.empresaDetalle}>Tel: (601) 123 4567</Text>
            <Text style={styles.empresaDetalle}>Bogotá, Colombia</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.tituloRecibo}>RECIBO DE PEDIDO</Text>

        {/* Información del cliente */}
        <View style={styles.infoCliente}>
          <Text style={styles.infoClienteTitulo}>DATOS DEL CLIENTE</Text>
          <Text style={styles.infoClienteTexto}>Nombre: {usuario?.Nombre_usuario || ''} {usuario?.Apellido || ''}</Text>
          <Text style={styles.infoClienteTexto}>Documento: {usuario?.Documento || 'No especificado'}</Text>
          <Text style={styles.infoClienteTexto}>Teléfono: {usuario?.Telefono || 'No especificado'}</Text>
          <Text style={styles.infoClienteTexto}>Correo: {usuario?.Correo || 'No especificado'}</Text>
        </View>

        {/* Datos del pedido */}
        <View style={styles.infoCliente}>
          <Text style={styles.infoClienteTitulo}>DATOS DEL PEDIDO</Text>
          <Text style={styles.infoClienteTexto}>Número de pedido: {numeroRecibo}</Text>
          <Text style={styles.infoClienteTexto}>Fecha del pedido: {fecha}</Text>
          <Text style={styles.infoClienteTexto}>Fecha límite de pago: {fechaLimite}</Text>
          <Text style={styles.infoClienteTexto}>Estado de pago: Pendiente</Text>
        </View>

        {/* Tabla de productos */}
        <View style={styles.tabla}>
          <View style={styles.tablaHeader}>
            <Text style={[styles.tablaHeaderTexto, styles.columnaProducto]}>DESCRIPCIÓN</Text>
            <Text style={[styles.tablaHeaderTexto, styles.columnaCantidad]}>CANTIDAD</Text>
            <Text style={[styles.tablaHeaderTexto, styles.columnaPrecioUnitario]}>PRECIO UNIT.</Text>
            <Text style={[styles.tablaHeaderTexto, styles.columnaSubtotal]}>SUBTOTAL</Text>
          </View>

          {items.map((item, index) => (
            <View style={styles.tablaFila} key={index}>
              <Text style={[styles.tablaFilaTexto, styles.columnaProducto]}>
                {item.Nombre_producto}
              </Text>
              <Text style={[styles.tablaFilaTexto, styles.columnaCantidad]}>
                {item.Cantidad}
              </Text>
              <Text style={[styles.tablaFilaTexto, styles.columnaPrecioUnitario]}>
                ${(item.PrecioUnitario || item.Precio || 0).toLocaleString()}
              </Text>
              <Text style={[styles.tablaFilaTexto, styles.columnaSubtotal]}>
                ${((item.PrecioUnitario || item.Precio || 0) * item.Cantidad).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.resumen}>
          <View style={styles.lineaResumenTotal}>
            <Text style={styles.textoResumenTotal}>TOTAL DEL PEDIDO:</Text>
            <Text style={styles.textoResumenTotal}>${(total || 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Advertencia */}
        <View style={styles.advertencia}>
          <Text style={styles.advertenciaTexto}>
            ⚠️ IMPORTANTE: Si no realizas el pago antes de la fecha límite, tu pedido será cancelado.
          </Text>
          <Text style={styles.advertenciaTexto}>
            El pago se realiza contra entrega en nuestro punto de venta.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Buitrón Coffee - Calidad y tradición en cada taza</Text>
          <Text>¡Gracias por tu preferencia!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReciboPDF;