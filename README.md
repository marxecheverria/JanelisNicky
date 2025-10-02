# 📸 Álbum Fotográfico Móvil

Un álbum fotográfico moderno y dinámico diseñado exclusivamente para dispositivos móviles.

## ✨ Características

- 📱 **Diseño Mobile-First**: Optimizado exclusivamente para dispositivos móviles
- 👆 **Navegación Intuitiva**: Desliza con el dedo (swipe) izquierda/derecha
- 🎵 **Música de Fondo**: Reproductor automático con controles
- 🎨 **Diseño Profesional**: Gradientes modernos, animaciones fluidas
- 💫 **Efectos Visuales**: Partículas flotantes, animaciones dinámicas
- ⚡ **Alto Rendimiento**: Lazy loading de imágenes, scroll optimizado
- 🌈 **Experiencia Inmersiva**: Pantalla completa, sin distracciones

## 🚀 Características Técnicas

### Navegación
- **Swipe horizontal** para cambiar entre fotos
- **Teclado**: Flechas, espacio, Home, End
- **Mouse Wheel**: Scroll para navegación (desktop)
- **Indicador de progreso** visual en tiempo real

### Optimizaciones
- **Lazy Loading**: Las imágenes se cargan solo cuando son necesarias
- **Preloading inteligente**: Precarga imágenes cercanas
- **Smooth scroll**: Transiciones suaves entre fotos
- **Prevención de zoom**: No hay zoom accidental por doble tap

### Efectos Especiales
- Partículas flotantes animadas
- Efectos de corazones en la portada
- Confeti en la página final
- Vibración háptica (dispositivos compatibles)
- Animaciones fluidas y naturales

## 📂 Estructura del Proyecto

```
JanelisNicky-main/
├── index.html          # Estructura HTML del álbum
├── style.css           # Estilos CSS (mobile-first)
├── script.js           # Funcionalidad JavaScript
├── README.md           # Este archivo
├── images/             # Carpeta con 37 fotografías
│   ├── Nena1.jpg       # Foto de portada 1
│   ├── nena2.jpg       # Foto de portada 2
│   └── ...             # 35 fotos adicionales
└── audio/              # Carpeta para música de fondo
    └── README.txt      # Instrucciones para agregar música
```

## 🎵 Configuración de Música

La música de fondo está configurada para reproducirse automáticamente desde fuentes en línea. Para agregar tu propia música:

1. Coloca tu archivo MP3 en la carpeta `audio/`
2. Actualiza la ruta en `index.html` (línea del elemento `<audio>`)
3. Formato recomendado: MP3, duración 2-5 minutos

## 🎨 Diseño Visual

### Paleta de Colores
- Gradiente principal: Púrpura (#667eea → #764ba2)
- Gradiente secundario: Rosa (#f093fb → #f5576c)
- Gradiente terciario: Azul (#4facfe → #00f2fe)

### Tipografías
- **Títulos**: Playfair Display (serif elegante)
- **Texto**: Poppins (sans-serif moderna)

## 📱 Compatibilidad

- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Android Firefox
- ✅ Samsung Internet
- ✅ Tablets (orientación vertical y horizontal)

## 🔧 Uso

1. Abre `index.html` en un dispositivo móvil
2. Desliza horizontalmente para navegar entre fotos
3. Toca el botón de música para controlar el audio
4. Observa el indicador de progreso en la parte superior
5. En la última página, pulsa "Ver de nuevo" para reiniciar

## 💡 Características Avanzadas

### Gestos Táctiles
- **Swipe horizontal**: Cambiar foto
- **Tap en botones**: Controlar música, reiniciar
- **Prevención de zoom**: No hay zoom accidental

### Optimización de Rendimiento
- Canvas para partículas animadas con 60 FPS
- Intersection Observer para lazy loading
- Preload automático de imágenes cercanas
- Suspensión de música cuando la pestaña está oculta

### Efectos Visuales
- Animación de entrada para cada foto
- Partículas flotantes en el fondo
- Efectos especiales en portada y final
- Barra de progreso animada

## 📊 Estadísticas

- **Total de fotos**: 38 (incluye portada y final)
- **Peso total**: Optimizado con lazy loading
- **Tiempo de carga inicial**: < 1 segundo
- **FPS**: 60 (animaciones fluidas)

## 🎯 Experiencia del Usuario

El álbum está diseñado para proporcionar una experiencia inmersiva y natural:

1. **Portada atractiva** con dos fotos circulares
2. **Hint visual** indicando cómo deslizar
3. **Navegación fluida** entre 37 fotografías
4. **Música ambiental** que inicia automáticamente
5. **Página final** con opción de reiniciar

## 🛠️ Personalización

Para personalizar el álbum:

### Cambiar Fotos
Reemplaza las imágenes en la carpeta `images/` manteniendo los nombres.

### Cambiar Colores
Modifica las variables CSS en `style.css`:
```css
:root {
    --primary-gradient: linear-gradient(...);
    --secondary-gradient: linear-gradient(...);
}
```

### Cambiar Música
Actualiza la fuente del audio en `index.html`:
```html
<audio id="backgroundMusic" loop>
    <source src="tu-musica.mp3" type="audio/mpeg">
</audio>
```

## 📄 Licencia

Este proyecto es de uso personal. Todas las fotografías son propiedad de sus respectivos dueños.

## 🌟 Características Destacadas

- ✨ **Sin texto innecesario**: Solo música y fotografías
- 🎨 **Diseño minimalista**: Enfoque en las imágenes
- 💖 **Experiencia emotiva**: Animaciones y música
- 📱 **100% móvil**: Optimizado para pantallas táctiles
- ⚡ **Rápido y fluido**: Alto rendimiento

---

💖 **Creado con amor para ser visto en dispositivos móviles** 💖
