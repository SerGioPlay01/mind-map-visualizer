// Configuration file for JSON/YAML Mind Map Visualizer
const CONFIG = {
  // Application settings
  app: {
    name: 'JSON/YAML Mind Map Visualizer',
    version: '2.0.0',
    author: 'SerGio Play Dev',
    website: 'https://sergioplay-dev.netlify.app'
  },

  // Visualization settings
  visualization: {
    // Force simulation parameters
    forces: {
      link: {
        distance: 80,
        strength: 0.8
      },
      charge: {
        strength: -300
      },
      collision: {
        radius: 25
      },
      center: {
        strength: 1
      }
    },
    
    // Node styling
    nodes: {
      baseRadius: 8,
      depthFactor: 6,
      typeFactors: {
        array: 2,
        object: 1.5,
        primitive: 1
      },
      colors: {
        root: 'var(--accent-primary)',
        array: 'var(--accent-info)',
        object: 'var(--accent-success)',
        primitive: 'var(--accent-warning)'
      }
    },
    
    // Link styling
    links: {
      strokeWidth: 1.5,
      opacity: 0.6,
      hoverOpacity: 1,
      hoverStrokeWidth: 2
    },
    
    // Animation settings
    animations: {
      duration: 300,
      enterDuration: 400,
      exitDuration: 300
    }
  },

  // UI settings
  ui: {
    // Sidebar
    sidebar: {
      width: 320,
      minWidth: 280,
      maxWidth: 400
    },
    
    // Toolbar
    toolbar: {
      height: 60,
      buttonSize: 32
    },
    
    // Zoom controls
    zoom: {
      minScale: 0.1,
      maxScale: 8,
      defaultScale: 1,
      zoomFactor: 1.5
    },
    
    // Search
    search: {
      debounceDelay: 300,
      minQueryLength: 1
    }
  },

  // Export settings
  export: {
    // SVG export
    svg: {
      includeStyles: true,
      filename: 'mindmap_{date}.svg'
    },
    
    // PNG export
    png: {
      scaleFactor: 2,
      backgroundColor: 'var(--bg-primary)',
      filename: 'mindmap_{date}.png'
    },
    
    // PDF export
    pdf: {
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      filename: 'mindmap_{date}.pdf'
    },
    
    // JSON export
    json: {
      includeMetadata: true,
      includeOriginalData: true,
      filename: 'mindmap_data_{date}.json'
    }
  },

  // Storage settings
  storage: {
    // LocalStorage keys
    keys: {
      session: 'mindmap_session_v2',
      theme: 'mindmap_theme',
      settings: 'mindmap_settings'
    },
    
    // History settings
    history: {
      maxSize: 50,
      autoSave: true
    }
  },

  // Performance settings
  performance: {
    // Large data handling
    largeData: {
      threshold: 1000, // nodes
      virtualization: true,
      batchSize: 100
    },
    
    // Animation performance
    animations: {
      reduceMotion: 'prefers-reduced-motion: reduce',
      lowEndDevice: false
    }
  },

  // Theme settings
  themes: {
    light: {
      name: 'Светлая тема',
      icon: '☀️',
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4'
      }
    },
    dark: {
      name: 'Темная тема',
      icon: '🌙',
      colors: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#22d3ee'
      }
    }
  },

  // Keyboard shortcuts
  shortcuts: {
    'ctrl+z': 'undo',
    'ctrl+shift+z': 'redo',
    'ctrl+s': 'save',
    'ctrl+o': 'open',
    'ctrl+f': 'search',
    'escape': 'closeContextMenu',
    'ctrl+1': 'zoomIn',
    'ctrl+2': 'zoomOut',
    'ctrl+0': 'resetZoom',
    'ctrl+shift+c': 'center'
  },

  // Demo data
  demo: {
    enabled: true,
    autoLoad: true,
    data: {
      project: "JSON/YAML Mind Map Visualizer",
      version: "2.0.0",
      features: {
        visualization: {
          forceDirected: true,
          dragAndDrop: true,
          collapseExpand: true,
          search: true
        },
        export: {
          svg: true,
          png: true,
          pdf: true,
          json: true
        },
        themes: {
          light: true,
          dark: true
        }
      },
      author: {
        name: "SerGio Play Dev",
        website: "https://sergioplay-dev.netlify.app"
      }
    }
  },

  // Error messages
  messages: {
    errors: {
      invalidJson: 'Неверный формат JSON',
      invalidYaml: 'Неверный формат YAML',
      fileLoadError: 'Ошибка загрузки файла',
      exportError: 'Ошибка при экспорте',
      saveError: 'Ошибка сохранения',
      loadError: 'Ошибка загрузки'
    },
    success: {
      dataProcessed: 'Данные успешно обработаны',
      fileLoaded: 'Файл загружен',
      sessionSaved: 'Сессия сохранена',
      sessionLoaded: 'Сессия загружена',
      exported: 'Файл экспортирован'
    },
    info: {
      welcome: 'Добро пожаловать в JSON/YAML Mind Map Visualizer!',
      themeChanged: 'Тема изменена',
      actionUndone: 'Действие отменено',
      actionRedone: 'Действие восстановлено'
    }
  },

  // Feature flags
  features: {
    analytics: true,
    history: true,
    contextMenu: true,
    keyboardShortcuts: true,
    dragAndDrop: true,
    search: true,
    export: {
      svg: true,
      png: true,
      pdf: true,
      json: true
    },
    themes: true,
    animations: true,
    grid: false,
    fullscreen: true
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
