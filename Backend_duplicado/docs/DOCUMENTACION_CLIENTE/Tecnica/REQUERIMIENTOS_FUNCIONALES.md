# INTRODUCCIÓN


# 1.1 PROPOSITO
El propósito de este documento es describir con precisión los requisitos funcionales y no funcionales necesarios para la construcción de un sistema de información web que facilite la gestión, operación y promoción de los servicios de la empresa Buitron Coffee. De esta manera se establece una base común de entendimiento entre los desarrolladores, usuarios y demás interesados en el proyecto.
# 1.2 ALCANCE 

**Incluirá (dentro del alcance):**
-  Registro, inicio y cierre de sesión con control de acceso por roles (Admin, Usuario, Proveedor)
-  Recuperación de contraseña mediante código enviado por correo
-  Gestión de usuarios (crear, editar, activar/desactivar; sin eliminación)
-  Gestión de productos (crear, modificar, inhabilitar)
-  Catálogo digital de consulta pública con imagen, precio y categoría
-  Gestión de pedidos con cálculo automático del total
-  Historial de pedidos por usuario
-  Control de inventario (actualización automática y ajustes manuales)
-  Sistema de reseñas y calificaciones (1 a 5 estrellas) con aprobación del administrador
-  Gestión de PQRS (Pendiente / En proceso / Resuelta / Cerrada)
-  Gestión de promociones
-  Panel de administración
-  Acceso desde computadores, tablets y smartphones mediante navegador

**No incluirá (fuera de alcance):**
-  Facturación electrónica (DIAN)
-  Nómina o recursos humanos
-  Contabilidad avanzada
-  Gestión de envíos y logística de transporte
-  Aplicación móvil nativa (solo versión web responsive)

# 1.3 DEFINICION Y ACRONIMOS

| 
# 1.4 REFERENCIA
- Guía IEEE 830 para la especificación de requerimientos de software
- Documentación oficial de React: https://react.dev/
- Documentación oficial de Vite: https://vite.dev/guide/
- Documentación oficial de JavaScript (MDN): https://developer.mozilla.org/es/docs/Web/JavaScript
- Documentación oficial de Node.js: https://nodejs.org/docs/latest/api/
- Documentación oficial de Supabase: https://supabase.com/docs
- Documentación oficial de PostgreSQL: https://www.postgresql.org/docs/
- Documentación oficial de Auth0: https://auth0.com/docs
- Ley 1581 de 2012 (protección de datos personales, Colombia) 

# 2  DESCRPCION GENERAL
## 2. DESCRIPCIÓN GENERAL

### 2.1 Perspectiva del producto

El producto es un **aplicativo web** para Buitrón Coffee que permite gestionar
sus productos, pedidos e inventario, y ofrece a los clientes un catálogo
público, reseñas y canales de atención directa. Es compatible con cualquier
dispositivo con conexión a Internet (computadores, portátiles, tablets y
smartphones) mediante un navegador moderno.

Es un sistema independiente con arquitectura cliente-servidor:

- **Frontend:** React con JSX, construido con Vite y con diseño responsivo
- **Backend:** Node.js con JavaScript, que expone una API que devuelve JSON
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Auth0, plataforma de autenticación segura
- **Despliegue:** por definir
- **Comunicaciones:** HTTPS

### 2.2 Funciones principales

- Registro, inicio y cierre de sesión de usuarios, y recuperación de contraseña
- Gestión de usuarios, productos, promociones e inventario
- Catálogo visual de consulta pública, sin necesidad de iniciar sesión
- Creación de pedidos e historial de pedidos
- Calificación y reseñas de productos, con aprobación del administrador
- Gestión de PQRS como canal de comunicación directa con la empresa
- Panel de administración y barra de navegación clara y accesible

### 2.3 Características de Usuarios

| Tipo de Usuario | Descripción | Nivel Técnico |
|-----------------|-------------|---------------|
| **Administrador** | Gestiona usuarios, productos, inventario, pedidos, reseñas, PQRS y promociones | Medio / Alto |
| **Usuario / Cliente** | Consulta el catálogo, realiza pedidos, deja reseñas y crea PQRS | Básico |
| **Proveedor** | Suministra productos a la empresa (funciones por definir) | Básico / Medio |

### 2.4 Restricciones

- El frontend se desarrollará con React (JSX) y Vite, con diseño responsivo
- El backend se desarrollará en Node.js con JavaScript
- La base de datos será Supabase (PostgreSQL), de tipo relacional
- La autenticación se gestionará mediante Auth0
- El sistema debe funcionar en navegadores modernos (Chrome, Firefox y Edge actualizados)
- Las comunicaciones deben usar HTTPS
- No se permite eliminar usuarios ni registros con datos relacionados (solo inhabilitarlos)
- Debe cumplir la Ley 1581 de 2012 sobre protección de datos personales
- No se integrará con sistemas bancarios, nómina ni contabilidad avanzada

### 2.5 Suposiciones y dependencias

- Los usuarios tendrán conexión estable a Internet y navegadores actualizados
- El sistema depende de servicios externos: Supabase (base de datos), Auth0
  (autenticación) y la plataforma de despliegue
- Se asume que estos servicios estarán disponibles y dentro de los límites de
  su plan contratado
- Si alguno de estos servicios cambia, falla o deja de estar disponible, el
  desarrollo o funcionamiento del sistema podría verse afectado


# 3 REQUERIMIENTOS 



###  Módulo de Autenticación y Seguridad

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF01** | Registro de usuarios | Registro obligatorio para realizar pedidos y reseñas; validación de datos únicos (nombre de usuario, correo, documento, teléfono); asignación de rol (Admin, Usuario, Proveedor) | El sistema validará que los campos obligatorios estén completos y que los datos únicos no se encuentren registrados previamente. | Alta |
| **RF02** | Inicio de sesión | Validación de credenciales; acceso según rol; mensajes de error controlados | Si la autenticación es correcta, el usuario será redireccionado según su rol; en caso contrario, se mostrará un mensaje de error. | Alta |
| **RF03** | Cierre de sesión | Finalización segura de sesión; eliminación de sesión activa | El sistema permitirá al usuario cerrar sesión de manera segura, invalidando su sesión activa y evitando accesos no autorizados. | Alta |
| **RF14** | Recuperación de contraseña | Envío de correo; generación de código de restablecimiento | El sistema permitirá al usuario restablecer su contraseña mediante un código enviado al correo registrado. | Media |

###  Módulo de Gestión de Usuarios

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF04** | Gestión de usuarios | Crear, editar e inhabilitar usuarios; asignar roles; activar o desactivar cuentas | El administrador podrá gestionar las cuentas de usuario y cambiar roles (Admin, Usuario, Proveedor). El sistema no permitirá eliminar usuarios, solo desactivarlos. | Alta |

###  Módulo de Productos y Catálogo

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF05** | Gestión de productos | Crear, modificar e inhabilitar productos; actualización inmediata del catálogo | El administrador podrá registrar nuevos productos, modificar su información (nombre, categoría, precio, descripción, stock) e inhabilitarlos. | Alta |
| **RF06** | Visualización de catálogo | Consulta pública; visualización de imagen, precio y categoría | Cualquier persona podrá visualizar el catálogo de productos sin necesidad de autenticación. | Alta |
| **RF15** | Gestión de promociones | Crear, editar e inhabilitar promociones; definir vigencia y descuento; asociar a productos | El administrador podrá crear promociones con fecha de inicio, fecha de fin y porcentaje o valor de descuento, y asociarlas a uno o varios productos. El catálogo mostrará el precio promocional mientras la promoción esté vigente. | Baja |

###  Módulo de Pedidos

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF07** | Gestión de pedidos | Crear pedido; asociar productos y cantidades; cálculo automático del total | El usuario autenticado podrá crear pedidos seleccionando productos y cantidades. El sistema registrará la fecha, asociará el pedido al usuario y calculará el total automáticamente. | Alta |
| **RF08** | Historial de pedidos | Consulta de pedidos anteriores; visualización del detalle | El usuario podrá consultar el historial de sus pedidos, mostrando fecha, productos y total. | Media |

###  Módulo de Inventario

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF09** | Gestión de inventario | Actualización automática por ventas y entradas; ajustes manuales | El sistema actualizará automáticamente el inventario cuando se registren ventas o entradas. El administrador podrá realizar ajustes manuales cuando sea necesario. | Alta |

###  Módulo de Reseñas y Calificaciones

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF13** | Sistema de reseñas | Calificación de 1 a 5 estrellas; comentario | Los usuarios registrados podrán calificar productos y dejar reseñas, visibles públicamente una vez aprobadas por el administrador. | Media |
| **RF10** | Aprobación de reseñas | El administrador aprueba o rechaza reseñas; afecta la calificación del producto | Las reseñas requieren aprobación del administrador. Al aprobarse, se actualiza el promedio de calificación del producto. | Media |

###  Módulo de PQRS

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF12** | Gestión de PQRS | Crear PQRS; consultar estado; el administrador responde y cambia el estado | Los usuarios podrán crear un PQRS y consultar su estado. El administrador podrá visualizarlo, responderlo y actualizar su estado (Pendiente / En proceso / Resuelta / Cerrada). | Media |

###  Módulo de Administración

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RF11** | Panel de administrador | Acceso exclusivo para el administrador; gestión de usuarios, productos, promociones, pedidos, inventario, PQRS y reseñas | Panel exclusivo para el administrador que centraliza todas las funciones de gestión del sistema. | Alta |

# 4 REQUERIMIENTOS NO FUNCIONALES

| ID | Nombre | Características | Descripción | Prioridad |
|----|--------|-----------------|-------------|-----------|
| **RNF01** | Seguridad | Autenticación gestionada por Auth0; control de acceso por roles; uso obligatorio de HTTPS; protección de datos personales | El sistema garantizará la protección de la información: la autenticación y el almacenamiento de credenciales serán gestionados por Auth0, y el acceso a las funciones se restringirá según el rol asignado. | Alta |
| **RNF02** | Compatibilidad | Funcionamiento en múltiples sistemas operativos; soporte para navegadores modernos; diseño responsivo | El sistema funcionará correctamente en Google Chrome, Mozilla Firefox y Microsoft Edge actualizados, desde computadores, tablets y smartphones. | Alta |
| **RNF03** | Disponibilidad y fiabilidad | Funcionamiento continuo; mínima ocurrencia de fallos críticos; recuperación ante errores | El sistema operará de manera estable con una disponibilidad mínima del 95% mensual (sujeta a los planes de Supabase, Auth0 y la plataforma de despliegue) y permitirá la recuperación de la información sin pérdida de datos. | Alta |
| **RNF04** | Portabilidad | Despliegue en servicios en la nube; independencia del sistema operativo del servidor | El sistema se desplegará en servicios en la nube sin depender del sistema operativo del servidor ni requerir cambios significativos en el código fuente. | Media |
| **RNF05** | Rendimiento | Tiempo de respuesta rápido; manejo eficiente de múltiples solicitudes | El sistema responderá en un máximo de 3 segundos bajo condiciones normales y soportará múltiples usuarios simultáneos sin degradación significativa. | Alta |
| **RNF06** | Usabilidad | Interfaz intuitiva y clara; mensajes de error comprensibles; navegación sencilla | La interfaz tendrá un diseño claro, botones identificables y mensajes de error comprensibles para usuarios con poco conocimiento de informática. | Alta |
| **RNF07** | Integridad de datos | Consistencia en la base de datos; restricción de eliminación de datos relacionados; validación de datos obligatorios y únicos | El sistema garantizará la integridad referencial, evitando eliminar registros relacionados con datos activos (pedidos, inventario) y validando los campos obligatorios y únicos. | Alta |

# 5 RESTRINCIONES Y SUPUESTOS


### 5.1 Restricciones

**Restricciones de tiempo y alcance**

| ID | Restricción |
|----|-------------|
| **R01** | El proyecto tiene una duración máxima de **8 semanas**, desde el inicio del desarrollo hasta la entrega final. |
| **R02** | Si el tiempo no alcanza, se priorizan los requerimientos de prioridad **Alta** y **Media**. Los de prioridad **Baja** (por ejemplo, RF15 Gestión de promociones) pasan a una fase posterior. |
| **R03** | El alcance se limita a lo definido en la sección 1.2. No se integrará con sistemas bancarios, nómina ni contabilidad avanzada. |

**Restricciones tecnológicas**

| ID | Restricción |
|----|-------------|
| **R04** | El frontend se desarrollará con React (JSX) y Vite, con diseño responsivo. |
| **R05** | El backend se desarrollará en Node.js con JavaScript. |
| **R06** | La base de datos será Supabase (PostgreSQL), de tipo relacional. |
| **R07** | La autenticación se gestionará mediante Auth0. |
| **R08** | Todas las comunicaciones deben usar HTTPS. |
| **R09** | El sistema debe funcionar en navegadores modernos (Chrome, Firefox y Edge actualizados). |

**Restricciones legales y de datos**

| ID | Restricción |
|----|-------------|
| **R10** | El sistema debe cumplir la **Ley 1581 de 2012** (protección de datos personales en Colombia). |
| **R11** | Antes de registrar datos personales (nombre, correo, documento, teléfono), el sistema debe solicitar la **autorización previa y expresa** del titular e informar la finalidad del tratamiento. |
| **R12** | El sistema debe contar con una **política de tratamiento de datos personales** visible para los usuarios. |
| **R13** | Los usuarios podrán conocer, actualizar y rectificar sus datos, y solicitar su supresión, conforme a la ley. |
| **R14** | Los datos personales solo se usarán para los fines autorizados y estarán protegidos con control de acceso por roles. |
| **R15** | No se permite eliminar usuarios ni registros con datos relacionados (pedidos, inventario); solo se inhabilitan, para conservar la integridad de los datos. |

### 5.2 Supuestos

| ID | Supuesto |
|----|----------|
| **S01** | Los requerimientos definidos en este documento son estables durante las 8 semanas; los cambios importantes pueden afectar el cronograma. |
| **S02** | El equipo de desarrollo estará disponible durante todo el proyecto. |
| **S03** | El cliente (Buitrón Coffee) proporcionará a tiempo la información de productos, imágenes, precios y categorías para el catálogo. |
| **S04** | El cliente validará y aprobará los entregables en los plazos acordados. |
| **S05** | Los usuarios tendrán conexión estable a Internet y navegadores actualizados. |
| **S06** | Supabase y Auth0 estarán disponibles y dentro de los límites de su plan contratado. |
| **S07** | El cliente definirá cómo se realizará el pago de los pedidos, al no haber integración bancaria. |
| **S08** | El rol de Proveedor y sus funciones serán definidos con el cliente. |
| **S09** | El cliente proporcionará el texto de la política de tratamiento de datos y el aviso de autorización. |

### 5.3 Dependencias

- Supabase (base de datos)
- Auth0 (autenticación)
- Plataforma de despliegue (por definir)
- Si alguno de estos servicios cambia, falla o deja de estar disponible, el desarrollo o funcionamiento del sistema podría verse afectado.


# 6 MATRIZ DE TRAZABILIDAD

| Requerimiento | Módulo | Prioridad | RNF asociados |
|---------------|--------|-----------|---------------|
| **RF01** Registro de usuarios | Autenticación y Seguridad | Alta | RNF01, RNF07 |
| **RF02** Inicio de sesión | Autenticación y Seguridad | Alta | RNF01, RNF03, RNF05 |
| **RF03** Cierre de sesión | Autenticación y Seguridad | Alta | RNF01, RNF03 |
| **RF04** Gestión de usuarios | Gestión de Usuarios | Alta | RNF01, RNF03, RNF07 |
| **RF05** Gestión de productos | Productos y Catálogo | Alta | RNF01, RNF03, RNF07 |
| **RF06** Visualización de catálogo | Productos y Catálogo | Alta | RNF02, RNF06 |
| **RF07** Gestión de pedidos | Pedidos | Alta | RNF01, RNF05 |
| **RF08** Historial de pedidos | Pedidos | Media | RNF03 |
| **RF09** Gestión de inventario | Inventario | Alta | RNF01, RNF05, RNF07 |
| **RF10** Aprobación de reseñas | Reseñas y Calificaciones | Media | RNF01, RNF03 |
| **RF11** Panel de administrador | Administración | Alta | RNF01, RNF06 |
| **RF12** Gestión de PQRS | PQRS | Media | RNF01, RNF03 |
| **RF13** Sistema de reseñas | Reseñas y Calificaciones | Media | RNF01, RNF03 |
| **RF14** Recuperación de contraseña | Autenticación y Seguridad | Media | RNF01, RNF05 |
| **RF15** Gestión de promociones | Productos y Catálogo | Baja | RNF01, RNF05 |


# 7 APROBACIONES 


| Rol | Nombre | Cargo | Firma | Fecha |
|-----|--------|-------|-------|-------|
| Cliente | | Buitrón Coffee | | |
| Líder del proyecto | Saray |Backend y estar pendiente de que todo se haga  | | |
| Analista de requerimientos | Alexander | Revisar lo que falta y lo que toca corregir | | |
| Desarrollador | Sharon |Hacer fronted y backend y pruebas| | |
