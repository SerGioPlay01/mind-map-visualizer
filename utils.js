// Utility functions for JSON/YAML Mind Map Visualizer

const Utils = {
  // String utilities
  string: {
    // Format bytes to human readable format
    formatBytes: (bytes, decimals = 2) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    // Truncate string with ellipsis
    truncate: (str, length = 50, suffix = '...') => {
      if (str.length <= length) return str;
      return str.substring(0, length - suffix.length) + suffix;
    },

    // Capitalize first letter
    capitalize: (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Convert camelCase to Title Case
    camelToTitle: (str) => {
      return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    },

    // Generate random string
    randomString: (length = 8) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  },

  // Date utilities
  date: {
    // Format date to readable string
    format: (date, format = 'YYYY-MM-DD') => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');

      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },

    // Get relative time (e.g., "2 hours ago")
    relative: (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days} дн. назад`;
      if (hours > 0) return `${hours} ч. назад`;
      if (minutes > 0) return `${minutes} мин. назад`;
      return 'только что';
    }
  },

  // Array utilities
  array: {
    // Remove duplicates from array
    unique: (arr) => {
      return [...new Set(arr)];
    },

    // Shuffle array
    shuffle: (arr) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },

    // Group array by key
    groupBy: (arr, key) => {
      return arr.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {});
    },

    // Flatten nested array
    flatten: (arr) => {
      return arr.reduce((flat, item) => {
        return flat.concat(Array.isArray(item) ? Utils.array.flatten(item) : item);
      }, []);
    }
  },

  // Object utilities
  object: {
    // Deep clone object
    clone: (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) return obj.map(item => Utils.object.clone(item));
      if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
          cloned[key] = Utils.object.clone(obj[key]);
        });
        return cloned;
      }
    },

    // Deep merge objects
    merge: (target, ...sources) => {
      if (!sources.length) return target;
      const source = sources.shift();

      if (Utils.object.isObject(target) && Utils.object.isObject(source)) {
        for (const key in source) {
          if (Utils.object.isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            Utils.object.merge(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }

      return Utils.object.merge(target, ...sources);
    },

    // Check if value is object
    isObject: (item) => {
      return item && typeof item === 'object' && !Array.isArray(item);
    },

    // Get nested property value
    get: (obj, path, defaultValue = undefined) => {
      const keys = path.split('.');
      let result = obj;
      for (const key of keys) {
        if (result === null || result === undefined) return defaultValue;
        result = result[key];
      }
      return result;
    },

    // Set nested property value
    set: (obj, path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      let current = obj;
      for (const key of keys) {
        if (!(key in current) || !Utils.object.isObject(current[key])) {
          current[key] = {};
        }
        current = current[key];
      }
      current[lastKey] = value;
    }
  },

  // DOM utilities
  dom: {
    // Create element with attributes and content
    create: (tag, attributes = {}, content = '') => {
      const element = document.createElement(tag);
      Object.keys(attributes).forEach(key => {
        if (key === 'className') {
          element.className = attributes[key];
        } else if (key === 'innerHTML') {
          element.innerHTML = attributes[key];
        } else {
          element.setAttribute(key, attributes[key]);
        }
      });
      if (content) element.textContent = content;
      return element;
    },

    // Add event listener with automatic cleanup
    on: (element, event, handler, options = {}) => {
      element.addEventListener(event, handler, options);
      return () => element.removeEventListener(event, handler, options);
    },

    // Debounce function calls
    debounce: (func, wait, immediate = false) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
      };
    },

    // Throttle function calls
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  },

  // Storage utilities
  storage: {
    // Save to localStorage with error handling
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Storage set error:', error);
        return false;
      }
    },

    // Get from localStorage with error handling
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Storage get error:', error);
        return defaultValue;
      }
    },

    // Remove from localStorage
    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage remove error:', error);
        return false;
      }
    },

    // Clear all localStorage
    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Storage clear error:', error);
        return false;
      }
    }
  },

  // File utilities
  file: {
    // Download file
    download: (content, filename, type = 'text/plain') => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    // Read file as text
    readAsText: (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
      });
    },

    // Get file extension
    getExtension: (filename) => {
      return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    // Check if file type is supported
    isSupported: (filename) => {
      const supported = ['json', 'yaml', 'yml'];
      const extension = Utils.file.getExtension(filename).toLowerCase();
      return supported.includes(extension);
    }
  },

  // Validation utilities
  validation: {
    // Validate JSON string
    isValidJSON: (str) => {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    },

    // Validate email
    isValidEmail: (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    // Validate URL
    isValidURL: (str) => {
      try {
        new URL(str);
        return true;
      } catch (e) {
        return false;
      }
    },

    // Validate required fields
    validateRequired: (obj, fields) => {
      const errors = [];
      fields.forEach(field => {
        if (!obj[field] || obj[field].toString().trim() === '') {
          errors.push(`${field} is required`);
        }
      });
      return errors;
    }
  },

  // Color utilities
  color: {
    // Convert hex to RGB
    hexToRgb: (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // Convert RGB to hex
    rgbToHex: (r, g, b) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Generate random color
    random: () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    // Get contrasting color (black or white)
    getContrast: (hex) => {
      const rgb = Utils.color.hexToRgb(hex);
      if (!rgb) return '#000000';
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#ffffff';
    }
  },

  // Math utilities
  math: {
    // Clamp number between min and max
    clamp: (num, min, max) => {
      return Math.min(Math.max(num, min), max);
    },

    // Linear interpolation
    lerp: (start, end, factor) => {
      return start + (end - start) * factor;
    },

    // Map value from one range to another
    map: (value, inMin, inMax, outMin, outMax) => {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    // Round to specified decimal places
    round: (num, decimals = 2) => {
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
  },

  // Performance utilities
  performance: {
    // Measure function execution time
    measure: (func, label = 'Function') => {
      const start = performance.now();
      const result = func();
      const end = performance.now();
      console.log(`${label} took ${end - start} milliseconds`);
      return result;
    },

    // Create performance observer
    observe: (callback) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(callback);
        observer.observe({ entryTypes: ['measure', 'navigation'] });
        return observer;
      }
      return null;
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} else if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
