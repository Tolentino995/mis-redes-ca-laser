/* ============================================
   C&A LASER STUDIO - JAVASCRIPT
   Funcionalidades y optimizaciones
   ============================================ */

// === CONFIGURACIÓN ===
const CONFIG = {
  instagram: {
    username: 'c.a.laser_estudio',
    appTimeout: 1000, // Tiempo de espera antes de abrir en navegador
  },
  analytics: {
    enabled: false, // Cambiar a true si usas Google Analytics
  }
};

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  // Agregar clase para indicar que JS está cargado
  document.body.classList.add('js-loaded');
  
  // Inicializar funcionalidades
  initLazyLoading();
  initAnimationObserver();
  trackExternalLinks();
  
  // Log de inicio (solo en desarrollo)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✨ C&A Laser Studio - Website iniciado correctamente');
  }
}

// === MANEJO DE INSTAGRAM (Compatible con Samsung y todos los dispositivos) ===
function openInstagram(event) {
  event.preventDefault();
  
  const username = CONFIG.instagram.username;
  const deepLink = `instagram://user?username=${username}`;
  const webUrl = `https://www.instagram.com/${username}/`;
  
  // Detectar si es un dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSamsung = /SamsungBrowser/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Intentar abrir la app de Instagram
    window.location.href = deepLink;
    
    // Fallback: Si no se abre la app en X segundos, abrir en navegador
    const timeout = setTimeout(function() {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }, CONFIG.instagram.appTimeout);
    
    // Limpiar timeout si la app se abre correctamente
    window.addEventListener('blur', function() {
      clearTimeout(timeout);
    }, { once: true });
    
    // Para Samsung específicamente
    if (isSamsung) {
      setTimeout(function() {
        if (document.hidden || document.webkitHidden) {
          clearTimeout(timeout);
        }
      }, 500);
    }
  } else {
    // En desktop, abrir directamente en navegador
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }
  
  // Tracking (si está habilitado)
  trackEvent('Social Link Click', 'Instagram');
}

// === LAZY LOADING PARA IMÁGENES ===
function initLazyLoading() {
  // Verificar si el navegador soporta IntersectionObserver
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
  }
}

// === ANIMACIONES AL HACER SCROLL ===
function initAnimationObserver() {
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1
    });
    
    const animatedElements = document.querySelectorAll('.btn, .profile, .header');
    animatedElements.forEach(el => animationObserver.observe(el));
  }
}

// === TRACKING DE CLICS EN ENLACES EXTERNOS ===
function trackExternalLinks() {
  const links = document.querySelectorAll('a[target="_blank"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const platform = this.classList.contains('instagram') ? 'Instagram' :
                      this.classList.contains('whatsapp') ? 'WhatsApp' :
                      this.classList.contains('facebook') ? 'Facebook' :
                      this.classList.contains('tiktok') ? 'TikTok' :
                      this.classList.contains('pinterest') ? 'Pinterest' : 'Unknown';
      
      trackEvent('Social Link Click', platform);
    });
  });
}

// === FUNCIÓN DE TRACKING GENÉRICA ===
function trackEvent(category, action, label = '') {
  // Google Analytics
  if (CONFIG.analytics.enabled && typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
  
  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', action);
  }
  
  // Console log para desarrollo
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`📊 Track: ${category} - ${action}`, label);
  }
}

// === DETECCIÓN DE VIEWPORT ===
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// === COPIAR TEXTO AL PORTAPAPELES ===
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback para navegadores antiguos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve();
    } catch (error) {
      textArea.remove();
      return Promise.reject(error);
    }
  }
}

// === SMOOTH SCROLL (para futuras secciones) ===
function smoothScrollTo(target, duration = 500) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;
  
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;
  
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  requestAnimationFrame(animation);
}

// === DETECCIÓN DE CONEXIÓN LENTA ===
if ('connection' in navigator) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection && connection.effectiveType) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      document.body.classList.add('slow-connection');
      console.warn('⚠️ Conexión lenta detectada. Optimizando experiencia...');
    }
  }
}

// === PREVENCIÓN DE SPAM EN CLICS ===
let clickTimeout;
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    if (this.classList.contains('loading')) {
      e.preventDefault();
      return;
    }
    
    this.classList.add('loading');
    
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      this.classList.remove('loading');
    }, 2000);
  });
});

// === MANEJO DE ERRORES ===
window.addEventListener('error', function(e) {
  console.error('❌ Error:', e.error);
  // Aquí podrías enviar el error a un servicio de logging
});

// === OPTIMIZACIÓN DE PERFORMANCE ===
// Deshabilitar animaciones si el usuario lo prefiere
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('reduced-motion');
}

// === SERVICE WORKER (opcional, para PWA) ===
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  // Descomentar si decides implementar un service worker
  // navigator.serviceWorker.register('/sw.js')
  //   .then(reg => console.log('Service Worker registrado', reg))
  //   .catch(err => console.log('Error al registrar Service Worker', err));
}

// === EXPORTAR FUNCIONES PARA USO GLOBAL ===
window.CALaserStudio = {
  openInstagram,
  copyToClipboard,
  smoothScrollTo,
  trackEvent
};

// === DEBUG MODE (solo en desarrollo) ===
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.DEBUG = true;
  console.log('%c🚀 C&A Laser Studio', 'font-size: 20px; font-weight: bold; color: #2196F3;');
  console.log('%cModo desarrollo activado', 'color: #4CAF50;');
  console.log('Funciones disponibles en window.CALaserStudio:', window.CALaserStudio);
}
