/* ==================== ATHR PLATFORM - BASE SCRIPT V2.0 ==================== */
/* 
 * الوظائف الأساسية:
 * - Libraries Initialization
 * - Utility Functions
 * - Toast System
 * - Modal Helpers
 * - Base Setup
 * 
 * Version: 2.0
 * Last Updated: 2025-11-16
 * Standards: ES6+ / Production Ready
 */


// ==================== CONSOLE GREETING ====================
console.log('%c🎓 منصة أثر التعليمية', 'color: #16a34a; font-size: 24px; font-weight: bold;');
console.log('%cAthr Educational Platform V2.0', 'color: #4d7c0f; font-size: 16px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #22c55e;');


// ==================== LIBRARIES INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing platform...');
  
  // ✅ FIXED: Initialize AOS (enable on all devices)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 50,
      disable: false, // ← FIXED: Work on mobile
      anchorPlacement: 'top-bottom'
    });
    console.log('✅ AOS initialized (all devices)');
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


// ==================== ✅ NEW: TOAST NOTIFICATION SYSTEM ====================

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type: success, error, warning, info
 * @param {number} duration - Duration in ms (default: 4000)
 */
window.showToast = function(message, type = 'info', duration = 4000) {
  // Get or create container
  let container = document.getElementById('toastContainer');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'الإشعارات');
    document.body.appendChild(container);
  }
  
  // Icon mapping
  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-exclamation-circle"></i>',
    warning: '<i class="fas fa-exclamation-triangle"></i>',
    info: '<i class="fas fa-info-circle"></i>'
  };
  
  // Title mapping
  const titles = {
    success: 'نجح',
    error: 'خطأ',
    warning: 'تنبيه',
    info: 'معلومة'
  };
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${titles[type] || titles.info}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button 
      class="toast-close" 
      aria-label="إغلاق الإشعار">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Close button listener
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => toast.remove());
  
  // Add to container
  container.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(450px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
  
  return toast;
};


// ==================== ✅ NEW: MODAL HELPERS ====================

/**
 * Show modal by ID
 * @param {string} modalId - The modal element ID
 */
window.showModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input, textarea, select');
      if (firstInput) firstInput.focus();
    }, 100);
  }
};

/**
 * Hide modal by ID
 * @param {string} modalId - The modal element ID
 */
window.hideModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
};

/**
 * Toggle modal visibility
 * @param {string} modalId - The modal element ID
 */
window.toggleModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const isActive = modal.classList.contains('active');
    if (isActive) {
      hideModal(modalId);
    } else {
      showModal(modalId);
    }
  }
};


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

// ✅ NEW: Format Date (Arabic friendly)
window.formatDate = function(date, format = 'short') {
  const isArabic = document.documentElement.getAttribute('lang') === 'ar';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const formats = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
    full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  };
  
  return new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-US', formats[format] || formats.short).format(dateObj);
};

// ✅ NEW: Format Time Ago (Arabic)
window.formatTimeAgo = function(date) {
  const now = new Date();
  const past = date instanceof Date ? date : new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHour < 24) return `منذ ${diffHour} ساعة`;
  if (diffDay < 7) return `منذ ${diffDay} يوم`;
  
  return formatDate(past, 'short');
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
      showToast('✅ تم النسخ', 'success');
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
    showToast('✅ تم النسخ', 'success');
  } catch (err) {
    showToast('❌ فشل النسخ', 'error');
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

// ✅ NEW: Wait for Element
window.waitForElement = function(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found`));
    }, timeout);
  });
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
      
      // Warn if slow
      if (pageLoadTime > 3000) {
        console.warn('⚠️ Page load time exceeds 3s');
      }
    }, 0);
  });
}


// ==================== ERROR HANDLING ====================
window.addEventListener('error', function(e) {
  console.error('❌ Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('❌ Unhandled promise rejection:', e.reason);
});


// ==================== VISIBILITY CHANGE ====================
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    console.log('👋 Page hidden');
  } else {
    console.log('👀 Page visible');
  }
});


// ==================== ✅ NEW: KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', function(e) {
  // ESC to close modals
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.modal-overlay.active, .profile-modal.active');
    if (activeModal) {
      activeModal.classList.remove('active');
    }
  }
});


console.log('✅ Base script V2.0 loaded');
