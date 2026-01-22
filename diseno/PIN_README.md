# Sistema de Autenticación PIN - Panel de Diseño

## 📋 Descripción

Se ha implementado un sistema de autenticación mediante PIN para proteger el acceso a la página `/diseno`.

## 🔐 Información del PIN

**PIN de Acceso:** `1619`

## ✨ Características Implementadas

### 1. **Modal de Verificación**
- Modal premium con diseño oscuro y acentos dorados
- Ícono de candado para indicar acceso restringido
- Campo de entrada de contraseña con máximo 4 dígitos
- Animación de error con efecto shake cuando el PIN es incorrecto

### 2. **Validación de PIN**
- Verificación inmediata al hacer clic en "Desbloquear"
- También se puede verificar presionando Enter
- Mensaje de error temporal (2 segundos) si el PIN es incorrecto
- Borrado automático del campo al ingresar PIN incorrecto

### 3. **Experiencia de Usuario**
- El contenido de la página está bloqueado visualmente (blur) hasta ingresar el PIN correcto
- Auto-enfoque en el campo de entrada al cargar la página
- Transición suave al desbloquear (fade out del modal)
- El PIN verificado se guarda en sessionStorage para mantener el acceso durante la sesión

### 4. **Seguridad**
- El contenido está protegido con `pointer-events: none` hasta el desbloqueo
- El PIN se verifica localmente y se almacena en sessionStorage
- Al cerrar la pestaña/navegador, se requiere volver a ingresar el PIN

## 🎨 Diseño Visual

El modal incluye:
- Fondo oscuro con gradiente (135deg, #1a1a1a → #2d2d2d)
- Borde dorado brillante con sombra
- Input con estilo premium y efecto de brillo al enfocarse
- Botón dorado con efecto hover
- Animación shake en caso de error

## 🚀 Uso

1. Al acceder a `/diseno/index.html`, aparecerá automáticamente el modal de PIN
2. Ingresa el PIN: **1619**
3. Haz clic en "Desbloquear" o presiona Enter
4. El modal desaparecerá suavemente y podrás acceder al panel de diseño
5. El acceso permanecerá activo durante toda la sesión del navegador

## 🔄 Flujo de Autenticación

```
Usuario accede a /diseno
    ↓
¿PIN verificado en sessionStorage?
    ↓ NO
Mostrar Modal de PIN
    ↓
Usuario ingresa PIN
    ↓
¿PIN == 1619?
    ↓ SÍ
Guardar verificación en sessionStorage
    ↓
Desbloquear página con animación
    ↓
Panel de Diseño Accesible
```

## 📝 Notas Técnicas

- **Almacenamiento:** sessionStorage (se limpia al cerrar la pestaña)
- **Validación:** Comparación directa de strings
- **Longitud PIN:** Máximo 4 caracteres
- **Tipo de input:** password (oculta los caracteres)
- **Transiciones:** CSS transitions de 0.3s

## 🔧 Archivos Modificados

- `e:\HEAVEN\diseno\index.html` - Se agregó:
  - Estilos CSS para el modal y efectos
  - HTML del modal de verificación
  - Script de validación de PIN
  - Lógica de desbloqueo con sessionStorage
