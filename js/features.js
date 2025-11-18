// ======================================================
// ATHR FEATURES JS V2.0 - PROFESSIONAL UTILITY LIBRARY
// Expert-Level Enhancements (60 Years Experience 🎯)
// Zero Duplication, Maximum Value
// ======================================================

/**
 * 🎯 PHILOSOPHY:
 * - No duplication with library.js
 * - Only reusable utilities
 * - Performance-first
 * - Production-ready
 */

// ==========================================
// 1. ADVANCED DEBOUNCE (Better than standard)
// ==========================================
export function debounce(func, wait, options = {}) {
  let timeout;
  let lastCallTime = 0;
  const { leading = false, trailing = true, maxWait } = options;

  return function executedFunction(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    const later = () => {
      timeout = null;
      if (trailing) func.apply(this, args);
    };

    const shouldCallLeading = leading && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    // MaxWait: Force execution if too much time passed
    if (maxWait && timeSinceLastCall >= maxWait) {
      func.apply(this, args);
      lastCallTime = now;
    } else if (shouldCallLeading) {
      func.apply(this, args);
      lastCallTime = now;
    }
  };
}

// ==========================================
// 2. THROTTLE (Performance-critical operations)
// ==========================================
export function throttle(func, limit) {
  let inThrottle;
  let lastResult;

  return function(...args) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
    return lastResult;
  };
}

// ==========================================
// 3. SMOOTH SCROLL TO ELEMENT (Better than CSS)
// ==========================================
export function smoothScrollTo(element, options = {}) {
  const {
    duration = 800,
    offset = 0,
    easing = 'easeInOutCubic'
  } = options;

  const target = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;

  if (!target) return Promise.reject('Element not found');

  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset + offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  // Easing functions
  const easings = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInOutCubic: t => t < 0.5 
      ? 4 * t * t * t 
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };

  return new Promise(resolve => {
    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easings[easing](progress);

      window.scrollTo(0, startPosition + (distance * ease));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animation);
  });
}

// ==========================================
// 4. INTERSECTION OBSERVER WRAPPER (Lazy Load, Reveal Animations)
// ==========================================
export function observeElements(selector, callback, options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  const elements = document.querySelectorAll(selector);
  if (!elements.length) return null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target, entry);
        if (triggerOnce) observer.unobserve(entry.target);
      }
    });
  }, { threshold, rootMargin });

  elements.forEach(el => observer.observe(el));

  return observer; // Return for manual cleanup
}

// ==========================================
// 5. COPY TO CLIPBOARD (Modern API + Fallback)
// ==========================================
export async function copyToClipboard(text) {
  try {
    // Modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

// ==========================================
// 6. LOCAL STORAGE WITH EXPIRY (Smart Caching)
// ==========================================
export const storage = {
  set(key, value, expiryMinutes = null) {
    const item = {
      value,
      timestamp: Date.now(),
      expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : null
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (err) {
      console.error('Storage set failed:', err);
      return false;
    }
  },

  get(key) {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);

      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (err) {
      console.error('Storage get failed:', err);
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      return false;
    }
  }
};

// ==========================================
// 7. FORM VALIDATION HELPER (Enterprise-Grade)
// ==========================================
export function validateForm(formElement, rules) {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(fieldName => {
    const field = formElement.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const fieldRules = rules[fieldName];
    const value = field.value.trim();

    // Required
    if (fieldRules.required && !value) {
      errors[fieldName] = fieldRules.messages?.required || 'هذا الحقل مطلوب';
      isValid = false;
      return;
    }

    // Min length
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[fieldName] = fieldRules.messages?.minLength || 
        `الحد الأدنى ${fieldRules.minLength} أحرف`;
      isValid = false;
      return;
    }

    // Max length
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[fieldName] = fieldRules.messages?.maxLength || 
        `الحد الأقصى ${fieldRules.maxLength} أحرف`;
      isValid = false;
      return;
    }

    // Pattern (regex)
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[fieldName] = fieldRules.messages?.pattern || 'صيغة غير صحيحة';
      isValid = false;
      return;
    }

    // Custom validator
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, formElement);
      if (customError) {
        errors[fieldName] = customError;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
}

// ==========================================
// 8. KEYBOARD NAVIGATION MANAGER
// ==========================================
export function setupKeyboardNav(containerSelector, itemSelector, options = {}) {
  const {
    loop = true,
    enterCallback = null,
    escapeCallback = null
  } = options;

  const container = document.querySelector(containerSelector);
  if (!container) return null;

  let currentIndex = -1;

  function getItems() {
    return Array.from(container.querySelectorAll(itemSelector))
      .filter(el => !el.hasAttribute('disabled'));
  }

  function focusItem(index) {
    const items = getItems();
    if (!items.length) return;

    currentIndex = loop 
      ? (index + items.length) % items.length 
      : Math.max(0, Math.min(index, items.length - 1));

    items[currentIndex]?.focus();
  }

  container.addEventListener('keydown', (e) => {
    const items = getItems();
    if (!items.length) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        focusItem(currentIndex + 1);
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        focusItem(currentIndex - 1);
        break;

      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;

      case 'End':
        e.preventDefault();
        focusItem(items.length - 1);
        break;

      case 'Enter':
        if (enterCallback) {
          e.preventDefault();
          enterCallback(items[currentIndex], currentIndex);
        }
        break;

      case 'Escape':
        if (escapeCallback) {
          e.preventDefault();
          escapeCallback();
        }
        break;
    }
  });

  // Track focus changes
  container.addEventListener('focusin', (e) => {
    const items = getItems();
    currentIndex = items.indexOf(e.target);
  });

  return {
    focusFirst: () => focusItem(0),
    focusLast: () => focusItem(getItems().length - 1),
    destroy: () => {
      container.removeEventListener('keydown', () => {});
      container.removeEventListener('focusin', () => {});
    }
  };
}

// ==========================================
// 9. HAPTIC FEEDBACK (Mobile)
// ==========================================
export function haptic(type = 'light') {
  if (!navigator.vibrate) return false;

  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    error: [50, 100, 50],
    warning: [30, 60, 30]
  };

  try {
    navigator.vibrate(patterns[type] || patterns.light);
    return true;
  } catch (err) {
    return false;
  }
}

// ==========================================
// 10. NETWORK STATUS MONITOR
// ==========================================
export function monitorNetwork(callbacks = {}) {
  const { onOnline, onOffline, onSlow } = callbacks;

  function updateStatus() {
    if (navigator.onLine) {
      onOnline?.();
    } else {
      onOffline?.();
    }
  }

  window.addEventListener('online', () => onOnline?.());
  window.addEventListener('offline', () => onOffline?.());

  // Detect slow connection
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          onSlow?.(connection.effectiveType);
        }
      });
    }
  }

  return () => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
  };
}

// ==========================================
// 11. ANIMATION FRAME THROTTLE (60fps Performance)
// ==========================================
export function rafThrottle(callback) {
  let rafId = null;
  let lastArgs = null;

  function execute() {
    callback.apply(this, lastArgs);
    rafId = null;
  }

  return function throttled(...args) {
    lastArgs = args;
    if (rafId === null) {
      rafId = requestAnimationFrame(execute);
    }
  };
}

// ==========================================
// 12. CSS VARIABLE MANAGER (Dark Mode, Themes)
// ==========================================
export const cssVars = {
  set(variable, value, element = document.documentElement) {
    element.style.setProperty(`--${variable}`, value);
  },

  get(variable, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(`--${variable}`).trim();
  },

  remove(variable, element = document.documentElement) {
    element.style.removeProperty(`--${variable}`);
  },

  setMultiple(vars, element = document.documentElement) {
    Object.entries(vars).forEach(([key, value]) => {
      this.set(key, value, element);
    });
  }
};

// ==========================================
// 13. FOCUS TRAP (Modals, Dialogs)
// ==========================================
export function createFocusTrap(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return null;

  const focusableElements = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  
  function getFocusableElements() {
    return Array.from(container.querySelectorAll(focusableElements));
  }

  function handleTabKey(e) {
    const focusable = getFocusableElements();
    if (!focusable.length) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  function activate() {
    const focusable = getFocusableElements();
    if (focusable.length) focusable[0].focus();

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') handleTabKey(e);
    });
  }

  function deactivate() {
    container.removeEventListener('keydown', handleTabKey);
  }

  return { activate, deactivate };
}

// ==========================================
// INITIALIZATION (Auto-setup common features)
// ==========================================
export function initFeatures() {
  // Lazy load images with data-src
  observeElements('[data-src]', (el) => {
    if (el.dataset.src) {
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    }
  });

  // Animate elements with .animate-on-scroll
  observeElements('.animate-on-scroll', (el) => {
    el.classList.add('animated');
  }, { threshold: 0.2 });

  // Setup keyboard navigation for common patterns
  setupKeyboardNav('[role="menu"]', '[role="menuitem"]');
  setupKeyboardNav('[role="tablist"]', '[role="tab"]');

  console.log('✅ Features.js initialized');
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeatures);
} else {
  initFeatures();
}
