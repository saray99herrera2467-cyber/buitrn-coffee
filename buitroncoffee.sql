-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-07-2026 a las 03:33:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `buitroncoffee`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `ID_Carrito` int(11) NOT NULL,
  `ID_Usuario` int(11) NOT NULL,
  `ID_Producto` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL DEFAULT 1,
  `Fecha_Agregado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`ID_Carrito`, `ID_Usuario`, `ID_Producto`, `Cantidad`, `Fecha_Agregado`) VALUES
(7, 6, 2, 2, '2026-07-02 22:41:43'),
(10, 6, 1, 1, '2026-07-02 23:00:41'),
(13, 5, 1, 2, '2026-07-02 23:13:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `ID_Detalle` int(11) NOT NULL,
  `ID_Pedido` int(11) NOT NULL,
  `ID_Producto` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `PrecioUnitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`ID_Detalle`, `ID_Pedido`, `ID_Producto`, `Cantidad`, `PrecioUnitario`) VALUES
(1, 1, 4, 5, 12000.00),
(2, 2, 3, 10, 25000.00),
(3, 3, 2, 20, 20000.00),
(4, 4, 1, 28, 15000.00),
(5, 5, 1, 2, 15000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrada`
--

CREATE TABLE `entrada` (
  `ID_Entrada` int(11) NOT NULL COMMENT 'Identificador único de la entrada de inventario',
  `ID_Proveedor` int(11) NOT NULL COMMENT 'Proveedor que realiza la entrada',
  `Fecha_entrada` date NOT NULL COMMENT 'Fecha en la que se hizo la entrada de productos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `ID_Pedido` int(11) NOT NULL,
  `ID_Usuario` int(11) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Subtotal` decimal(10,2) NOT NULL,
  `Total` decimal(10,2) NOT NULL,
  `Estado` varchar(50) DEFAULT 'Pendiente',
  `Fecha_Limite` datetime DEFAULT NULL COMMENT 'Fecha límite para pago del pedido',
  `Pagado` tinyint(1) DEFAULT 0 COMMENT '0=No pagado, 1=Pagado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`ID_Pedido`, `ID_Usuario`, `Fecha`, `Subtotal`, `Total`, `Estado`, `Fecha_Limite`, `Pagado`) VALUES
(1, 5, '2026-07-02 14:53:58', 60000.00, 60000.00, 'Entregado', '2026-07-04 14:53:58', 0),
(2, 7, '2026-07-02 14:57:43', 250000.00, 250000.00, 'Entregado', '2026-07-04 14:57:43', 0),
(3, 8, '2026-07-02 15:09:34', 400000.00, 400000.00, 'Entregado', '2026-07-04 15:09:34', 0),
(4, 5, '2026-07-02 15:37:31', 420000.00, 420000.00, 'Entregado', '2026-07-04 15:37:31', 0),
(5, 7, '2026-07-02 18:21:05', 30000.00, 24000.00, 'Pendiente', '2026-07-04 18:21:05', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pqrs`
--

CREATE TABLE `pqrs` (
  `ID_PQRS` int(11) NOT NULL,
  `Codigo_Referencia` varchar(50) NOT NULL,
  `ID_Usuario` int(11) DEFAULT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Tipo` enum('pregunta','queja','reclamo','sugerencia','felicitacion') NOT NULL,
  `Descripcion` text NOT NULL,
  `Estado` enum('pendiente','en proceso','resuelta','cerrada') DEFAULT 'pendiente',
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `Fecha_Actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Respuesta` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pqrs`
--

INSERT INTO `pqrs` (`ID_PQRS`, `Codigo_Referencia`, `ID_Usuario`, `Nombre`, `Email`, `Telefono`, `Tipo`, `Descripcion`, `Estado`, `Fecha_Creacion`, `Fecha_Actualizacion`, `Respuesta`) VALUES
(1, 'PQRS-20260702-644292', 7, 'Santiago Rodriguez', 'santidavila233@gmail.com', '1478965236', 'pregunta', 'Buenas tardes, quisiera saber en cuanto tiempo tengo limite para poder ir a por mi cafesito', 'resuelta', '2026-07-02 19:58:17', '2026-07-02 20:00:15', 'Buenas tardes, el tiempo limite que tienes para venir por tu café es de 1d y 15hrs, te esperamos pronto y muchas gracias por la confianza ');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `ID_Producto` int(11) NOT NULL COMMENT 'Identificador único del producto',
  `Nombre_producto` varchar(100) NOT NULL COMMENT 'Nombre comercial del producto',
  `Descripcion` varchar(255) DEFAULT NULL COMMENT 'Detalle o información general del producto',
  `Categoria` varchar(100) NOT NULL COMMENT 'Nivel de tostado o clasificación técnica del producto',
  `Precio` decimal(10,2) NOT NULL COMMENT 'Precio unitario del producto',
  `Stock` int(100) NOT NULL COMMENT 'Cantidad de productos disponibles',
  `imagen` varchar(255) DEFAULT NULL COMMENT 'Nombre del archivo de imagen del producto',
  `Estado` tinyint(1) DEFAULT 1 COMMENT '0=Inactivo, 1=Activo',
  `ID_Proveedor` int(11) DEFAULT NULL COMMENT 'Llave foránea al proveedor',
  `calificacion_promedio` decimal(3,2) DEFAULT 0.00,
  `total_resenas` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`ID_Producto`, `Nombre_producto`, `Descripcion`, `Categoria`, `Precio`, `Stock`, `imagen`, `Estado`, `ID_Proveedor`, `calificacion_promedio`, `total_resenas`) VALUES
(1, 'Café Tostado', 'Café con un sabor unico y delicioso', 'Tostado', 15000.00, 100, 'cafe1.jpeg', 1, NULL, 5.00, 1),
(2, 'Café Geisha', 'Café con un toque de sabor picante', 'Molido', 20000.00, 10, 'cafe1.jpeg', 1, NULL, 2.00, 1),
(3, 'Café Bourbon Rosado', 'Delicioso café con un sabor especial', 'Fino', 25000.00, 20, 'cafe1.jpeg', 1, NULL, 4.00, 1),
(4, 'Café Molido', 'Delicioso café molido ', 'Molido', 12000.00, 25, 'cafe1.jpeg', 1, NULL, 3.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promociones`
--

CREATE TABLE `promociones` (
  `ID_Promocion` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL COMMENT 'Nombre de la promoción',
  `Descripcion` text DEFAULT NULL COMMENT 'Descripción detallada',
  `Tipo` enum('descuento_porcentaje','descuento_fijo','2x1','puntos_dobles','combo') NOT NULL COMMENT 'Tipo de promoción',
  `Valor` decimal(10,2) DEFAULT NULL COMMENT 'Valor del descuento (porcentaje o monto fijo)',
  `Codigo` varchar(50) DEFAULT NULL COMMENT 'Código promocional (para cupones)',
  `ID_Producto` int(11) DEFAULT NULL COMMENT 'Producto específico (NULL = todos)',
  `Minimo_Compra` decimal(10,2) DEFAULT NULL COMMENT 'Monto mínimo para aplicar la promoción',
  `Fecha_Inicio` datetime NOT NULL COMMENT 'Fecha de inicio de la promoción',
  `Fecha_Fin` datetime NOT NULL COMMENT 'Fecha de fin de la promoción',
  `Stock_Limite` int(11) DEFAULT NULL COMMENT 'Cantidad máxima de usos',
  `Usos_Actuales` int(11) DEFAULT 0 COMMENT 'Cantidad de usos actuales',
  `Estado` tinyint(1) DEFAULT 1 COMMENT '1=Activa, 0=Inactiva',
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `promociones`
--

INSERT INTO `promociones` (`ID_Promocion`, `Nombre`, `Descripcion`, `Tipo`, `Valor`, `Codigo`, `ID_Producto`, `Minimo_Compra`, `Fecha_Inicio`, `Fecha_Fin`, `Stock_Limite`, `Usos_Actuales`, `Estado`, `Fecha_Creacion`) VALUES
(6, 'Descuento 20% en Café Tostado', 'Aprovecha el 20% de descuento', 'descuento_porcentaje', 20.00, 'CAFETOSTADO', 1, 30000.00, '2026-07-02 14:42:00', '2026-07-03 14:42:00', 80, 1, 1, '2026-07-02 23:19:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `ID_Proveedor` int(11) NOT NULL COMMENT 'Identificador único del proveedor',
  `Nombre_proveedor` varchar(100) NOT NULL COMMENT 'Nombre del proveedor',
  `Apellido` varchar(100) NOT NULL COMMENT 'Apellido del proveedor',
  `Telefono` varchar(20) NOT NULL COMMENT 'Número telefónico del proveedor',
  `Correo` varchar(100) NOT NULL COMMENT 'Correo electrónico del proveedor',
  `Direccion` varchar(255) NOT NULL COMMENT 'Dirección física del proveedor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reseñas`
--

CREATE TABLE `reseñas` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reseñas`
--

INSERT INTO `reseñas` (`id`, `producto_id`, `usuario_id`, `nombre_usuario`, `calificacion`, `comentario`, `fecha`, `estado`) VALUES
(1, 1, 9, 'Diego', 5, 'que café tan rico y delicioso, lo recomiendo mucho', '2026-07-02 20:42:24', 'aprobada'),
(2, 2, 9, 'Diego', 2, 'La verdad esperaba mas sabor pero no lo volveria a pedir', '2026-07-02 20:42:53', 'aprobada'),
(3, 3, 5, 'Laura', 4, 'Esta muy rico no voy a negarlo pero siento que sabe como a canela y no me gusta y tampoco lo dice en la descripción', '2026-07-02 20:54:21', 'aprobada'),
(4, 4, 5, 'Laura', 3, 'No me gusto casi ya que tiene un sabor un poco amargo', '2026-07-02 20:54:51', 'aprobada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `ID_Rol` int(11) NOT NULL COMMENT 'Identificador único del rol asignado',
  `Descripcion` varchar(100) NOT NULL COMMENT 'Descripción del rol y sus funciones',
  `Tipo_rol` varchar(50) NOT NULL COMMENT 'Tipo o categoría del rol'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`ID_Rol`, `Descripcion`, `Tipo_rol`) VALUES
(1, 'Administrador del sistema', 'Admin'),
(2, 'Usuario del sistema', 'Usuario'),
(3, 'Proveedor de los productos', 'Proveedor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `ID_Usuario` int(11) NOT NULL COMMENT 'Identificador único del usuario dentro del sistema',
  `Nombre_usuario` varchar(50) NOT NULL COMMENT 'Nombre del usuario registrado',
  `Apellido` varchar(50) NOT NULL COMMENT 'Apellido del usuario registrado',
  `Correo` varchar(100) NOT NULL COMMENT 'Dirección de correo usada para autenticación y notificaciones',
  `Documento` varchar(10) NOT NULL COMMENT 'Número de documento de identidad del usuario',
  `Telefono` varchar(20) NOT NULL COMMENT 'Número de teléfono de contacto',
  `Clave` varchar(255) NOT NULL COMMENT 'Contraseña de acceso del usuario (encriptada)',
  `ID_Rol` int(11) NOT NULL COMMENT 'Llave foránea que indica el rol o tipo de usuario dentro del sistema',
  `Estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`ID_Usuario`, `Nombre_usuario`, `Apellido`, `Correo`, `Documento`, `Telefono`, `Clave`, `ID_Rol`, `Estado`) VALUES
(5, 'Laura', 'Marroquín', 'lauramarro2018@gmail.com', '1028863203', '3196160291', '$2b$10$YINV.uetJ9Vx0i4KN2Ukce9gDuPIPgXojAkZWS/XZSLyYe7/kU6Fe', 2, 1),
(6, 'Elkin', 'Leguizamon', 'elkinl1023@msn.com', '1025874899', '3198976547', '$2b$10$mXQ8XJmYP5nKsZofZzsbL.vpY.W5WEq6AEmuyV4UM249RXmSG5HgS', 1, 1),
(7, 'Santiago', 'Rodriguez', 'santidavila233@gmail.com', '1478596321', '1478965236', '$2b$10$eMjXOqNfrLNJRp/ug9Jx8OWj0vW1QOhdrRH5ZnS68jubp3EhkVtKi', 2, 1),
(8, 'Saray', 'Herrera', 'saray99herrera2467@gmail.com', '1021676369', '32012365478', '$2b$10$Wtu238nNozGS.qxMER1Hb.0UohWeKX6Ed9Q5gJEzVE3wqwtd3W0pm', 2, 1),
(9, 'Diego', 'Guerrero', 'diego7guerrero2007@gmail.com', '1074527054', '32589665478', '$2b$10$/WwZ8S5zk1qU30llKqLwROARr8UUHi5LWDsCrvQAWQF3opjF1U3Hy', 2, 1),
(10, 'Sharon', 'Parraga', 'parragavaleria740@gmail.com', '1023377256', '3254789654', '$2b$10$XAPItW28btxVtV2vQjrUheQdvFAkEtfdtNhgJT3B0ZjnMFAbjHsm.', 2, 1),
(11, 'Alexander', 'Prieto', 'josueprieto302006@gmail.com', '1024480716', '3258966547', '$2b$10$rbCXWwmm42k4mm9B/oXk1u011snCshUX/qwC2JBYZp9qhk/XM6gLS', 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `verificaciones_email`
--

CREATE TABLE `verificaciones_email` (
  `ID_Verificacion` int(11) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `Codigo` varchar(6) NOT NULL,
  `Intentos` int(11) DEFAULT 0,
  `Fecha_Creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `Fecha_Expiracion` datetime NOT NULL,
  `Verificado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `verificaciones_email`
--

INSERT INTO `verificaciones_email` (`ID_Verificacion`, `Correo`, `Codigo`, `Intentos`, `Fecha_Creacion`, `Fecha_Expiracion`, `Verificado`) VALUES
(1, 'kuramita200@gmail.com', '883442', 0, '2026-07-03 00:15:30', '2026-07-02 19:25:30', 0),
(2, 'kuramita2000@gmail.com', '884418', 0, '2026-07-03 00:17:32', '2026-07-02 19:27:32', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`ID_Carrito`),
  ADD KEY `ID_Usuario` (`ID_Usuario`),
  ADD KEY `ID_Producto` (`ID_Producto`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`ID_Detalle`),
  ADD KEY `ID_Pedido` (`ID_Pedido`),
  ADD KEY `ID_Producto` (`ID_Producto`);

--
-- Indices de la tabla `entrada`
--
ALTER TABLE `entrada`
  ADD PRIMARY KEY (`ID_Entrada`),
  ADD KEY `fk_entrada_proveedor` (`ID_Proveedor`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`ID_Pedido`),
  ADD KEY `ID_Usuario` (`ID_Usuario`);

--
-- Indices de la tabla `pqrs`
--
ALTER TABLE `pqrs`
  ADD PRIMARY KEY (`ID_PQRS`),
  ADD UNIQUE KEY `Codigo_Referencia` (`Codigo_Referencia`),
  ADD KEY `ID_Usuario` (`ID_Usuario`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`ID_Producto`),
  ADD KEY `ID_Proveedor` (`ID_Proveedor`);

--
-- Indices de la tabla `promociones`
--
ALTER TABLE `promociones`
  ADD PRIMARY KEY (`ID_Promocion`),
  ADD UNIQUE KEY `Codigo_UNIQUE` (`Codigo`),
  ADD KEY `ID_Producto` (`ID_Producto`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`ID_Proveedor`),
  ADD UNIQUE KEY `Correo` (`Correo`);

--
-- Indices de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`ID_Rol`),
  ADD UNIQUE KEY `Tipo_rol` (`Tipo_rol`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID_Usuario`),
  ADD UNIQUE KEY `Nombre_usuario` (`Nombre_usuario`),
  ADD UNIQUE KEY `Correo` (`Correo`),
  ADD UNIQUE KEY `Documento` (`Documento`),
  ADD UNIQUE KEY `Telefono` (`Telefono`),
  ADD KEY `fk_usuario_rol` (`ID_Rol`);

--
-- Indices de la tabla `verificaciones_email`
--
ALTER TABLE `verificaciones_email`
  ADD PRIMARY KEY (`ID_Verificacion`),
  ADD UNIQUE KEY `Correo_UNIQUE` (`Correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `ID_Carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `ID_Detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `entrada`
--
ALTER TABLE `entrada`
  MODIFY `ID_Entrada` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la entrada de inventario';

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `ID_Pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `pqrs`
--
ALTER TABLE `pqrs`
  MODIFY `ID_PQRS` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `ID_Producto` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del producto', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `promociones`
--
ALTER TABLE `promociones`
  MODIFY `ID_Promocion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `ID_Proveedor` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del proveedor';

--
-- AUTO_INCREMENT de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `ID_Rol` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del rol asignado', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID_Usuario` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del usuario dentro del sistema', AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `verificaciones_email`
--
ALTER TABLE `verificaciones_email`
  MODIFY `ID_Verificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`),
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`ID_Pedido`) REFERENCES `pedido` (`ID_Pedido`),
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`);

--
-- Filtros para la tabla `entrada`
--
ALTER TABLE `entrada`
  ADD CONSTRAINT `fk_entrada_proveedor` FOREIGN KEY (`ID_Proveedor`) REFERENCES `proveedor` (`ID_Proveedor`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`);

--
-- Filtros para la tabla `pqrs`
--
ALTER TABLE `pqrs`
  ADD CONSTRAINT `pqrs_ibfk_1` FOREIGN KEY (`ID_Usuario`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`ID_Proveedor`) REFERENCES `usuario` (`ID_Usuario`);

--
-- Filtros para la tabla `promociones`
--
ALTER TABLE `promociones`
  ADD CONSTRAINT `promociones_ibfk_1` FOREIGN KEY (`ID_Producto`) REFERENCES `producto` (`ID_Producto`) ON DELETE SET NULL;

--
-- Filtros para la tabla `reseñas`
--
ALTER TABLE `reseñas`
  ADD CONSTRAINT `reseñas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`ID_Producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `reseñas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`ID_Usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`ID_Rol`) REFERENCES `rol` (`ID_Rol`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
