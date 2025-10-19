/* ==================== ATHR PLATFORM - BASE SCRIPT ==================== */
/* 
 * الوظائف الأساسية:
 * - Libraries Initialization
 * - Utility Functions
 * - Base Setup
 */

// ==================== CONSOLE GREETING ====================
console.log('%c🎓 منصة أثر التعليمية', 'color: #16a34a; font-size: 24px; font-weight: bold;');
console.log('%cAthr Educational Platform', 'color: #4d7c0f; font-size: 16px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #22c55e;');

// ==================== LIBRARIES INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing platform...');
  
  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 50,
      disable: function() {
        return window.innerWidth < 768;
      }
    });
    console.log('✅ AOS initialized');
  } else {
    console.warn('⚠️ AOS not loaded');
  }
  
  // Configure Moment.js
  if (typeof moment !== 'undefined') {
    moment.locale('ar');
    console.log('✅ Moment.js configured (Arabic)');
  } else {
    console.warn('⚠️ Moment.js not loaded');
  }
  
  // Configure Chart.js defaults
  if (typeof Chart !== 'undefined') {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
    Chart.defaults.font.family = "'IBM Plex Sans Arabic', 'Cairo', sans-serif";
    console.log('✅ Chart.js configured');
  } else {
    console.warn('⚠️ Chart.js not loaded');
  }
  
  // Force MathJax to render
  function waitForMathJax() {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      console.log('🔢 Rendering math expressions...');
      MathJax.typesetPromise().then(() => {
        console.log('✅ Math expressions rendered');
      }).catch((err) => {
        console.error('❌ MathJax error:', err);
      });
    } else {
      setTimeout(waitForMathJax, 100);
    }
  }
  
  setTimeout(waitForMathJax, 500);
  
  console.log('✅ Platform ready!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ==================== UTILITY FUNCTIONS ====================

// Format Currency
window.formatCurrency = function(amount, currency = 'EGP') {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format Number
window.formatNumber = function(number, decimals = 2) {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

// Format Percentage
window.formatPercentage = function(value, decimals = 2) {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

// Debounce Function
window.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle Function
window.throttle = function(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Smooth Scroll to Element
window.smoothScrollTo = function(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
};

// Copy to Clipboard
window.copyToClipboard = function(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✅ تم النسخ');
    }).catch(() => {
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }
};

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('✅ تم النسخ');
  } catch (err) {
    showToast('❌ فشل النسخ');
  }
  document.body.removeChild(textArea);
}

// Generate Random ID
window.generateId = function(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Check if Element in Viewport
window.isInViewport = function(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Storage Helpers
window.storage = {
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
  get: function(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage error:', e);
      return defaultValue;
    }
  },
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
  clear: function() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }
};

// ==================== PERFORMANCE MONITORING ====================
if (window.performance && window.performance.timing) {
  window.addEventListener('load', function() {
    setTimeout(function() {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      
      console.log('%c⚡ Performance Metrics', 'color: #f59e0b; font-weight: bold;');
      console.log(`📊 Page Load: ${(pageLoadTime / 1000).toFixed(2)}s`);
      console.log(`🔗 Connect: ${(connectTime / 1000).toFixed(2)}s`);
      console.log(`🎨 Render: ${(renderTime / 1000).toFixed(2)}s`);
    }, 0);
  });
}

// ==================== ERROR HANDLING ====================
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
});

// ==================== VISIBILITY CHANGE ====================
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    console.log('👋 Page hidden');
  } else {
    console.log('👀 Page visible');
  }
});

console.log('✅ Base script loaded');
