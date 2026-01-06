# HEAVEN - Sistema de Gestión de Café en Cápsulas ☕

![HEAVEN Logo](https://img.shields.io/badge/HEAVEN-Café_Premium-764ba2?style=for-the-badge)

## 📋 Descripción

HEAVEN es un sistema completo de gestión empresarial diseñado específicamente para negocios de café en cápsulas. Incluye autenticación segura con Google Firebase, gestión de clientes, control de inventario, calculadora de costos, análisis de ventas, punto de venta (POS) y sistema completo de gestión de órdenes.

## ✨ Características Principales

### 🔐 Autenticación
- **Login con Google**: Autenticación segura mediante Firebase Auth
- **Protección de datos**: Toda la información está protegida y asociada a tu cuenta
- **Multi-usuario**: Cada usuario tiene sus propios datos separados

### 💰 Calculadora de Costos
- Calcula el costo por cápsula basado en:
  - Costo del café (por gramo)
  - Cantidad de café por cápsula
  - Costo de la cápsula
  - Costo de la tapa
- Visualización instantánea de costos por caja (12, 24, 48 unidades)
- Desglose porcentual de costos

### 📊 Análisis de Ventas
- Configuración de precios de venta por tipo de caja
- Cálculo automático de márgenes de ganancia
- Proyecciones mensuales de:
  - Ingresos estimados
  - Costos proyectados
  - Ganancias netas

### 👥 Gestión de Clientes
- Registro completo de clientes con:
  - Nombre completo
  - Teléfono
  - Email
  - Dirección
- Búsqueda rápida de clientes
- Base de datos sincronizada en tiempo real

### 🧾 Punto de Venta (POS)
- Selección rápida de clientes
- Carrito de compra interactivo
- Generación automática de recibos
- Impresión de facturas
- Cálculo automático de totales

### 📦 Gestión de Órdenes
Sistema completo de flujo de trabajo con 6 etapas:

1. **Todas**: Vista general de todas las órdenes
2. **Recibidas**: Órdenes nuevas pendientes de procesar
3. **En Ventas**: Órdenes en proceso de venta
4. **Empacado**: Órdenes listas para empacar
5. **Entrega**: Órdenes en proceso de envío
6. **Completadas**: Órdenes finalizadas

Cada orden incluye:
- Número de orden único
- Cliente asociado
- Producto y cantidad
- Estado actual
- Notas especiales
- Total de la venta

### 📈 Dashboard
- Métricas en tiempo real:
  - Ventas del día
  - Órdenes pendientes
  - Clientes activos
  - Ganancias del mes
- Órdenes recientes
- Gráficos de ventas semanales

### ⚙️ Configuración
- Información de la empresa
- Datos de contacto
- Estadísticas del sistema
- Opciones de gestión de datos

## 🚀 Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (para Firebase)
- Cuenta de Google

### Instrucciones

1. **Abrir la aplicación**:
   ```
   Abre el archivo index.html en tu navegador
   ```

2. **Iniciar sesión**:
   - Haz clic en "Continuar con Google"
   - Selecciona tu cuenta de Google
   - Autoriza el acceso a la aplicación

3. **Configurar costos** (Primera vez):
   - Ve a "Calculadora de Costos"
   - Ingresa los valores de tus materiales:
     - Costo del café por gramo
     - Cantidad de café por cápsula
     - Costo de cada cápsula
     - Costo de cada tapa
   - Haz clic en "Calcular Costos"
   - Los datos se guardarán automáticamente

4. **Configurar precios de venta**:
   - Ve a "Análisis de Ventas"
   - Ingresa tus precios para:
     - Caja x12 cápsulas
     - Caja x24 cápsulas
     - Caja x48 cápsulas
   - Visualiza automáticamente los márgenes de ganancia

5. **Agregar clientes**:
   - Ve a "Clientes"
   - Haz clic en "+ Agregar Cliente"
   - Completa los datos del cliente
   - Guarda

6. **Realizar una venta** (POS):
   - Ve a "Punto de Venta"
   - Selecciona un cliente
   - Agrega productos al carrito
   - Genera el recibo
   - Imprime si es necesario

7. **Gestionar órdenes**:
   - Ve a "Gestión de Órdenes"
   - Haz clic en "+ Nueva Orden"
   - Completa los datos de la orden
   - Avanza la orden por las diferentes etapas según el flujo de trabajo
   - Marca como completada cuando se entregue

## 🎨 Diseño

La aplicación cuenta con un diseño moderno y profesional que incluye:

- **Tema oscuro** elegante y fácil para la vista
- **Gradientes vibrantes** que hacen la interfaz atractiva
- **Animaciones suaves** para mejor experiencia de usuario
- **Diseño responsive** que se adapta a diferentes tamaños de pantalla
- **Iconos intuitivos** para fácil navegación

## 🔒 Seguridad y Privacidad

- **Autenticación segura**: Login con Google mediante Firebase Authentication
- **Base de datos protegida**: Firestore con reglas de seguridad
- **Datos privados**: Cada usuario solo puede ver y editar sus propios datos
- **Conexión encriptada**: Todas las comunicaciones con Firebase están encriptadas

## 📱 Compatibilidad

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Microsoft Edge
- ✅ Opera

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase
  - **Authentication**: Google Sign-In
  - **Database**: Firestore
  - **Analytics**: Firebase Analytics
- **Diseño**: CSS Variables, Flexbox, Grid
- **Fuentes**: Google Fonts (Inter, Playfair Display)

## 📊 Estructura de Datos

### Clientes
```javascript
{
  name: string,
  phone: string,
  email: string,
  address: string,
  userId: string,
  createdAt: timestamp
}
```

### Órdenes
```javascript
{
  orderNumber: string,
  clientId: string,
  clientName: string,
  productName: string,
  productType: string,
  quantity: number,
  price: number,
  total: number,
  notes: string,
  status: string,
  userId: string,
  createdAt: timestamp
}
```

### Configuración de Costos
```javascript
{
  coffeeCost: number,
  coffeeAmount: number,
  capsuleCost: number,
  lidCost: number,
  costPerCapsule: number,
  type: 'costs',
  userId: string,
  updatedAt: timestamp
}
```

### Configuración de Ventas
```javascript
{
  priceBox12: number,
  priceBox24: number,
  priceBox48: number,
  type: 'sales',
  userId: string,
  updatedAt: timestamp
}
```

## 💡 Consejos de Uso

1. **Configura primero tus costos**: Antes de hacer ventas, asegúrate de tener tus costos bien calculados
2. **Mantén actualizada tu lista de clientes**: Agrega todos tus clientes para facilitar las ventas
3. **Usa las proyecciones**: La calculadora de proyecciones te ayuda a planificar tu mes
4. **Revisa el dashboard diariamente**: Para estar al tanto del estado de tu negocio
5. **Avanza las órdenes**: Mantén el flujo de trabajo actualizado para mejor organización

## 🆘 Solución de Problemas

### La página no carga
- Verifica tu conexión a Internet
- Actualiza la página (F5 o Ctrl+R)
- Limpia la caché del navegador

### No puedo iniciar sesión
- Asegúrate de tener una cuenta de Google
- Verifica que hayas aceptado los permisos
- Intenta con otro navegador

### Los datos no se guardan
- Verifica tu conexión a Internet
- Revisa la consola del navegador (F12) para errores
- Asegúrate de estar autenticado

### Los cálculos no aparecen
- Verifica que hayas completado todos los campos
- Asegúrate de hacer clic en el botón "Calcular"
- Los valores deben ser números válidos

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

© 2025 HEAVEN - Sistema de Gestión de Café en Cápsulas. Todos los derechos reservados.

---

**¡Gracias por usar HEAVEN! ☕**

Esperamos que este sistema te ayude a gestionar tu negocio de manera más eficiente y profesional.
