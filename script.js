/* Modern JSON/YAML Mind Map Visualizer
   Enhanced with:
   - Modern UI/UX with theme support
   - Advanced analytics and statistics
   - Improved performance and virtualization
   - Enhanced interactions (hotkeys, context menu)
   - Extended export options (PDF, JSON)
   - Toast notifications
   - Better error handling and validation
*/

(() => {
  'use strict';

  // DOM References
  const elements = {
    inputData: document.getElementById('inputData'),
    btnLoad: document.getElementById('btnLoad'),
    btnDemo: document.getElementById('btnDemo'),
    btnFormat: document.getElementById('btnFormat'),
    btnClear: document.getElementById('btnClear'),
    btnFile: document.getElementById('btnFile'),
    fileInput: document.getElementById('fileInput'),
    btnDownloadSVG: document.getElementById('btnDownloadSVG'),
    btnDownloadPNG: document.getElementById('btnDownloadPNG'),
    btnDownloadPDF: document.getElementById('btnDownloadPDF'),
    btnDownloadJSON: document.getElementById('btnDownloadJSON'),
    btnViewJSON: document.getElementById('btnViewJSON'),
    btnShare: document.getElementById('btnShare'),
    btnSave: document.getElementById('btnSave'),
    btnLoadSession: document.getElementById('btnLoadSession'),
    btnClearSession: document.getElementById('btnClearSession'),
    searchInput: document.getElementById('search'),
    toggleLabels: document.getElementById('toggleLabels'),
    toggleAnimations: document.getElementById('toggleAnimations'),
    toggleGrid: document.getElementById('toggleGrid'),
    themeToggle: document.getElementById('themeToggle'),
    languageSelect: document.getElementById('languageSelect'),
    container: document.getElementById('mindmap'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    contextMenu: document.getElementById('contextMenu'),
    toastContainer: document.getElementById('toastContainer'),
    projectInfo: document.getElementById('projectInfo'),
    demoFromInfo: document.getElementById('demoFromInfo'),
    // Analytics elements
    nodeCount: document.getElementById('nodeCount'),
    linkCount: document.getElementById('linkCount'),
    maxDepth: document.getElementById('maxDepth'),
    dataSize: document.getElementById('dataSize'),
    // Toolbar elements
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut'),
    btnResetZoom: document.getElementById('btnResetZoom'),
    btnCenter: document.getElementById('btnCenter'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    zoomLevel: document.getElementById('zoomLevel'),
    // JSON Modal elements
    jsonModal: document.getElementById('jsonModal'),
    closeJsonModal: document.getElementById('closeJsonModal'),
    jsonEditor: document.getElementById('jsonEditor'),
    jsonPreview: document.getElementById('jsonPreview'),
    copyJson: document.getElementById('copyJson'),
    downloadJson: document.getElementById('downloadJson'),
    formatJson: document.getElementById('formatJson'),
    validateJson: document.getElementById('validateJson'),
    applyChanges: document.getElementById('applyChanges'),
    resetJson: document.getElementById('resetJson'),
    togglePreview: document.getElementById('togglePreview'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    // Search elements
    searchPrev: document.getElementById('searchPrev'),
    searchNext: document.getElementById('searchNext'),
    clearSearch: document.getElementById('clearSearch'),
    searchResults: document.getElementById('searchResults'),
    searchCount: document.getElementById('searchCount'),
    toggleSearchCase: document.getElementById('toggleSearchCase'),
    toggleSearchWhole: document.getElementById('toggleSearchWhole'),
    // Share elements
    shareModal: document.getElementById('shareModal'),
    closeShareModal: document.getElementById('closeShareModal'),
    shareUrl: document.getElementById('shareUrl'),
    copyShareUrl: document.getElementById('copyShareUrl'),
    qrCode: document.getElementById('qrCode'),
    downloadQR: document.getElementById('downloadQR'),
    shareData: document.getElementById('shareData'),
    copyShareData: document.getElementById('copyShareData')
  };

  // Application State
  const state = {
    svg: null,
    gViewport: null,
    gLink: null,
    gNode: null,
    width: 800,
    height: 600,
    simulation: null,
    treeRoot: null,
    nodes: [],
    links: [],
    currentTheme: localStorage.getItem('theme') || 'light',
    currentLanguage: localStorage.getItem('language') || 'ru',
    animationsEnabled: true,
    gridEnabled: false,
    selectedNode: null,
    originalJsonData: null,
    previewEnabled: true,
    // Search state
    searchResults: [],
    currentSearchIndex: -1,
    searchCaseSensitive: false,
    searchWholeWord: false,
    // Share state
    shareData: null,
    zoom: d3.zoomIdentity,
    history: [],
    historyIndex: -1,
    maxHistorySize: 50
  };

  // Constants
  const STORAGE_KEY = 'mindmap_session_v2';
  const THEME_KEY = 'mindmap_theme';
  const SETTINGS_KEY = 'mindmap_settings';

  // Utility Functions
  const utils = {
    uid: (() => { let i = 0; return (p = 'id') => `${p}_${++i}`; })(),
    
    showToast: (message, type = 'info', duration = 3000) => {
      // If message is a translation key, translate it
      if (typeof message === 'string' && message.includes('.')) {
        const translated = i18n.t(message);
        if (translated !== message) {
          message = translated;
        }
      }
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span>${getToastIcon(type)}</span>
          <span>${message}</span>
        </div>
      `;
      
      elements.toastContainer.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },
    
    showLoading: (show = true) => {
      elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    },
    
    formatBytes: (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };

  const getToastIcon = (type) => {
    const icons = {
      success: '<i class="bi bi-check-circle-fill"></i>',
      error: '<i class="bi bi-x-circle-fill"></i>',
      warning: '<i class="bi bi-exclamation-triangle-fill"></i>',
      info: '<i class="bi bi-info-circle-fill"></i>'
    };
    return icons[type] || icons.info;
  };

  // Internationalization Manager
  const i18n = {
    translations: {},
    currentLang: 'ru',
    
    async loadLanguage(lang) {
      try {
        const response = await fetch(`langs/${lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load language: ${lang}`);
        }
        this.translations = await response.json();
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.updateUI();
      } catch (error) {
        console.error('Error loading language:', error);
        // Fallback to Russian
        if (lang !== 'ru') {
          await this.loadLanguage('ru');
        }
      }
    },
    
    t(key) {
      const keys = key.split('.');
      let value = this.translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation missing for key: ${key}`);
          return key;
        }
      }
      
      return typeof value === 'string' ? value : key;
    },
    
    updateUI() {
      // Update all elements with data-i18n attributes
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.t(key);
        
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = translation;
        } else if (element.tagName === 'TITLE') {
          element.textContent = translation;
        } else {
          element.textContent = translation;
        }
      });
      
      // Update title attributes
      document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = this.t(key);
      });
      
      // Update placeholder attributes
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = this.t(key);
      });
      
      // Update specific elements
      this.updateSpecificElements();
    },
    
    updateSpecificElements() {
      // Update app title
      const title = document.querySelector('.title h1');
      if (title) {
        title.innerHTML = `<i class="bi bi-diagram-3"></i> ${this.t('app.title')}`;
      }
      
      const subtitle = document.querySelector('.title .lead');
      if (subtitle) {
        subtitle.textContent = this.t('app.subtitle');
      }
      
      // Update search placeholder
      if (elements.searchInput) {
        elements.searchInput.placeholder = this.t('search.placeholder');
      }
      
      // Update language select title
      if (elements.languageSelect) {
        elements.languageSelect.title = this.t('settings.selectLanguage') || 'Выбрать язык';
      }
      
      // Update theme toggle title
      if (elements.themeToggle) {
        elements.themeToggle.title = this.t('settings.toggleTheme') || 'Переключить тему';
      }
      
      // Update footer tips
      this.updateFooterTips();
    },
    
    updateFooterTips() {
      const tipsList = document.querySelector('.footer-tips ul');
      if (tipsList) {
        tipsList.innerHTML = `
          <li>${this.t('footer.tips.drag')}</li>
          <li>${this.t('footer.tips.click')}</li>
          <li>${this.t('footer.tips.edit')}</li>
          <li>${this.t('footer.tips.context')}</li>
          <li>${this.t('footer.tips.search')}</li>
          <li>${this.t('footer.tips.zoom')}</li>
          <li>${this.t('footer.tips.undo')}</li>
        `;
      }
      
      const tipsTitle = document.querySelector('.footer-tips h4');
      if (tipsTitle) {
        tipsTitle.innerHTML = `<i class="bi bi-lightbulb"></i> ${this.t('footer.tips.title')}:`;
      }
    }
  };

  // Theme Management
  const themeManager = {
    init: () => {
      document.documentElement.setAttribute('data-theme', state.currentTheme);
      const themeIcon = elements.themeToggle.querySelector('.theme-icon');
      themeIcon.className = state.currentTheme === 'dark' ? 'bi bi-sun-fill theme-icon' : 'bi bi-moon-fill theme-icon';
    },
    
    toggle: () => {
      state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.currentTheme);
      localStorage.setItem(THEME_KEY, state.currentTheme);
      
      const themeIcon = elements.themeToggle.querySelector('.theme-icon');
      themeIcon.className = state.currentTheme === 'dark' ? 'bi bi-sun-fill theme-icon' : 'bi bi-moon-fill theme-icon';
      
      utils.showToast(`Переключено на ${state.currentTheme === 'dark' ? 'темную' : 'светлую'} тему`, 'success');
    }
  };

  // Analytics Manager
  const analytics = {
    update: () => {
      if (!state.treeRoot) {
        elements.nodeCount.textContent = '0';
        elements.linkCount.textContent = '0';
        elements.maxDepth.textContent = '0';
        elements.dataSize.textContent = '0 B';
        return;
      }

      const stats = analytics.calculateStats(state.treeRoot);
      elements.nodeCount.textContent = stats.nodes;
      elements.linkCount.textContent = stats.links;
      elements.maxDepth.textContent = stats.maxDepth;
      elements.dataSize.textContent = utils.formatBytes(stats.size);
    },
    
    calculateStats: (root) => {
      if (!root) {
        return { nodes: 0, links: 0, maxDepth: 0, size: 0 };
      }
      
      let nodeCount = 0;
      let linkCount = 0;
      let maxDepth = 0;
      let totalSize = 0;
      
      const traverse = (node, depth = 0) => {
        if (!node) return;
        
        nodeCount++;
        maxDepth = Math.max(maxDepth, depth);
        totalSize += JSON.stringify(node.label || '').length;
        
        if (node.children && node.children.length > 0) {
          linkCount += node.children.length;
          node.children.forEach(child => traverse(child, depth + 1));
        }
      };
      
      traverse(root);
      
      // Add size of the entire tree structure
      totalSize += JSON.stringify(root).length;
      
      return {
        nodes: nodeCount,
        links: linkCount,
        maxDepth,
        size: totalSize
      };
    }
  };

  // History Manager
  const historyManager = {
    save: () => {
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      
      state.history.push({
        tree: JSON.parse(JSON.stringify(state.treeRoot)),
        input: elements.inputData.value,
        timestamp: Date.now()
      });
      
      if (state.history.length > state.maxHistorySize) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
    },
    
    undo: () => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const state = state.history[state.historyIndex];
        elements.inputData.value = state.input;
        state.treeRoot = state.tree;
        update();
        utils.showToast('Действие отменено', 'info');
      }
    },
    
    redo: () => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const state = state.history[state.historyIndex];
        elements.inputData.value = state.input;
        state.treeRoot = state.tree;
        update();
        utils.showToast('Действие восстановлено', 'info');
      }
    }
  };

  // Context Menu Manager
  const contextMenu = {
    show: (event, nodeData) => {
      event.preventDefault();
      elements.contextMenu.style.display = 'block';
      elements.contextMenu.style.left = event.pageX + 'px';
      elements.contextMenu.style.top = event.pageY + 'px';
      elements.contextMenu.dataset.nodeId = nodeData?.id || '';
    },
    
    hide: () => {
      elements.contextMenu.style.display = 'none';
    },
    
    handleAction: (action, nodeId) => {
      switch (action) {
        case 'edit':
          if (nodeId) {
            const node = state.nodes.find(n => n.id === nodeId);
            if (node) showInlineEditor(node);
          }
          break;
        case 'delete':
          if (nodeId) {
            deleteNode(nodeId);
          }
          break;
        case 'expand':
          expandAll();
          break;
        case 'collapse':
          collapseAll();
          break;
      }
      contextMenu.hide();
    }
  };

  // Initialize SVG
  function initSVG() {
    // Only clear if no SVG exists
    if (!state.svg) {
      elements.container.innerHTML = '';
    }
    
    state.width = elements.container.clientWidth || 800;
    state.height = elements.container.clientHeight || 600;

    if (!state.svg) {
      state.svg = d3.select(elements.container).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
        .attr('viewBox', `0 0 ${state.width} ${state.height}`)
      .style('background', 'transparent')
      .style('cursor', 'grab');

      // For mobile devices, make SVG responsive
      if (window.innerWidth <= 768) {
        state.svg.attr('preserveAspectRatio', 'xMidYMid meet');
      }
    }

    if (!state.gViewport) {
      state.gViewport = state.svg.append('g').attr('class', 'viewport');
      state.gLink = state.gViewport.append('g').attr('class', 'links');
      state.gNode = state.gViewport.append('g').attr('class', 'nodes');
    }

    // Enhanced zoom with better controls
    if (!state.svg.select('.zoom-initialized').empty()) {
      return; // Already initialized
    }
    
    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        state.zoom = event.transform;
        state.gViewport.attr('transform', event.transform);
        updateZoomLevel();
      });

    state.svg.call(zoom);
    state.zoom = d3.zoomIdentity;
    state.svg.classed('zoom-initialized', true);

    // Center initial view
    state.svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  }

  // Update zoom level display
  function updateZoomLevel() {
    const percentage = Math.round(state.zoom.k * 100);
    elements.zoomLevel.textContent = `${percentage}%`;
  }

  // Build hierarchical tree with enhanced metadata
  function buildTree(obj, key = 'root', depth = 0) {
    const node = {
      id: utils.uid('t'),
      key,
      label: null,
      value: null,
      children: [],
      depth,
      _collapsed: false,
      _type: Array.isArray(obj) ? 'array' : (typeof obj === 'object' && obj !== null ? 'object' : 'primitive'),
      _size: obj !== null && typeof obj === 'object' ? Object.keys(obj).length : 0
    };

    if (obj !== null && typeof obj === 'object') {
      node.label = key;
      if (Array.isArray(obj)) {
        obj.forEach((v, i) => {
          const c = buildTree(v, `[${i}]`, depth + 1);
          node.children.push(c);
        });
      } else {
        Object.keys(obj).forEach(k => {
          const v = obj[k];
          if (v !== null && typeof v === 'object') {
            const c = buildTree(v, k, depth + 1);
            node.children.push(c);
          } else {
            node.children.push({
              id: utils.uid('t'),
              key: k,
              label: `${k}: ${String(v)}`,
              value: v,
              children: [],
              depth: depth + 1,
              _collapsed: false,
              _type: 'primitive',
              _size: 0
            });
          }
        });
      }
    } else {
      node.label = `${key}: ${String(obj)}`;
      node.value = obj;
    }
    return node;
  }

  // Flatten visible tree with enhanced filtering
  function flatten(root) {
    const outNodes = [];
    const outLinks = [];
    
    function visit(n, parent = null) {
      outNodes.push({ 
        id: n.id, 
        label: n.label || n.key, 
        depth: n.depth, 
        treeRef: n,
        type: n._type,
        size: n._size
      });
      
      if (parent) outLinks.push({ source: parent.id, target: n.id });
      
      if (!n._collapsed && n.children && n.children.length) {
        n.children.forEach(c => visit(c, n));
      }
    }
    
    if (root) visit(root, null);
    return { nodes: outNodes, links: outLinks };
  }

  // Project Info Panel Management
  function showProjectInfo() {
    if (elements.projectInfo) {
      elements.projectInfo.style.display = 'block';
    }
  }
  
  function hideProjectInfo() {
    if (elements.projectInfo) {
      elements.projectInfo.style.display = 'none';
    }
  }

  // Enhanced update function with better performance
  function update() {
    if (!state.svg) initSVG();

    const graph = flatten(state.treeRoot);
    
    // Preserve previous node positions
    const prevById = new Map(state.nodes.map(n => [n.id, n]));
    state.nodes = graph.nodes.map(n => {
      const prev = prevById.get(n.id);
      return prev ? Object.assign(prev, n) : Object.assign({}, n, { 
        x: state.width / 2 + (Math.random() - 0.5) * 100, 
        y: state.height / 2 + (Math.random() - 0.5) * 100 
    });
    });
    state.links = graph.links.map(l => Object.assign({}, l));

    // Update links with enhanced styling
    const linkSel = state.gLink.selectAll('line.link').data(state.links, d => `${d.source}|${d.target}`);

    linkSel.exit()
      .transition().duration(state.animationsEnabled ? 300 : 0)
      .style('opacity', 0)
      .remove();

    const linkEnter = linkSel.enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'var(--border-color)')
      .attr('stroke-width', 1.5)
      .style('opacity', 0);

    if (state.animationsEnabled) {
    linkEnter.transition().duration(400).style('opacity', 1);
    } else {
      linkEnter.style('opacity', 1);
    }

    const linkAll = linkEnter.merge(linkSel);

    // Update nodes with enhanced styling
    const nodeSel = state.gNode.selectAll('g.node').data(state.nodes, d => d.id);

    const nodeExit = nodeSel.exit();
    if (state.animationsEnabled) {
    nodeExit.select('circle').transition().duration(300).attr('r', 0);
    nodeExit.transition().duration(300).style('opacity', 0).remove();
    } else {
      nodeExit.remove();
    }

    const nodeEnter = nodeSel.enter().append('g')
      .attr('class', 'node')
      .style('opacity', 0)
      .style('pointer-events', 'all');

    // Enhanced node styling based on type
    nodeEnter.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => {
        const baseSize = 8;
        const depthFactor = Math.max(0, 6 - d.depth * 0.3);
        const typeFactor = d.type === 'array' ? 2 : (d.type === 'object' ? 1.5 : 1);
        return baseSize + depthFactor * typeFactor;
      })
      .attr('fill', d => {
        if (d.depth === 0) return 'var(--accent-primary)';
        if (d.type === 'array') return 'var(--accent-info)';
        if (d.type === 'object') return 'var(--accent-success)';
        return 'var(--accent-warning)';
      })
      .attr('stroke', 'var(--border-color)')
      .attr('stroke-width', 1);

    nodeEnter.append('text')
      .attr('class', 'node-label')
      .attr('x', 15)
      .attr('y', 4)
      .text(d => d.label);

    if (state.animationsEnabled) {
    nodeEnter.transition().duration(400).style('opacity', 1);
    } else {
      nodeEnter.style('opacity', 1);
    }

    const nodeAll = nodeEnter.merge(nodeSel);

    // Update text for all nodes (including existing ones)
    nodeAll.selectAll('text.node-label').text(d => d.label);
    
    // Update node selection styling
    nodeAll.selectAll('circle.node-circle')
      .attr('stroke-width', d => d === state.selectedNode ? 3 : 1)
      .attr('stroke', d => d === state.selectedNode ? 'var(--accent-primary)' : 'var(--border-color)');

    // Show/hide labels
    nodeAll.selectAll('text').style('display', elements.toggleLabels.checked ? null : 'none');

    // Enhanced drag behavior
    const drag = d3.drag()
      .on('start', (event, d) => {
        event.sourceEvent.stopPropagation();
        if (!event.active && state.simulation) state.simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && state.simulation) state.simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      });

    // Apply drag to all nodes
    nodeAll.call(drag);

    // Apply event handlers to all nodes
    nodeAll
      .on('click', (event, d) => {
        if (event.defaultPrevented) return;
        
        // Set selected node
        state.selectedNode = d;
        
        // Toggle collapse/expand
      const tref = d.treeRef;
      tref._collapsed = !tref._collapsed;
      update();
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        contextMenu.show(event, d);
      })
      .on('dblclick', (event, d) => {
      event.stopPropagation();
        event.preventDefault();
        console.log('Double click detected on node:', d.label);
      showInlineEditor(d);
    });

    // Enhanced tooltips
    nodeAll.selectAll('title').remove();
    nodeAll.append('title').text(d => {
      const info = [
        `Тип: ${d.type}`,
        `Глубина: ${d.depth}`,
        d.size > 0 ? `Размер: ${d.size}` : ''
      ].filter(Boolean).join('\n');
      return `${d.label}\n${info}`;
    });

    // Restart simulation with enhanced forces
    if (state.simulation) state.simulation.stop();

    state.simulation = d3.forceSimulation(state.nodes)
      .force('link', d3.forceLink(state.links)
        .id(d => d.id)
        .distance(d => 80 + (d.target.depth || 1) * 10)
        .strength(0.8))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(state.width / 2, state.height / 2))
      .force('collision', d3.forceCollide().radius(d => 25 + (d.label ? d.label.length * 0.3 : 0)))
      .alphaDecay(0.02)
      .on('tick', ticked);

    function ticked() {
      linkAll
        .attr('x1', d => getNodeX(d.source))
        .attr('y1', d => getNodeY(d.source))
        .attr('x2', d => getNodeX(d.target))
        .attr('y2', d => getNodeY(d.target));

      nodeAll.attr('transform', d => `translate(${getNodeX(d)},${getNodeY(d)})`);
    }

    function getNodeX(ref) { 
      return (typeof ref === 'object' ? ref.x : (state.nodes.find(n => n.id === ref) || {}).x) || 0; 
    }
    function getNodeY(ref) { 
      return (typeof ref === 'object' ? ref.y : (state.nodes.find(n => n.id === ref) || {}).y) || 0; 
    }

    // Update analytics
    analytics.update();
  }

  // Enhanced inline editor with smooth animations
  function showInlineEditor(d) {
    console.log('showInlineEditor called for node:', d.label);
    
    // Фиксируем позицию узла во время редактирования
    d.fx = d.x;
    d.fy = d.y;
    
    const transform = d3.zoomTransform(state.svg.node());
    const screenX = transform.x + d.x * transform.k;
    const screenY = transform.y + d.y * transform.k;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = d.label || '';
    input.className = 'inline-input';
    
    // Better positioning relative to node
    const rect = elements.container.getBoundingClientRect();
    const inputX = Math.max(10, Math.min(screenX + 20, rect.width - 160));
    const inputY = Math.max(10, Math.min(screenY - 15, rect.height - 40));
    
    input.style.left = `${inputX}px`;
    input.style.top = `${inputY}px`;
    input.style.minWidth = '150px';
    input.style.maxWidth = '200px';
    input.style.opacity = '0';
    input.style.transform = 'scale(0.8)';
    input.style.transition = 'all 0.2s ease-out';

    elements.container.appendChild(input);
    
    // Smooth entrance animation
    requestAnimationFrame(() => {
      input.style.opacity = '1';
      input.style.transform = 'scale(1)';
    });
    
    input.focus();
    input.select();

    function commit() {
      const newVal = input.value.trim();
      if (newVal && newVal !== d.label) {
        historyManager.save();
        d.treeRef.label = newVal;
        d.label = newVal;
        
        // Smooth exit animation before update
        input.style.opacity = '0';
        input.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
          input.remove();
          // Освобождаем фиксацию позиции
          d.fx = null;
          d.fy = null;
        update();
          utils.showToast('messages.info.labelUpdated', 'success');
        }, 200);
      } else {
        cancel();
      }
    }

    function cancel() { 
      // Smooth exit animation
      input.style.opacity = '0';
      input.style.transform = 'scale(0.8)';
      setTimeout(() => {
      input.remove();
        // Освобождаем фиксацию позиции
        d.fx = null;
        d.fy = null;
      }, 200);
    }

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') commit();
      if (ev.key === 'Escape') cancel();
    });
  }

  // Enhanced search with highlighting
  const highlightSearch = utils.debounce((query) => {
    if (!state.gNode) return;
    
    const q = query.toLowerCase();
    state.gNode.selectAll('g.node').each(function (d) {
      const g = d3.select(this);
      const label = (d.label || '').toLowerCase();
      const matched = q && label.includes(q);
      
      g.select('circle')
        .attr('stroke', matched ? 'var(--accent-primary)' : 'var(--border-color)')
        .attr('stroke-width', matched ? 3 : 1);
      
      if (matched) {
        this.parentNode.appendChild(this);
        g.select('text').style('font-weight', 'bold');
      } else {
        g.select('text').style('font-weight', 'normal');
      }
    });
  }, 300);

  // JSON Editor Modal
  const jsonViewer = {
    show: (data) => {
      try {
        // Check if data exists
        if (!data) {
          utils.showToast('Нет данных для отображения', 'warning');
          return;
        }
        
        const jsonString = JSON.stringify(data, null, 2);
        state.originalJsonData = jsonString;
        
        elements.jsonEditor.value = jsonString;
        elements.jsonModal.classList.add('show');
        elements.jsonModal.style.display = 'flex';
        
        // Update status
        jsonViewer.updateStatus('ready', 'Готов');
        
        // Focus on editor
        elements.jsonEditor.focus();
      } catch (error) {
        utils.showToast('Ошибка при отображении JSON: ' + error.message, 'error');
        console.error('JSON display error:', error);
      }
    },
    
    hide: () => {
      elements.jsonModal.classList.remove('show');
      setTimeout(() => {
        elements.jsonModal.style.display = 'none';
        // Reset state
        state.originalJsonData = null;
        elements.jsonEditor.value = '';
        elements.jsonPreview.innerHTML = '<div class="preview-placeholder"><i class="bi bi-file-code"></i><p>Предпросмотр будет показан здесь</p></div>';
      }, 300);
    },
    
    updatePreview: function() {
      // Preview disabled - only editor
      return;
    },
    
    updateStatus: function(type, message) {
      elements.statusIndicator.className = `status-indicator ${type}`;
      elements.statusText.textContent = message;
    },
    
    validate: function() {
      try {
        const text = elements.jsonEditor.value;
        if (!text.trim()) {
          utils.showToast('JSON пуст', 'warning');
          return false;
        }
        
        JSON.parse(text);
        utils.showToast('JSON валиден', 'success');
        jsonViewer.updateStatus('ready', 'JSON валиден');
        return true;
      } catch (error) {
        utils.showToast(`Ошибка JSON: ${error.message}`, 'error');
        jsonViewer.updateStatus('error', 'Ошибка JSON');
        return false;
      }
    },
    
    format: function() {
      try {
        const text = elements.jsonEditor.value;
        if (!text.trim()) {
          utils.showToast('JSON пуст', 'warning');
          return;
        }
        
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        elements.jsonEditor.value = formatted;
        utils.showToast('JSON отформатирован', 'success');
      } catch (error) {
        utils.showToast(`Ошибка при форматировании: ${error.message}`, 'error');
      }
    },
    
    apply: function() {
      try {
        const text = elements.jsonEditor.value;
        if (!text.trim()) {
          utils.showToast('JSON пуст', 'warning');
          return;
        }
        
        const parsed = JSON.parse(text);
        
        // Save to history before applying
        historyManager.save();
        
        // Update the mind map
        state.treeRoot = parsed;
        update();
        
        // Update original data
        state.originalJsonData = text;
        
        utils.showToast('Изменения применены', 'success');
        jsonViewer.updateStatus('ready', 'Изменения применены');
      } catch (error) {
        utils.showToast(`Ошибка при применении: ${error.message}`, 'error');
        jsonViewer.updateStatus('error', 'Ошибка применения');
      }
    },
    
    reset: function() {
      if (state.originalJsonData) {
        elements.jsonEditor.value = state.originalJsonData;
        utils.showToast('Изменения сброшены', 'info');
        jsonViewer.updateStatus('ready', 'Готов');
      } else {
        utils.showToast('Нет данных для сброса', 'warning');
      }
    },
    
    copy: function() {
      const text = elements.jsonEditor.value;
      navigator.clipboard.writeText(text).then(() => {
        utils.showToast('JSON скопирован в буфер обмена', 'success');
      }).catch(() => {
        utils.showToast('Не удалось скопировать JSON', 'error');
      });
    },
    
    download: function() {
      const text = elements.jsonEditor.value;
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmap_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      utils.showToast('JSON файл скачан', 'success');
    },
    
    togglePreview: function() {
      // Preview disabled - only editor
      return;
    }
  };

  // Enhanced Search Manager
  const searchManager = {
    search: (query) => {
      if (!query.trim() || !state.nodes.length) {
        state.searchResults = [];
        state.currentSearchIndex = -1;
        searchManager.updateSearchDisplay();
        return;
      }

      const results = [];
      const searchQuery = state.searchCaseSensitive ? query : query.toLowerCase();
      
      state.nodes.forEach((node, index) => {
        const nodeText = state.searchCaseSensitive ? node.label : node.label.toLowerCase();
        let matches = false;
        
        if (state.searchWholeWord) {
          matches = nodeText === searchQuery;
        } else {
          matches = nodeText.includes(searchQuery);
        }
        
        if (matches) {
          results.push({
            node: node,
            index: index,
            label: node.label
          });
        }
      });
      
      state.searchResults = results;
      state.currentSearchIndex = results.length > 0 ? 0 : -1;
      searchManager.updateSearchDisplay();
      searchManager.highlightResults();
    },
    
    updateSearchDisplay: () => {
      const count = state.searchResults.length;
      const current = state.currentSearchIndex + 1;
      
      if (count === 0) {
        elements.searchResults.style.display = 'none';
        elements.searchCount.textContent = '0 результатов';
      } else {
        elements.searchResults.style.display = 'block';
        elements.searchCount.innerHTML = `
          <span class="search-count">${current} из ${count} результатов</span>
          <div class="search-results-list">
            ${state.searchResults.map((result, index) => `
              <div class="search-result-item ${index === state.currentSearchIndex ? 'active' : ''}" 
                   data-index="${index}" 
                   title="Кликните для перехода к узлу">
                <i class="bi bi-diagram-2"></i>
                <span class="result-label">${result.node.label}</span>
              </div>
            `).join('')}
          </div>
        `;
        
        // Add click handlers to result items
        elements.searchCount.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(item.dataset.index);
            state.currentSearchIndex = index;
            searchManager.highlightResults();
            searchManager.centerOnNode(state.searchResults[index].node);
            searchManager.updateSearchDisplay();
          });
        });
      }
    },
    
    highlightResults: () => {
      if (!state.gNode) return;
      
      // Remove previous highlights
      state.gNode.selectAll('.search-highlight').classed('search-highlight', false);
      
      // Add highlights to current results
      state.gNode.selectAll('g.node').each(function(d) {
        const isHighlighted = state.searchResults.some(result => result.node === d);
        const g = d3.select(this);
        
        if (isHighlighted) {
          g.classed('search-highlight', true);
          g.select('circle').style('stroke', 'var(--accent-primary)').style('stroke-width', 3);
          g.select('text').style('font-weight', 'bold');
        } else {
          g.classed('search-highlight', false);
          g.select('circle').style('stroke', null).style('stroke-width', null);
          g.select('text').style('font-weight', null);
        }
      });
      
      // Center on current result
      if (state.currentSearchIndex >= 0 && state.searchResults[state.currentSearchIndex]) {
        const currentNode = state.searchResults[state.currentSearchIndex].node;
        searchManager.centerOnNode(currentNode);
      }
    },
    
    centerOnNode: (node) => {
      if (!state.svg || !node) return;
      
      const transform = d3.zoomTransform(state.svg.node());
      const scale = Math.max(1.5, transform.k); // Увеличиваем масштаб для лучшей видимости
      
      state.svg.transition().duration(500).call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(
          state.width / 2 - node.x * scale,
          state.height / 2 - node.y * scale
        ).scale(scale)
      );
      
      // Обновляем отображение масштаба
      zoomControls.updateZoomDisplay();
    },
    
    next: () => {
      if (state.searchResults.length === 0) return;
      
      state.currentSearchIndex = (state.currentSearchIndex + 1) % state.searchResults.length;
      searchManager.updateSearchDisplay();
      searchManager.highlightResults();
    },
    
    prev: () => {
      if (state.searchResults.length === 0) return;
      
      state.currentSearchIndex = state.currentSearchIndex <= 0 
        ? state.searchResults.length - 1 
        : state.currentSearchIndex - 1;
      searchManager.updateSearchDisplay();
      searchManager.highlightResults();
    },
    
    clear: () => {
      elements.searchInput.value = '';
      state.searchResults = [];
      state.currentSearchIndex = -1;
      searchManager.updateSearchDisplay();
      searchManager.highlightResults();
    },
    
    toggleCaseSensitive: () => {
      state.searchCaseSensitive = !state.searchCaseSensitive;
      elements.toggleSearchCase.classList.toggle('active', state.searchCaseSensitive);
      
      // Re-search with new settings
      const query = elements.searchInput.value;
      if (query) {
        searchManager.search(query);
      }
    },
    
    toggleWholeWord: () => {
      state.searchWholeWord = !state.searchWholeWord;
      elements.toggleSearchWhole.classList.toggle('active', state.searchWholeWord);
      
      // Re-search with new settings
      const query = elements.searchInput.value;
      if (query) {
        searchManager.search(query);
      }
    }
  };

  // Share Manager
  const shareManager = {
    show: () => {
      if (!state.treeRoot) {
        utils.showToast('Нет данных для поделиться', 'warning');
        return;
      }
      
      try {
        // Prepare share data
        const shareData = JSON.stringify(state.treeRoot, null, 2);
        state.shareData = shareData;
        
        // Generate share URL
        const shareUrl = shareManager.generateShareUrl();
        elements.shareUrl.value = shareUrl;
        elements.shareData.value = shareData;
        
        // Generate QR code
        shareManager.generateQRCode(shareUrl);
        
        // Show modal
        elements.shareModal.classList.add('show');
        elements.shareModal.style.display = 'flex';
      } catch (error) {
        utils.showToast('Ошибка при подготовке данных для поделиться: ' + error.message, 'error');
        console.error('Share error:', error);
      }
    },
    
    hide: () => {
      elements.shareModal.classList.remove('show');
      setTimeout(() => {
        elements.shareModal.style.display = 'none';
      }, 300);
    },
    
    generateShareUrl: () => {
      try {
        // Create a local share URL with encoded data
        const jsonString = JSON.stringify(state.treeRoot);
        const data = btoa(encodeURIComponent(jsonString));
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?data=${data}`;
      } catch (error) {
        console.error('Error generating share URL:', error);
        return window.location.href;
      }
    },
    
    generateQRCode: (url) => {
      const canvas = elements.qrCode;
      
      if (!canvas) {
        console.warn('QR Code canvas not found');
        return;
      }
      
      try {
        // Check if QRCode library is available
        if (typeof QRCode === 'undefined') {
          console.warn('QRCode library not loaded, using fallback');
          this.generateQRCodeFallback(url);
          return;
        }
        
        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Generate real QR code optimized for Android camera
        QRCode.toCanvas(canvas, url, {
          width: 256,
          height: 256,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          margin: 4,
          errorCorrectionLevel: 'H', // High error correction for better readability
          typeNumber: 0 // Auto-detect best type
        }, (error) => {
          if (error) {
            console.error('QR Code generation error:', error);
            this.generateQRCodeFallback(url);
          }
        });
      } catch (error) {
        console.error('QR Code generation error:', error);
        this.generateQRCodeFallback(url);
      }
    },
    
    generateQRCodeFallback: (url) => {
      const canvas = elements.qrCode;
      
      if (!canvas) {
        console.warn('QR Code canvas not found for fallback');
        return;
      }
      
      try {
        // Use our local QR code implementation optimized for Android
        new QRCode(canvas, url, {
          width: 256,
          height: 256,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          margin: 4,
          errorCorrectionLevel: 'H', // High error correction for better readability
          typeNumber: 0 // Auto-detect best type
        });
      } catch (error) {
        console.error('Fallback QR Code generation error:', error);
        // Ultimate fallback: simple pattern
        const ctx = canvas.getContext('2d');
        const size = 200;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Draw a simple pattern
        ctx.fillStyle = 'black';
        const moduleSize = 4;
        const modules = Math.floor(size / moduleSize);
        
        for (let i = 0; i < modules; i++) {
          for (let j = 0; j < modules; j++) {
            if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
              ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
            }
          }
        }
        
        // Add URL text at the bottom
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', size / 2, size - 10);
      }
    },
    
    copyUrl: () => {
      navigator.clipboard.writeText(elements.shareUrl.value).then(() => {
        utils.showToast('Ссылка скопирована в буфер обмена', 'success');
      }).catch(() => {
        utils.showToast('Не удалось скопировать ссылку', 'error');
      });
    },
    
    copyData: () => {
      navigator.clipboard.writeText(elements.shareData.value).then(() => {
        utils.showToast('Данные скопированы в буфер обмена', 'success');
      }).catch(() => {
        utils.showToast('Не удалось скопировать данные', 'error');
      });
    },
    
    downloadQR: () => {
      const canvas = elements.qrCode;
      const link = document.createElement('a');
      link.download = `mindmap_qr_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      utils.showToast('QR код скачан', 'success');
    }
  };

  // Enhanced export functions
  const exportManager = {
    downloadSVG: () => {
      if (!state.svg) return utils.showToast('Нет данных для экспорта', 'warning');
      
      const clone = state.svg.node().cloneNode(true);
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleEl.textContent = `
        text{font-family:Inter,Arial,sans-serif;fill:var(--text-primary)}
        .link{stroke:var(--border-color)}
        .node-circle{stroke:var(--border-color)}
      `;
    clone.insertBefore(styleEl, clone.firstChild);
      
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(clone);
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmap_${new Date().toISOString().slice(0, 10)}.svg`;
      a.click();
    URL.revokeObjectURL(url);
      
      utils.showToast('SVG файл скачан', 'success');
    },

    downloadPNG: async () => {
      if (!state.svg) return utils.showToast('Нет данных для экспорта', 'warning');
      
      utils.showLoading(true);
      
      try {
    const serializer = new XMLSerializer();
        const clone = state.svg.node().cloneNode(true);
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.textContent = `
          text{font-family:Inter,Arial,sans-serif;fill:var(--text-primary)}
          .link{stroke:var(--border-color)}
          .node-circle{stroke:var(--border-color)}
        `;
    clone.insertBefore(styleEl, clone.firstChild);
        
    const str = serializer.serializeToString(clone);
    const img = new Image();
    const svgBlob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = (e) => rej(e);
      img.src = url;
    });

        const viewBox = state.svg.attr('viewBox') ? state.svg.attr('viewBox').split(' ') : [0, 0, state.width, state.height];
    const canvas = document.createElement('canvas');
        const scaleFactor = 2;
    canvas.width = (+viewBox[2]) * scaleFactor;
    canvas.height = (+viewBox[3]) * scaleFactor;
    const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
          a.href = u;
          a.download = `mindmap_${new Date().toISOString().slice(0, 10)}.png`;
          a.click();
      URL.revokeObjectURL(u);
      URL.revokeObjectURL(url);
          utils.showToast('PNG файл скачан', 'success');
    }, 'image/png');
      } catch (error) {
        utils.showToast('Ошибка при экспорте PNG', 'error');
        console.error('PNG export error:', error);
      } finally {
        utils.showLoading(false);
      }
    },

    downloadPDF: () => {
      if (!state.svg) return utils.showToast('Нет данных для экспорта', 'warning');
      
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4');
        
        // Get SVG as string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(state.svg.node());
        
        // Add to PDF (simplified approach)
        pdf.text('JSON/YAML Mind Map', 20, 20);
        pdf.text(`Создано: ${new Date().toLocaleString()}`, 20, 30);
        pdf.text(`Узлов: ${state.nodes.length}`, 20, 40);
        pdf.text(`Связей: ${state.links.length}`, 20, 50);
        
        pdf.save(`mindmap_${new Date().toISOString().slice(0, 10)}.pdf`);
        utils.showToast('PDF файл скачан', 'success');
      } catch (error) {
        utils.showToast('Ошибка при экспорте PDF', 'error');
        console.error('PDF export error:', error);
      }
    },

    downloadJSON: () => {
      if (!state.treeRoot) return utils.showToast('Нет данных для экспорта', 'warning');
      
      const data = {
        metadata: {
          created: new Date().toISOString(),
          nodes: state.nodes.length,
          links: state.links.length,
          version: '2.0'
        },
        tree: state.treeRoot,
        originalData: elements.inputData.value
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmap_data_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      utils.showToast('JSON файл скачан', 'success');
  }
  };

  // Session management
  const sessionManager = {
    save: () => {
    const payload = {
        input: elements.inputData.value,
        tree: state.treeRoot,
        settings: {
          theme: state.currentTheme,
          animations: state.animationsEnabled,
          grid: state.gridEnabled
        },
        timestamp: Date.now(),
        version: '2.0'
      };
      
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        utils.showToast('Сессия сохранена', 'success');
    } catch (e) {
        utils.showToast('Ошибка сохранения: ' + e.message, 'error');
    }
    },

    load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return utils.showToast('Сохраненная сессия не найдена', 'warning');
        
      const payload = JSON.parse(raw);
        elements.inputData.value = payload.input || '';
        
      if (payload.tree) {
          state.treeRoot = payload.tree;
        update();
      } else {
          parseAndRender();
        }
        
        // Restore settings
        if (payload.settings) {
          state.currentTheme = payload.settings.theme || 'light';
          state.animationsEnabled = payload.settings.animations !== false;
          state.gridEnabled = payload.settings.grid || false;
          
          elements.toggleAnimations.checked = state.animationsEnabled;
          elements.toggleGrid.checked = state.gridEnabled;
          themeManager.init();
        }
        
        utils.showToast('Сессия загружена', 'success');
    } catch (e) {
        utils.showToast('Ошибка загрузки: ' + e.message, 'error');
    }
    },

    clear: () => {
    localStorage.removeItem(STORAGE_KEY);
      utils.showToast('Сохраненная сессия очищена', 'info');
  }
  };

  // Parse and render with enhanced error handling
  function parseAndRender() {
    if (typeof d3 === 'undefined') {
      utils.showToast('D3.js не загружен. Проверьте подключение к интернету.', 'error');
      return;
    }
    
    const txt = (elements.inputData.value || '').trim();
    if (!txt) return utils.showToast('Введите JSON или YAML данные', 'warning');
    
    utils.showLoading(true);
    
    setTimeout(() => {
      try {
    let parsed;
    try {
      parsed = JSON.parse(txt);
    } catch (_) {
      try {
            if (typeof jsyaml === 'undefined') {
              throw new Error('js-yaml не загружен. Проверьте подключение к интернету.');
            }
        parsed = jsyaml.load(txt);
      } catch (e) {
            throw new Error('Неверный формат JSON/YAML: ' + (e && e.message));
      }
    }
        
        historyManager.save();
        state.treeRoot = buildTree(parsed, 'root', 0);
    update();
        utils.showToast('Данные успешно обработаны', 'success');
      } catch (error) {
        utils.showToast(error.message, 'error');
      } finally {
        utils.showLoading(false);
      }
    }, 100);
  }

  // Enhanced demo data
  function loadDemo() {
    const demo = {
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
        website: "https://sergioplay-dev.netlify.app",
        social: {
          github: "https://github.com/sergioplay",
          twitter: "@sergioplay_dev"
        }
      },
      statistics: {
        totalNodes: 0,
        maxDepth: 0,
        dataSize: "0 KB"
      },
      examples: [
        {
          id: 1,
          title: "Простой объект",
          data: { name: "John", age: 30, city: "Moscow" }
        },
        {
          id: 2,
          title: "Вложенная структура",
          data: {
            user: {
              profile: {
                personal: { name: "Jane", age: 25 },
                preferences: { theme: "dark", language: "ru" }
              },
              settings: { notifications: true, privacy: "public" }
            }
          }
        }
      ]
    };
    
    elements.inputData.value = JSON.stringify(demo, null, 2);
    parseAndRender();
    hideProjectInfo();
  }

  // Utility functions for tree manipulation
  function expandAll() {
    if (!state.treeRoot) return;
    
    const expand = (node) => {
      node._collapsed = false;
      if (node.children) {
        node.children.forEach(expand);
      }
    };
    
    expand(state.treeRoot);
    update();
    utils.showToast('Все узлы развернуты', 'info');
  }

  function collapseAll() {
    if (!state.treeRoot) return;
    
    const collapse = (node) => {
      if (node.children && node.children.length > 0) {
        node._collapsed = true;
        node.children.forEach(collapse);
      }
    };
    
    collapse(state.treeRoot);
    update();
    utils.showToast('Все узлы свернуты', 'info');
  }

  function deleteNode(nodeId) {
    if (!nodeId || !state.treeRoot) return;
    
    // Find the node to delete
    const nodeToDelete = state.nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) {
      utils.showToast('Узел не найден', 'error');
      return;
    }
    
    // Don't allow deleting root node
    if (nodeToDelete.depth === 0) {
      utils.showToast('Нельзя удалить корневой узел', 'warning');
      return;
    }
    
    // Save to history before deletion
    historyManager.save();
    
    // Find and remove the node from tree structure
    const treeRef = nodeToDelete.treeRef;
    if (treeRef && treeRef.parent) {
      // Remove from parent's children
      const parent = treeRef.parent;
      if (parent.children) {
        parent.children = parent.children.filter(child => child !== treeRef);
        // If parent has no children left, remove children property
        if (parent.children.length === 0) {
          delete parent.children;
        }
      }
    }
    
    // Update visualization
    update();
    utils.showToast(`Узел "${nodeToDelete.label}" удален`, 'success');
  }

  // Zoom controls
  const zoomControls = {
    updateZoomDisplay: () => {
      if (!state.svg || !elements.zoomLevel) return;
      const currentTransform = d3.zoomTransform(state.svg.node());
      const zoomPercent = Math.round(currentTransform.k * 100);
      elements.zoomLevel.textContent = `${zoomPercent}%`;
    },
    
    zoomIn: () => {
      if (!state.svg) {
        initSVG();
        if (!state.svg) {
          utils.showToast('Ошибка инициализации SVG', 'error');
          return;
        }
      }
      const currentTransform = d3.zoomTransform(state.svg.node());
      const newScale = Math.min(currentTransform.k * 1.5, 8);
      state.svg.transition().duration(300).call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
      ).on('end', zoomControls.updateZoomDisplay);
    },
    
    zoomOut: () => {
      if (!state.svg) {
        initSVG();
        if (!state.svg) {
          utils.showToast('Ошибка инициализации SVG', 'error');
          return;
        }
      }
      const currentTransform = d3.zoomTransform(state.svg.node());
      const newScale = Math.max(currentTransform.k / 1.5, 0.1);
      state.svg.transition().duration(300).call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
      ).on('end', zoomControls.updateZoomDisplay);
    },
    
    resetZoom: () => {
      if (!state.svg) {
        initSVG();
        if (!state.svg) {
          utils.showToast('Ошибка инициализации SVG', 'error');
          return;
        }
      }
      state.svg.transition().duration(300).call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      ).on('end', zoomControls.updateZoomDisplay);
    },
    
    center: () => {
      if (!state.svg) {
        initSVG();
        if (!state.svg) {
          utils.showToast('Ошибка инициализации SVG', 'error');
          return;
        }
      }
      if (state.nodes.length === 0) {
        utils.showToast('Нет узлов для центрирования', 'warning');
        return;
      }
      
      const bounds = state.nodes.reduce((acc, node) => {
        return {
          minX: Math.min(acc.minX, node.x),
          maxX: Math.max(acc.maxX, node.x),
          minY: Math.min(acc.minY, node.y),
          maxY: Math.max(acc.maxY, node.y)
        };
      }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
      
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      
      state.svg.transition().duration(500).call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(state.width / 2 - centerX, state.height / 2 - centerY).scale(1)
      ).on('end', zoomControls.updateZoomDisplay);
    },
    
    fullscreen: () => {
      if (!document.fullscreenElement) {
        elements.container.requestFullscreen().catch(err => {
          utils.showToast('Не удалось войти в полноэкранный режим', 'error');
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Event Listeners
  function setupEventListeners() {
    // Main actions
    elements.btnLoad.addEventListener('click', parseAndRender);
    elements.btnDemo.addEventListener('click', loadDemo);
    
    // Demo button from project info
    if (elements.demoFromInfo) {
      elements.demoFromInfo.addEventListener('click', loadDemo);
    }
    elements.btnFormat.addEventListener('click', () => {
      try {
        const obj = JSON.parse(elements.inputData.value);
        elements.inputData.value = JSON.stringify(obj, null, 2);
        utils.showToast('JSON отформатирован', 'success');
    } catch (e) {
        utils.showToast('Ошибка форматирования: неверный JSON', 'error');
      }
    });
    elements.btnClear.addEventListener('click', () => {
      elements.inputData.value = '';
      state.treeRoot = null;
      if (state.svg) {
        elements.container.innerHTML = '';
        state.svg = null;
      }
      analytics.update();
      showProjectInfo();
      utils.showToast('Данные очищены', 'info');
    });

    // File handling
    elements.btnFile.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', async (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
      
      try {
    const txt = await f.text();
        elements.inputData.value = txt;
    parseAndRender();
        utils.showToast(`Файл ${f.name} загружен`, 'success');
      } catch (error) {
        utils.showToast('Ошибка загрузки файла', 'error');
      }
    });

    // Export functions
    elements.btnDownloadSVG.addEventListener('click', exportManager.downloadSVG);
    elements.btnDownloadPNG.addEventListener('click', exportManager.downloadPNG);
    elements.btnDownloadPDF.addEventListener('click', exportManager.downloadPDF);
    elements.btnDownloadJSON.addEventListener('click', exportManager.downloadJSON);
    elements.btnViewJSON.addEventListener('click', () => {
      if (!state.treeRoot) {
        utils.showToast('Нет данных для просмотра', 'warning');
        return;
      }
      jsonViewer.show.bind(jsonViewer)(state.treeRoot);
    });
    elements.btnShare.addEventListener('click', shareManager.show);

    // Session management
    elements.btnSave.addEventListener('click', sessionManager.save);
    elements.btnLoadSession.addEventListener('click', sessionManager.load);
    elements.btnClearSession.addEventListener('click', sessionManager.clear);

    // Enhanced search
    elements.searchInput.addEventListener('input', utils.debounce((e) => {
      searchManager.search(e.target.value);
    }, 300));
    
    elements.searchPrev.addEventListener('click', searchManager.prev);
    elements.searchNext.addEventListener('click', searchManager.next);
    elements.clearSearch.addEventListener('click', searchManager.clear);
    elements.toggleSearchCase.addEventListener('click', searchManager.toggleCaseSensitive);
    elements.toggleSearchWhole.addEventListener('click', searchManager.toggleWholeWord);
    elements.toggleLabels.addEventListener('change', () => {
      if (state.gNode) {
        state.gNode.selectAll('text').style('display', elements.toggleLabels.checked ? null : 'none');
      }
    });
    elements.toggleAnimations.addEventListener('change', (e) => {
      state.animationsEnabled = e.target.checked;
    });
    elements.toggleGrid.addEventListener('change', (e) => {
      state.gridEnabled = e.target.checked;
      // Grid implementation would go here
    });

    // Language selector
    elements.languageSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      state.currentLanguage = selectedLang;
      i18n.loadLanguage(selectedLang);
    });

    // Theme toggle
    elements.themeToggle.addEventListener('click', themeManager.toggle);

    // Zoom controls
    if (elements.btnZoomIn) {
      elements.btnZoomIn.addEventListener('click', () => {
        console.log('Zoom In clicked, SVG exists:', !!state.svg);
        zoomControls.zoomIn();
      });
    }
    if (elements.btnZoomOut) {
      elements.btnZoomOut.addEventListener('click', () => {
        console.log('Zoom Out clicked, SVG exists:', !!state.svg);
        zoomControls.zoomOut();
      });
    }
    if (elements.btnResetZoom) {
      elements.btnResetZoom.addEventListener('click', () => {
        console.log('Reset Zoom clicked, SVG exists:', !!state.svg);
        zoomControls.resetZoom();
      });
    }
    if (elements.btnCenter) {
      elements.btnCenter.addEventListener('click', () => {
        console.log('Center clicked, SVG exists:', !!state.svg, 'Nodes count:', state.nodes.length);
        zoomControls.center();
      });
    }
    if (elements.btnFullscreen) {
      elements.btnFullscreen.addEventListener('click', zoomControls.fullscreen);
    }

    // Context menu
    elements.contextMenu.addEventListener('click', (e) => {
      const action = e.target.closest('.context-item')?.dataset.action;
      const nodeId = elements.contextMenu.dataset.nodeId;
      if (action) contextMenu.handleAction(action, nodeId);
    });

    // JSON Modal handlers
    elements.closeJsonModal.addEventListener('click', jsonViewer.hide.bind(jsonViewer));
    elements.copyJson.addEventListener('click', jsonViewer.copy.bind(jsonViewer));
    elements.downloadJson.addEventListener('click', jsonViewer.download.bind(jsonViewer));
    elements.formatJson.addEventListener('click', jsonViewer.format.bind(jsonViewer));
    elements.validateJson.addEventListener('click', jsonViewer.validate.bind(jsonViewer));
    elements.applyChanges.addEventListener('click', jsonViewer.apply.bind(jsonViewer));
    elements.resetJson.addEventListener('click', jsonViewer.reset.bind(jsonViewer));
    elements.togglePreview.addEventListener('click', jsonViewer.togglePreview.bind(jsonViewer));
    
    // Real-time preview updates disabled
    
    // Close modal on background click
    elements.jsonModal.addEventListener('click', (e) => {
      if (e.target === elements.jsonModal) {
        jsonViewer.hide.bind(jsonViewer)();
      }
    });

    // Share modal handlers
    elements.closeShareModal.addEventListener('click', shareManager.hide);
    elements.copyShareUrl.addEventListener('click', shareManager.copyUrl);
    elements.copyShareData.addEventListener('click', shareManager.copyData);
    elements.downloadQR.addEventListener('click', shareManager.downloadQR);
    
    // Close share modal on background click
    elements.shareModal.addEventListener('click', (e) => {
      if (e.target === elements.shareModal) {
        shareManager.hide();
      }
    });

    // Hide context menu on click outside and clear selection
    document.addEventListener('click', (e) => {
      contextMenu.hide();
      // Clear selection if clicking outside nodes
      if (!e.target.closest('.node') && !e.target.closest('.inline-input')) {
        state.selectedNode = null;
        update();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              historyManager.redo();
            } else {
              historyManager.undo();
            }
            break;
          case 's':
            e.preventDefault();
            sessionManager.save();
            break;
          case 'o':
            e.preventDefault();
            elements.fileInput.click();
            break;
          case 'f':
            e.preventDefault();
            elements.searchInput.focus();
            break;
        }
      }
      
      if (e.key === 'Escape') {
        if (elements.jsonModal.classList.contains('show')) {
          jsonViewer.hide.bind(jsonViewer)();
        } else if (elements.shareModal.classList.contains('show')) {
          shareManager.hide();
        } else {
          contextMenu.hide();
        }
      }
      
      // Delete selected node with Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedNode) {
        e.preventDefault();
        deleteNode(state.selectedNode.id);
        state.selectedNode = null;
      }
    });

    // Resize handling
    window.addEventListener('resize', utils.debounce(() => {
      if (!state.svg) return;
      state.width = elements.container.clientWidth;
      state.height = elements.container.clientHeight;
      state.svg.attr('viewBox', `0 0 ${state.width} ${state.height}`);
      
      // For mobile devices, make SVG responsive
      if (window.innerWidth <= 768) {
        state.svg.attr('preserveAspectRatio', 'xMidYMid meet');
      } else {
        state.svg.attr('preserveAspectRatio', null);
      }
      
      if (state.simulation) {
        state.simulation.force('center', d3.forceCenter(state.width / 2, state.height / 2)).alpha(0.3).restart();
      }
    }, 250));
  }

  // Check dependencies
  function checkDependencies() {
    const missing = [];
    
    if (typeof d3 === 'undefined') {
      missing.push('D3.js');
    }
    
    if (typeof jsyaml === 'undefined') {
      missing.push('js-yaml');
    }
    
    if (typeof window.jspdf === 'undefined') {
      missing.push('jsPDF');
    }
    
    if (missing.length > 0) {
      const errorMsg = `Ошибка загрузки библиотек: ${missing.join(', ')}. Убедитесь, что все файлы библиотек находятся в папке libs/`;
      console.error(errorMsg);
      utils.showToast(errorMsg, 'error', 10000);
      return false;
    }
    
    console.log('Все библиотеки успешно загружены');
    return true;
  }

  // Load data from URL parameters
  function loadDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
      try {
        const decodedData = decodeURIComponent(atob(dataParam));
        const jsonData = JSON.parse(decodedData);
        
        // Set the data in input field
        elements.inputData.value = JSON.stringify(jsonData, null, 2);
        
        // Parse and render
        parseAndRender();
        
        utils.showToast('messages.success.urlLoaded', 'success');
      } catch (error) {
        console.error('Error loading data from URL:', error);
        utils.showToast('messages.error.urlLoad', 'error');
      }
    }
  }

  // Initialize application
  async function init() {
    // Check dependencies first
    if (!checkDependencies()) {
      return;
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      state.currentTheme = savedTheme;
    }
    
    // Load data from URL parameters
    loadDataFromURL();
    
    // Load saved settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        state.animationsEnabled = settings.animations !== false;
        state.gridEnabled = settings.grid || false;
        elements.toggleAnimations.checked = state.animationsEnabled;
        elements.toggleGrid.checked = state.gridEnabled;
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    }
    
    // Initialize language
    elements.languageSelect.value = state.currentLanguage;
    await i18n.loadLanguage(state.currentLanguage);
    
    // Initialize SVG for zoom controls
    initSVG();
    
    // Ensure SVG is available for zoom controls
    if (!state.svg) {
      console.warn('SVG not initialized, retrying...');
      setTimeout(() => {
        initSVG();
      }, 100);
    }
    
    // Initialize theme
    themeManager.init();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load demo data
    loadDemo();
    
    // Show project info if no data (after demo is loaded)
    setTimeout(() => {
      if (!state.treeRoot) {
        showProjectInfo();
      }
    }, 100);
    
    // Show welcome message
    setTimeout(() => {
      utils.showToast('Добро пожаловать в JSON/YAML Mind Map Visualizer!', 'info', 5000);
    }, 1000);
  }

  // Save settings on change
  function saveSettings() {
    const settings = {
      theme: state.currentTheme,
      animations: state.animationsEnabled,
      grid: state.gridEnabled
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // Add settings save listeners
  elements.toggleAnimations.addEventListener('change', saveSettings);
  elements.toggleGrid.addEventListener('change', saveSettings);

  // Initialize when DOM is ready
  function waitForDependencies() {
    if (typeof d3 !== 'undefined' && typeof jsyaml !== 'undefined') {
      init();
    } else {
      console.log('Ожидание загрузки библиотек...');
      setTimeout(waitForDependencies, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependencies);
  } else {
    waitForDependencies();
  }

  // URL Parameters Handler
  const urlParams = new URLSearchParams(window.location.search);
  
  // Handle URL actions
  const action = urlParams.get('action');
  if (action) {
    switch (action) {
      case 'new':
        clearData();
        utils.showToast('messages.info.newDiagram', 'info');
        break;
      case 'demo':
        loadData(examples.demo);
        utils.showToast('messages.info.demoLoaded', 'success');
        break;
      case 'clear':
        clearData();
        utils.showToast('messages.info.dataCleared', 'info');
        break;
    }
  }
  
  // Handle data parameter for sharing
  const dataParam = urlParams.get('data');
  if (dataParam) {
    try {
      const decodedData = atob(dataParam);
      const jsonData = JSON.parse(decodedData);
      loadData(jsonData);
      utils.showToast('messages.info.dataLoaded', 'success');
    } catch (error) {
      console.error('Error loading data from URL:', error);
      utils.showToast('messages.errors.invalidData', 'error');
    }
  }
  
  // Handle language parameter
  const langParam = urlParams.get('lang');
  if (langParam && i18n.supportedLanguages.includes(langParam)) {
    i18n.setLanguage(langParam);
  }
  
  // Handle theme parameter
  const themeParam = urlParams.get('theme');
  if (themeParam && ['light', 'dark'].includes(themeParam)) {
    utils.toggleTheme(themeParam === 'dark');
  }

  // Expose for debugging
  window._mindmap = {
    state,
    utils,
    analytics,
    exportManager,
    sessionManager,
    rebuild: () => update(),
    tree: () => state.treeRoot
  };

})();