/**
 * RapidMock Studio - Professional Offline Mockup Generator
 * Core rendering engine using Pixi.js WebGL with Advanced Realism Engine
 */

class RapidMockStudio {
  constructor() {
    // State
    this.mockupData = null;
    this.inputFolder = null;
    this.outputFolder = null;
    this.designFiles = [];
    this.outputFolder = null;
    this.designFiles = [];
    this.sampleDesignData = null;
    this.mockupQueue = []; // Queue for multi-mockup generation
    this.selectedLibraryItems = new Set(); // For UI selection state

    // Design transform state
    this.designPosition = { x: 0.5, y: 0.4 }; // Normalized position (0-1)
    this.designScale = 1;
    this.designRotation = 0;

    // Rendering settings
    this.settings = {
      opacity: 100,
      warpStrength: 12,
      scale: 100,
      rotation: 0,
      blendMode: 'multiply', // Still used for state, though render engine defaults to sophisticated blend
      textureStrength: 30,
      textureStrength: 30,
      showOverlay: true,
      mockupColor: '#ffffff' // Feature 5: Mockup Tint
    };

    // Pixi.js components
    this.app = null;
    this.background = null;
    this.displacementSprite = null;
    this.displacementFilter = null;
    this.designContainer = null;
    this.designSprite = null;
    // New Realism Components
    this.shadowLayer = null;
    this.highlightLayer = null;

    // Interaction state
    this.isDragging = false;
    this.isRotating = false;
    this.dragStart = { x: 0, y: 0 };
    this.designStartPos = { x: 0, y: 0 };

    // Processing state
    this.isProcessing = false;

    this.init();
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.setupPresetListeners();
    this.loadSettings();
    this.initAutoUpdater();
  }

  loadSettings() {
    // Default Settings
    if (!this.settings.exportPreset) this.settings.exportPreset = 'original';
    if (!this.settings.customExportWidth) this.settings.customExportWidth = 2000;

    // Apply to UI
    if (this.presetSelect) {
      this.presetSelect.value = this.settings.exportPreset;
    }
    if (this.customWidthInput) {
      this.customWidthInput.value = this.settings.customExportWidth;
    }

    // Update visibility using the new helper
    this.toggleCustomWidth();
  }

  bindElements() {
    // Setup panel
    this.btnLoadMockup = document.getElementById('btn-load-mockup');
    this.btnSelectInput = document.getElementById('btn-select-input');
    this.btnSelectOutput = document.getElementById('btn-select-output');
    this.mockupInfo = document.getElementById('mockup-info');
    this.inputInfo = document.getElementById('input-info');
    this.outputInfo = document.getElementById('output-info');
    this.sampleDesignArea = document.getElementById('sample-design-area');

    // Canvas
    this.canvasWrapper = document.getElementById('canvas-wrapper');
    this.canvasPlaceholder = document.getElementById('canvas-placeholder');

    // Controls
    this.sliderOpacity = document.getElementById('slider-opacity');
    this.sliderWarp = document.getElementById('slider-warp');
    this.sliderScale = document.getElementById('slider-scale');
    this.sliderRotation = document.getElementById('slider-rotation');
    this.selectBlend = document.getElementById('select-blend');
    this.sliderTexture = document.getElementById('slider-texture');
    this.checkboxOverlay = document.getElementById('checkbox-overlay');

    // Values
    this.opacityValue = document.getElementById('opacity-value');
    this.warpValue = document.getElementById('warp-value');
    this.scaleValue = document.getElementById('scale-value');
    this.rotationValue = document.getElementById('rotation-value');
    this.textureValue = document.getElementById('texture-value');

    // Generate
    this.btnGenerate = document.getElementById('btn-generate');
    this.fileCount = document.getElementById('file-count');
    this.progressSection = document.getElementById('progress-section');
    this.progressFill = document.getElementById('progress-fill');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');

    // Library
    this.btnOpenLibrary = document.getElementById('btn-open-library');
    this.btnCloseLibrary = document.getElementById('btn-close-library');
    this.libraryModal = document.getElementById('library-modal');
    this.libraryCategories = document.getElementById('library-categories');
    this.libraryGrid = document.getElementById('library-grid');
    this.btnImportLibrary = document.getElementById('btn-import-library');

    // Input Modal
    this.inputModal = document.getElementById('input-modal');
    this.inputModalTitle = document.getElementById('input-modal-title');
    this.inputModalValue = document.getElementById('input-modal-value');
    this.btnCloseInput = document.getElementById('btn-close-input');
    this.btnCancelInput = document.getElementById('btn-cancel-input');
    this.btnConfirmInput = document.getElementById('btn-confirm-input');

    // Batch Complete Modal
    this.batchModal = document.getElementById('batch-complete-modal');
    this.batchMessage = document.getElementById('batch-complete-message');

    // Auto-Updater UI (Modal)
    this.appVersion = document.getElementById('app-version');
    this.btnCheckUpdate = document.getElementById('btn-check-update');

    this.updateModal = document.getElementById('update-modal');
    this.updateModalTitle = document.getElementById('update-modal-title');
    this.updateModalMessage = document.getElementById('update-message-modal');
    this.updateSpinner = document.getElementById('update-spinner');
    this.updateProgressContainer = document.getElementById('update-progress-container');
    this.updateProgressFill = document.getElementById('update-progress-fill-modal');
    this.updateProgressText = document.getElementById('update-progress-text');
    this.updateNewVersion = document.getElementById('update-new-version');

    this.btnCloseUpdate = document.getElementById('btn-close-update');
    this.btnDownloadUpdate = document.getElementById('btn-download-update-modal');
    this.btnRestartUpdate = document.getElementById('btn-restart-update-modal');

    this.btnCloseBatch = document.getElementById('btn-close-batch');
    this.btnOpenFolder = document.getElementById('btn-open-folder');
    this.btnAutoFit = document.getElementById('btn-auto-fit');

    // Export Preset Elements
    this.presetSelect = document.getElementById('export-preset');
    this.customWidthGroup = document.getElementById('custom-width-group');
    this.customWidthInput = document.getElementById('custom-width-input');
    this.customWidthInput = document.getElementById('custom-width-input');
    this.customHeightInput = document.getElementById('custom-height-input');

    // Mockup Color
    this.checkboxEnableTint = document.getElementById('checkbox-enable-tint');
    this.tintControls = document.getElementById('tint-controls');
    this.inputMockupColor = document.getElementById('input-mockup-color');
    this.btnResetTint = document.getElementById('btn-reset-tint');
  }

  bindEvents() {
    // Setup buttons
    this.btnLoadMockup.addEventListener('click', () => this.loadMockup());
    if (this.btnOpenLibrary) this.btnOpenLibrary.addEventListener('click', () => this.openLibrary());
    if (this.btnCloseLibrary) this.btnCloseLibrary.addEventListener('click', () => this.closeLibrary());

    // Close modal on outside click
    if (this.libraryModal) {
      this.libraryModal.addEventListener('click', (e) => {
        if (e.target === this.libraryModal) this.closeLibrary();
      });
    }

    this.btnSelectInput.addEventListener('click', () => this.selectInputFolder());
    this.btnSelectOutput.addEventListener('click', () => this.selectOutputFolder());

    // Auto Fit Button
    if (this.btnAutoFit) {
      this.btnAutoFit.addEventListener('click', () => this.positionDesign(true));
    }

    // Sample design area
    this.sampleDesignArea.addEventListener('click', () => this.selectSampleDesign());
    this.sampleDesignArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.sampleDesignArea.style.borderColor = 'var(--accent-color)';
    });
    this.sampleDesignArea.addEventListener('dragleave', () => {
      this.sampleDesignArea.style.borderColor = '';
    });
    this.sampleDesignArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.sampleDesignArea.style.borderColor = '';
      if (e.dataTransfer.files.length > 0) {
        this.loadSampleDesignFromFile(e.dataTransfer.files[0]);
      }
    });

    // Sliders
    this.sliderOpacity.addEventListener('input', (e) => {
      this.settings.opacity = parseInt(e.target.value);
      this.opacityValue.textContent = `${this.settings.opacity}%`;
      this.updateDesign();
    });

    this.sliderWarp.addEventListener('input', (e) => {
      this.settings.warpStrength = parseInt(e.target.value);
      this.warpValue.textContent = this.settings.warpStrength;
      this.updateDisplacement();
    });

    this.sliderScale.addEventListener('input', (e) => {
      this.settings.scale = parseInt(e.target.value);
      this.scaleValue.textContent = `${this.settings.scale}%`;
      this.designScale = this.settings.scale / 100;
      this.updateDesignTransform();
    });

    this.sliderRotation.addEventListener('input', (e) => {
      this.settings.rotation = parseInt(e.target.value);
      this.rotationValue.textContent = `${this.settings.rotation}°`;
      this.designRotation = this.settings.rotation * (Math.PI / 180);
      this.updateDesignTransform();
    });

    this.selectBlend.addEventListener('change', (e) => {
      this.settings.blendMode = e.target.value;
      // Realism engine uses fixed specialized blends, but we can trigger update
      this.updateLighting();
    });

    this.sliderTexture.addEventListener('input', (e) => {
      this.settings.textureStrength = parseInt(e.target.value);
      this.textureValue.textContent = `${this.settings.textureStrength}%`;
      this.updateLighting();
    });

    this.checkboxOverlay.addEventListener('change', (e) => {
      this.settings.showOverlay = e.target.checked;
      this.updateLighting();
    });

    // Mockup Color Tint
    // Mockup Color Tint
    if (this.checkboxEnableTint) {
      this.checkboxEnableTint.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        if (this.tintControls) {
          this.tintControls.style.display = enabled ? 'block' : 'none';
        }
        this.settings.mockupColor = '#ffffff';
        if (this.inputMockupColor) this.inputMockupColor.value = '#ffffff';
        this.updateMockupColor();
      });
    }

    if (this.inputMockupColor) {
      this.inputMockupColor.addEventListener('input', (e) => {
        this.settings.mockupColor = e.target.value;
        this.updateMockupColor();
      });
    }

    if (this.btnResetTint) {
      this.btnResetTint.addEventListener('click', () => {
        this.settings.mockupColor = '#ffffff';
        if (this.inputMockupColor) this.inputMockupColor.value = '#ffffff';
        this.updateMockupColor();
      });
    }

    // Auto-Updater Listeners
    if (this.btnCheckUpdate) {
      this.btnCheckUpdate.addEventListener('click', () => {
        console.log('Check Update Clicked');
        window.electronAPI.checkForUpdates();
      });
    }
    if (this.btnDownloadUpdate) {
      this.btnDownloadUpdate.addEventListener('click', () => {
        window.electronAPI.startDownload();
        this.btnDownloadUpdate.classList.add('hidden');
      });
    }
    if (this.btnRestartUpdate) {
      this.btnRestartUpdate.addEventListener('click', () => {
        window.electronAPI.quitAndInstall();
      });
    }
    if (this.btnCloseUpdate) {
      this.btnCloseUpdate.addEventListener('click', () => {
        this.updateModal.style.display = 'none';
      });
    }

    // Generate button
    if (this.btnGenerate) this.btnGenerate.addEventListener('click', () => this.generateAll());

    // Enable Drag & Drop for all setup areas
    this.bindDragAndDropEvents();

    // Batch Modal Listeners
    if (this.batchModal) {
      this.btnCloseBatch.addEventListener('click', () => {
        this.batchModal.style.display = 'none';
      });

      this.btnOpenFolder.addEventListener('click', () => {
        this.batchModal.style.display = 'none';
        if (this.outputFolder) {
          window.electronAPI.openPathFolder(this.outputFolder);
        }
      });
    }
  }

  setupPresetListeners() {
    this.presetSelect.addEventListener('change', (e) => {
      this.settings.exportPreset = e.target.value;
      this.toggleCustomWidth();
      this.saveSettings();
    });

    this.customWidthInput.addEventListener('change', (e) => {
      let val = parseInt(e.target.value);
      if (val < 100) val = 100;
      if (val > 8000) val = 8000;
      this.settings.customExportWidth = val;
      this.saveSettings();
      if (this.updateHeightDisplay) this.updateHeightDisplay();
    });
  }

  updateHeightDisplay() {
    if (this.customHeightInput) {
      if (this.background && this.background.texture && this.background.texture.valid) {
        const aspect = this.background.texture.width / this.background.texture.height;
        const h = Math.round(this.settings.customExportWidth / aspect);
        this.customHeightInput.value = h;
      } else {
        this.customHeightInput.value = "Auto";
      }
    }
  }

  toggleCustomWidth() {
    if (!this.presetSelect || !this.customWidthGroup) return;

    // Use DOM value directly to be safe
    const isCustom = this.presetSelect.value === 'custom';

    // Force style update
    this.customWidthGroup.style.display = isCustom ? 'block' : 'none';

    // Also update visibility property just in case of weird CSS conflicts
    this.customWidthGroup.style.visibility = isCustom ? 'visible' : (isCustom ? 'visible' : 'inherit');

    if (isCustom) {
      this.updateHeightDisplay();
    }
  }

  bindDragAndDropEvents() {
    const setupDropZone = (element, handler) => {
      element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.style.borderColor = 'var(--accent-color)';
        element.style.backgroundColor = 'rgba(0, 113, 227, 0.05)';
      });

      element.addEventListener('dragleave', (e) => {
        e.preventDefault();
        element.style.borderColor = '';
        element.style.backgroundColor = '';
      });

      element.addEventListener('drop', async (e) => {
        e.preventDefault();
        element.style.borderColor = '';
        element.style.backgroundColor = '';

        if (e.dataTransfer.files.length > 0) {
          handler(e.dataTransfer.files);
        }
      });
    };

    // 1. Base Mockup Drop
    setupDropZone(this.btnLoadMockup.parentElement, (files) => this.handleMockupDrop(files));

    // 2. Input Folder Drop
    setupDropZone(this.btnSelectInput.parentElement, (files) => this.handleInputFolderDrop(files));

    // 3. Output Folder Drop
    setupDropZone(this.btnSelectOutput.parentElement, (files) => this.handleOutputFolderDrop(files));

    // Bind Crop Button
    this.btnCrop = document.getElementById('btn-crop');
    if (this.btnCrop) {
      this.btnCrop.addEventListener('click', () => this.toggleCropMode());
    }
  }

  toggleCropMode() {
    console.log('Toggle Crop Mode called. Current state:', this.isCropping);

    if (!this.designSprite) {
      console.warn('Crop failed: No designSprite found.');
      return;
    }

    this.isCropping = !this.isCropping;
    console.log('New Crop State:', this.isCropping);

    // Update Button UI
    if (this.isCropping) {
      this.btnCrop.classList.add('active');
      this.btnCrop.style.backgroundColor = 'var(--accent-color)';
      this.btnCrop.style.color = '#fff';
    } else {
      this.btnCrop.classList.remove('active');
      this.btnCrop.style.backgroundColor = '';
      this.btnCrop.style.color = '';
    }

    if (this.isCropping) {
      // ENTER CROP MODE
      this.isSelected = true;

      if (!this.cropRect) {
        const tex = this.designSprite.texture;
        console.log('Initializing Crop Rect:', tex.width, tex.height);
        this.cropRect = { x: 0, y: 0, width: tex.width, height: tex.height };
      }

      if (!this.cropMask) {
        console.log('Creating new Crop Mask');
        this.cropMask = new PIXI.Graphics();
        this.designSprite.mask = this.cropMask;
        this.designSprite.addChild(this.cropMask);
      }
      this.updateCropMask();

    } else {
      // EXIT CROP MODE
      console.log('Exiting Crop Mode');
    }
    this.drawSelectionUI();
  }

  async handleMockupDrop(files) {
    const file = files[0];
    // If it's a file path check via IPC (for robust validation)
    if (file.path) {
      const info = await window.electronAPI.getDroppedFilePath(file.path);
      if (info && info.isFile && /\.(png|jpg|jpeg)$/i.test(info.name)) {
        // It's a valid image, load it using standard flow (we need to read file content)
        // We can reuse selectMockupFile logic but we need to bypass dialog
        // Actually, simplest is to read it here or reload via IPC
        // Ideally main process 'select-mockup-file' is tied to dialog. 
        // Let's create a direct loader or just read it here manually for now since we have path 
        // But wait, 'select-mockup-file' returns data object. 
        // Let's add 'load-mockup-file' to main.js? Or just read it rendering side?
        // Rendering side FileReader is fine for preview.
        // BUT App expects this.mockupData structure {name, path, data}
        const reader = new FileReader();
        reader.onload = (e) => {
          this.mockupData = {
            name: info.name,
            path: info.path,
            data: e.target.result
          };
          this.mockupInfo.textContent = info.name;
          this.initPixiApp();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async handleInputFolderDrop(files) {
    const file = files[0];
    if (file.path) {
      const info = await window.electronAPI.getDroppedFilePath(file.path);
      if (info && info.isDirectory) {
        // It's a folder, trigger load
        // We can't reuse selectInputFolder() easily because it calls dialog
        // We need a way to scan folder by path.
        // Let's use IPC for that. We already have 'select-input-folder' logic in main.
        // We should expose a 'scan-input-folder' method.
        // For now, I'll modify main.js to allow passing path to scan? No, separate is cleaner.
        // Or I can just rely on the user to drop a folder and trust it?
        // Let's assume (file.path) is correct.
        // I will add 'scan-folder' to preload/main.
        const result = await window.electronAPI.scanFolder(file.path);
        if (result) {
          this.inputFolder = result.path;
          this.designFiles = result.files;
          this.inputInfo.textContent = `${result.files.length} files in ${result.path.split(/[\\/]/).pop()}`;
          this.updateGenerateButton();
        }
      }
    }
  }

  async handleOutputFolderDrop(files) {
    const file = files[0];
    if (file.path) {
      const info = await window.electronAPI.getDroppedFilePath(file.path);
      if (info && info.isDirectory) {
        this.outputFolder = info.path;
        this.outputInfo.textContent = info.path.split(/[\\/]/).pop();
        this.updateGenerateButton();
      }
    }
  }

  async loadMockup() {
    const result = await window.electronAPI.selectMockupFile();
    if (result) {
      this.mockupData = result;
      this.mockupInfo.textContent = result.name;
      this.initPixiApp();
    }
  }

  async selectInputFolder() {
    const result = await window.electronAPI.selectInputFolder();
    if (result) {
      this.inputFolder = result.path;
      this.designFiles = result.files;
      this.inputInfo.textContent = `${result.files.length} files in ${result.path.split(/[\\/]/).pop()}`;
      this.updateGenerateButton();
    }
  }

  async selectOutputFolder() {
    const result = await window.electronAPI.selectOutputFolder();
    if (result) {
      this.outputFolder = result;
      this.outputInfo.textContent = result.split(/[\\/]/).pop();
      this.updateGenerateButton();
    }
  }

  async selectSampleDesign() {
    const designData = await window.electronAPI.selectSampleDesignFile();
    if (designData) {
      this.sampleDesignData = designData;
      this.showSampleDesignPreview(designData);
      this.loadDesignToCanvas(designData, true); // New Design = True
    }
  }

  async loadSampleDesignFromFile(file) {
    // Check if it's a file object (from drag drop)
    if (file.path) {
      const designData = await window.electronAPI.loadDesignFile(file.path);
      if (designData) {
        this.sampleDesignData = designData;
        this.showSampleDesignPreview(designData);
        this.loadDesignToCanvas(designData, true); // New Design = True
      }
    } else {
      // Fallback for file object
      const reader = new FileReader();
      reader.onload = (e) => {
        this.sampleDesignData = e.target.result;
        this.showSampleDesignPreview(e.target.result);
        this.loadDesignToCanvas(e.target.result, true); // New Design = True
      };
      reader.readAsDataURL(file);
    }
  }

  showSampleDesignPreview(dataUrl) {
    this.sampleDesignArea.innerHTML = `<img src="${dataUrl}" alt="Sample Design">`;
  }

  updateGenerateButton() {
    const canGenerate = this.mockupData &&
      this.designFiles.length > 0 &&
      this.outputFolder &&
      this.sampleDesignData;
    this.btnGenerate.disabled = !canGenerate;

    if (this.designFiles.length > 0) {
      this.fileCount.textContent = `${this.designFiles.length} files ready to process`;
    } else {
      this.fileCount.textContent = '';
    }
  }

  async initPixiApp() {
    // Remove existing app if any
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true, baseTexture: true });
      // Remove old canvas
      const oldCanvas = this.canvasWrapper.querySelector('canvas');
      if (oldCanvas) oldCanvas.remove();
      this.interactionsBound = false; // FIX: Allow re-binding listeners for new canvas
    }

    // Hide placeholder
    this.canvasPlaceholder.style.display = 'none';

    // Create new Pixi application
    const img = new Image();

    img.onload = async () => {
      // Calculate display size to fit in canvas wrapper
      const wrapperRect = this.canvasWrapper.getBoundingClientRect();
      const maxWidth = wrapperRect.width - 40;
      const maxHeight = wrapperRect.height - 40;

      // Store original dimensions for export
      this.originalWidth = img.width;
      this.originalHeight = img.height;

      // Scale down for display if needed
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const displayScale = Math.min(scaleX, scaleY, 1);

      const displayWidth = Math.floor(img.width * displayScale);
      const displayHeight = Math.floor(img.height * displayScale);

      this.displayScale = displayScale;

      // Create Pixi Application
      this.app = new PIXI.Application({
        width: displayWidth,
        height: displayHeight,
        backgroundColor: 0xf5f5f7,
        preserveDrawingBuffer: true,
        resolution: 1,
        antialias: true
      });

      this.canvasWrapper.appendChild(this.app.view);

      // Setup layers
      this.setupLayers();
      this.setupInteraction();
    };

    img.onerror = (err) => {
      console.error('Failed to load mockup image:', err);
    };

    img.src = this.mockupData.data;
  }

  setupLayers() {
    const mockupTexture = PIXI.Texture.from(this.mockupData.data);

    // Layer 1: Background (Base mockup)
    this.background = new PIXI.Sprite(mockupTexture);
    this.background.width = this.app.screen.width;
    this.background.height = this.app.screen.height;

    // Apply persisted tint
    if (this.settings.mockupColor) {
      this.background.tint = this.settings.mockupColor;
    }

    // --- SMART DISPLACEMENT ENGINE ---
    // Create a high-contrast version of the mockup for better wrinkle detection
    this.displacementSprite = new PIXI.Sprite(mockupTexture);
    this.displacementSprite.width = this.app.screen.width;
    this.displacementSprite.height = this.app.screen.height;

    // High-Pass / Contrast Filters
    // High-Pass / Contrast Filters
    // We remove Contrast entirely as it amplifies noise/grain. We want pure smooth volume.
    const grayFilter = new PIXI.ColorMatrixFilter();
    grayFilter.desaturate();

    // FIX: Apply a HEAVY blur to create a "Volume Map" rather than a "Texture Map"
    // "Enterprise Level" technique: Isolate large forms (folds) and kill all micro-texture.
    const blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.quality = 15; // Max quality kernel
    blurFilter.blur = 35; // Significant blur (approx 1-2% of 4k res) to completely eliminate particulation

    // Combine: Grayscale -> Heavy Blur (Smooth Gradients Only)
    this.displacementSprite.filters = [grayFilter, blurFilter];

    this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

    this.displacementFilter = new PIXI.DisplacementFilter(this.displacementSprite);
    this.displacementFilter.resolution = 2; // High resolution sampling for smoother wrapping
    this.displacementFilter.scale.x = this.settings.warpStrength;
    this.displacementFilter.scale.y = this.settings.warpStrength;

    // Layer 3: Design Container
    this.designContainer = new PIXI.Container();
    this.designContainer.filters = [this.displacementFilter];

    // --- TRI-LAYER REALISM ENGINE ---
    // 1. Shadow Map (Multiply): Deepens folds and crevices.
    this.shadowLayer = new PIXI.Sprite(mockupTexture);
    this.shadowLayer.width = this.app.screen.width;
    this.shadowLayer.height = this.app.screen.height;
    this.shadowLayer.blendMode = PIXI.BLEND_MODES.MULTIPLY;

    // Shadow Tuning: High contrast to keep midtones clean, deep blacks for folds.
    // Shadow Tuning: High contrast to keep midtones clean, deep blacks for folds.
    // FIX: Removed unsafe check for PIXI.features which caused crash. Using standard PIXI.filters location.
    const shadowMatrix = new PIXI.filters.ColorMatrixFilter();
    shadowMatrix.desaturate();
    // "Opaque Ink" Tuning v2: "Super Bleach"
    // We boost brightness EXTREMEMLY high so that 95% of the shirt is Pure White.
    // Pure White in Multiply mode = Transparent. This kills the "Grey Overlay" effect.
    shadowMatrix.contrast(4, false);
    shadowMatrix.brightness(2.5, false); // Massive brightness boost
    this.shadowLayer.filters = [shadowMatrix];
    this.shadowLayer.alpha = 1.0; // Max alpha, since only deep folds remain

    // 2. Texture Map (Hard Light): Re-introduces the fabric grain we blurred out.
    // This is the "Secret Sauce" for extreme realism.
    this.textureLayer = new PIXI.Sprite(mockupTexture);
    this.textureLayer.width = this.app.screen.width;
    this.textureLayer.height = this.app.screen.height;
    this.textureLayer.blendMode = PIXI.BLEND_MODES.HARD_LIGHT; // Hard Light = perfect for texturing

    // Texture Tuning: High Pass effect simulation
    // We want neutral gray (invisible) for flat areas, and light/dark for grain.
    const textureMatrix = new PIXI.filters.ColorMatrixFilter();
    textureMatrix.desaturate();
    textureMatrix.contrast(2, false); // Extreme contrast to isolate grain
    this.textureLayer.filters = [textureMatrix];
    this.textureLayer.alpha = 0.2; // Reduced texture for smoother ink look

    // 3. Highlight Map (Screen): Adds specular sheen on top.
    this.highlightLayer = new PIXI.Sprite(mockupTexture);
    this.highlightLayer.width = this.app.screen.width;
    this.highlightLayer.height = this.app.screen.height;
    this.highlightLayer.blendMode = PIXI.BLEND_MODES.SCREEN;

    const highlightMatrix = new PIXI.filters.ColorMatrixFilter();
    highlightMatrix.contrast(2, false); // Only brightest peaks
    highlightMatrix.brightness(0.6, false); // Darken everything else
    this.highlightLayer.filters = [highlightMatrix];
    this.highlightLayer.alpha = 0.4; // Low opacity to prevent "blown out" whites

    // Build stage
    this.app.stage.addChild(this.background);

    this.displacementSprite.renderable = false; // Hidden but active
    this.app.stage.addChild(this.displacementSprite);

    this.app.stage.addChild(this.designContainer);
    this.app.stage.addChild(this.shadowLayer);
    this.app.stage.addChild(this.textureLayer); // NEW: Add texture layer
    this.app.stage.addChild(this.highlightLayer);

    // Layer 5: UI Overlay (Guides & Handles)
    this.uiContainer = new PIXI.Container();

    // Smart Guides (Lines)
    this.guideGraphics = new PIXI.Graphics();
    this.uiContainer.addChild(this.guideGraphics);

    // Transform Handles (Box + Corners)
    this.handleGraphics = new PIXI.Graphics();
    this.uiContainer.addChild(this.handleGraphics);

    this.app.stage.addChild(this.uiContainer);

    this.updateLighting();

    // FIX: Initialize interactions for the new canvas
    this.setupInteraction();

    // FIX: Persist design across mockup switches
    if (this.pendingDesignUrl) {
      this.loadDesignToCanvas(this.pendingDesignUrl, false); // Existing Design = False
    }
  }

  loadDesignToCanvas(dataUrl, isNewDesign = false) {
    // FIX: Save URL so we can reload it if mockup changes
    this.pendingDesignUrl = dataUrl;

    if (!this.app || !this.designContainer) return;

    // Clear existing design
    this.designContainer.removeChildren();

    const designTexture = PIXI.Texture.from(dataUrl);

    // Use SimplePlane for Mesh Warping (10x10 Grid for high fidelity)
    this.designSprite = new PIXI.SimplePlane(designTexture, 10, 10);

    // FIX: Ensure interactions work even after switching mockups
    this.designSprite.eventMode = 'static';
    this.designSprite.cursor = 'pointer';

    // Reset interaction state
    this.isSelected = false;
    this.drawSelectionUI();

    // Wait for texture to load
    if (designTexture.baseTexture.valid) {
      this.positionDesign(isNewDesign);
    } else {
      designTexture.baseTexture.on('loaded', () => {
        this.positionDesign(isNewDesign);
      });
    }

    this.designContainer.addChild(this.designSprite);

    // Setup Grid Processing for Mesh
    this.setupMeshGrid();

    this.updateGenerateButton();
  }

  positionDesign(isNewDesign = false) {
    if (!this.designSprite) return;

    // Smart Placement: Fit to 40% of mockup width (Chest Print Standard)
    const targetWidth = this.app.screen.width * 0.40;
    const aspectRatio = this.designSprite.texture.width / this.designSprite.texture.height;

    this.baseDesignWidth = targetWidth;
    this.baseDesignHeight = targetWidth / aspectRatio;

    if (isNewDesign) {
      // Reset to Center (True Center) for new designs
      this.designPosition = { x: 0.5, y: 0.5 };
      this.designScale = 1.0;
      this.designRotation = 0;

      // Update UI Sliders
      if (this.sliderScale) {
        this.sliderScale.value = 100;
        this.scaleValue.textContent = "100%";
      }
      if (this.sliderRotation) {
        this.sliderRotation.value = 0;
        this.rotationValue.textContent = "0°";
      }
    }

    this.isSelected = true; // Auto-select new designs

    // Initial transform update will handle x/y/width/height
    this.updateDesignTransform();
  }

  updateCropMask() {
    if (!this.cropMask || !this.cropRect || !this.designSprite) return;

    this.cropMask.clear();
    this.cropMask.beginFill(0xffffff);

    // Draw rect in Local Space
    // To apply a mask in local space of SimplePlane, we might need to handle transforms
    // If we add cropMask as child of designSprite, it inherits transform.
    // Check parenting - force it to be child of designSprite for local masking
    if (this.cropMask.parent !== this.designSprite) {
      this.designSprite.addChild(this.cropMask);
    }

    this.cropMask.drawRect(
      this.cropRect.x,
      this.cropRect.y,
      this.cropRect.width,
      this.cropRect.height
    );
    this.cropMask.endFill();
  }

  updateDesignTransform() {
    if (!this.designSprite) return;

    // Position
    this.designSprite.x = this.app.screen.width * this.designPosition.x;
    this.designSprite.y = this.app.screen.height * this.designPosition.y;

    // For SimplePlane, width/height setter works by scaling vertices
    this.designSprite.width = this.baseDesignWidth * this.designScale;
    this.designSprite.height = this.baseDesignHeight * this.designScale;

    // Rotation - SimplePlane supports rotation
    this.designSprite.rotation = this.designRotation;

    // Centering hack for SimplePlane
    // Since we can't easily set anchor to 0.5, 0.5 on SimplePlane without custom geometry
    // We offset x/y by half width/height (rotated)
    // For now, let's accept top-left pivot or basic rotation
    // To make it rotate around center, pivot is needed
    // ERROR FIX: Pivot must be in LOCAL space (texture dimensions), not screen space
    if (this.designSprite.texture) {
      this.designSprite.pivot.set(this.designSprite.texture.width / 2, this.designSprite.texture.height / 2);
    }

    // Update selection box
    this.drawSelectionUI();
  }

  updateDesign() {
    if (!this.designSprite) return;
    this.designSprite.alpha = this.settings.opacity / 100;
  }

  updateDisplacement() {
    if (!this.displacementFilter) return;
    this.displacementFilter.scale.x = this.settings.warpStrength;
    this.displacementFilter.scale.y = this.settings.warpStrength;
  }

  updateMockupColor() {
    if (this.background) {
      this.background.tint = this.settings.mockupColor;
    }
  }

  updateLighting() {
    if (!this.shadowLayer || !this.highlightLayer || !this.textureLayer) return;

    // Master opacity toggle
    const visible = this.settings.showOverlay;
    this.shadowLayer.visible = visible;
    this.highlightLayer.visible = visible;
    this.textureLayer.visible = visible;

    if (!visible) return;

    // Intensity scaling (Slider 0-100)
    // We scale relative to our "Calibrated Max" values
    const intensity = this.settings.textureStrength / 100;

    // Base Calibrations: "Subtle Realism" Mode
    // We lowered the Shadow Max drastically (0.6 -> 0.35) because on Dark Shirts, 
    // the previous value was creating a "Black Overlay".
    // 0.35 is enough to see the folds, but keeps white ink looking white.
    // Shadow: 0.35
    // Texture: 0.15
    // Highlight: 0.4 (Boosted to add "Ink Sheen")
    this.shadowLayer.alpha = 0.35 * intensity;
    this.textureLayer.alpha = 0.15 * intensity;
    this.highlightLayer.alpha = 0.4 * intensity;
  }

  getBlendMode(mode) {
    const modes = {
      'normal': PIXI.BLEND_MODES.NORMAL,
      'multiply': PIXI.BLEND_MODES.MULTIPLY,
      'darken': PIXI.BLEND_MODES.DARKEN,
      'hard-light': PIXI.BLEND_MODES.HARD_LIGHT
    };
    return modes[mode] || PIXI.BLEND_MODES.MULTIPLY;
  }

  setupMeshGrid() {
    // Initialize basic mesh interactions (future: draggable points)
    // For now, we rely on the displacement filter, but the mesh structure is ready
    // for manual "Arc" or "Bend" transforms.
  }

  drawSelectionUI() {
    if (!this.designSprite || !this.app || !this.handleGraphics) return;

    const g = this.handleGraphics;
    g.clear();

    // Smart Selection: Only draw if selected or cropping
    if (!this.isSelected && !this.isCropping) {
      this.handles = null;
      this.cropHandles = null;
      return;
    }

    // If not dragging or selected, maybe hide? For now always show when design exists
    // Calculate bounds in screen space
    // SimplePlane bounds are tricky, let's use the estimated position/size
    const x = this.designSprite.x;
    const y = this.designSprite.y;
    // Note: SimplePlane pivot is set to center (width/2, height/2) in updateDesignTransform
    // But rotation is around that pivot.

    // We need to draw a rotated box.
    const w = this.designSprite.width;
    const h = this.designSprite.height;
    const angle = this.designSprite.rotation;

    // Corners relative to center
    const tl = { x: -w / 2, y: -h / 2 };
    const tr = { x: w / 2, y: -h / 2 };
    const br = { x: w / 2, y: h / 2 };
    const bl = { x: -w / 2, y: h / 2 };

    const rotate = (p) => ({
      x: p.x * Math.cos(angle) - p.y * Math.sin(angle) + x,
      y: p.x * Math.sin(angle) + p.y * Math.cos(angle) + y
    });

    const pTL = rotate(tl);
    const pTR = rotate(tr);
    const pBR = rotate(br);
    const pBL = rotate(bl);

    // Draw Selection Box OR Crop Box
    if (this.isCropping && this.cropRect) {
      // --- CROP MODE UI ---
      // Hide standard handles
      this.handles = null;

      // Draw Crop Frame (High visibility Orange-Red)
      // Alignment 1 = Outer stroke (doesn't cover the image edge)
      g.lineStyle(3, 0xFF4500, 1, 1);

      // Pivot adjustment: p = p_local - pivot
      const pivotX = this.designSprite.pivot.x;
      const pivotY = this.designSprite.pivot.y;

      const scaleX = this.designSprite.width / this.designSprite.texture.width;
      const scaleY = this.designSprite.height / this.designSprite.texture.height;

      const localToScreen = (lx, ly) => {
        const px = (lx - pivotX) * scaleX;
        const py = (ly - pivotY) * scaleY;
        return rotate({ x: px, y: py });
      };

      const cTL = localToScreen(this.cropRect.x, this.cropRect.y);
      const cTR = localToScreen(this.cropRect.x + this.cropRect.width, this.cropRect.y);
      const cBR = localToScreen(this.cropRect.x + this.cropRect.width, this.cropRect.y + this.cropRect.height);
      const cBL = localToScreen(this.cropRect.x, this.cropRect.y + this.cropRect.height);

      // Draw Crop Box
      g.moveTo(cTL.x, cTL.y);
      g.lineTo(cTR.x, cTR.y);
      g.lineTo(cBR.x, cBR.y);
      g.lineTo(cBL.x, cBL.y);
      g.lineTo(cTL.x, cTL.y);

      // Draw Crop Handles (Squares)
      g.beginFill(0xFFFFFF); // White fill for contrast
      g.lineStyle(2, 0xFF4500, 1); // Orange border
      const cropHandleSize = 10;
      [cTL, cTR, cBR, cBL].forEach(p => {
        g.drawRect(p.x - cropHandleSize / 2, p.y - cropHandleSize / 2, cropHandleSize, cropHandleSize);
      });
      g.endFill();

      this.cropHandles = { cTL, cTR, cBR, cBL };

    } else {
      // --- STANDARD SELECTION UI ---
      // This should match the VISIBLE area (which is the crop rect if cropping happened)
      this.cropHandles = null;

      // Define the visible rectangle in local space
      // If cropRect exists, use it. Otherwise full texture.
      const rect = this.cropRect ? this.cropRect : { x: 0, y: 0, width: this.designSprite.texture.width, height: this.designSprite.texture.height };

      // Helper for transform (same as above)
      const pivotX = this.designSprite.pivot.x;
      const pivotY = this.designSprite.pivot.y;

      const scaleX = this.designSprite.width / this.designSprite.texture.width;
      const scaleY = this.designSprite.height / this.designSprite.texture.height;

      const localToScreen = (lx, ly) => {
        const px = (lx - pivotX) * scaleX;
        const py = (ly - pivotY) * scaleY;
        return rotate({ x: px, y: py });
      };

      const pTL = localToScreen(rect.x, rect.y);
      const pTR = localToScreen(rect.x + rect.width, rect.y);
      const pBR = localToScreen(rect.x + rect.width, rect.y + rect.height);
      const pBL = localToScreen(rect.x, rect.y + rect.height);

      // Draw Box
      g.lineStyle(2, 0x0071e3, 0.8);
      g.moveTo(pTL.x, pTL.y);
      g.lineTo(pTR.x, pTR.y);
      g.lineTo(pBR.x, pBR.y);
      g.lineTo(pBL.x, pBL.y);
      g.lineTo(pTL.x, pTL.y);

      // Draw Handles (Corners)
      g.beginFill(0xffffff);
      g.lineStyle(2, 0x0071e3, 1);
      const handleSize = 8;
      [pTL, pTR, pBR, pBL].forEach(p => {
        g.drawCircle(p.x, p.y, handleSize);
      });
      g.endFill();

      this.handles = { pTL, pTR, pBR, pBL };
    }
  }

  drawGuides(snapX, snapY) {
    if (!this.guideGraphics) return;
    const g = this.guideGraphics;
    g.clear();

    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;

    g.lineStyle(2, 0xff0055, 0.8); // Magenta for guides
    // smart guides look better dashed? Pixi v7 doesn't support native dashed lines easily without plugins
    // solid is fine for now

    if (snapX) {
      g.moveTo(cx, 0);
      g.lineTo(cx, this.app.screen.height);
    }

    if (snapY) {
      g.moveTo(0, cy);
      g.lineTo(this.app.screen.width, cy);
    }
  }

  setupInteraction() {
    if (this.interactionsBound) return; // Prevent duplicate listeners
    this.interactionsBound = true;

    const canvas = this.app.view;

    // State for drag
    this.interactionState = {
      mode: 'none', // 'drag', 'rotate', 'resize'
      start: { x: 0, y: 0 },
      initialParam: 0 // scale or rotation or pos
    };

    canvas.addEventListener('mousedown', (e) => {
      if (!this.designSprite) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 1. CROP HANDLES (Priority if Cropping)
      if (this.isCropping && this.cropHandles) {
        const handleRadius = 20;
        for (const [key, p] of Object.entries(this.cropHandles)) {
          const dx = x - p.x;
          const dy = y - p.y;
          if (dx * dx + dy * dy < handleRadius * handleRadius) {
            this.interactionState = {
              mode: 'crop_resize',
              start: { x, y },
              initialCrop: { ...this.cropRect }, // copy
              handle: key
            };
            return;
          }
        }
      }

      // 2. RESIZE HANDLES (Only if NOT cropping)
      if (!this.isCropping && this.handles) {
        const handleRadius = 20; // Increased hit area
        for (const [key, p] of Object.entries(this.handles)) {
          const dx = x - p.x;
          const dy = y - p.y;
          if (dx * dx + dy * dy < handleRadius * handleRadius) {
            this.interactionState = {
              mode: 'resize',
              start: { x, y },
              initialParam: this.settings.scale,
              handle: key // Store which handle
            };
            return;
          }
        }
      }

      // 3. BODY HIT
      // Use Pixi's bounds calculation for accurate hit detection
      // Note: We need to force update bounds sometimes if transform changed recently
      this.designSprite.calculateBounds();
      const bounds = this.designSprite.getBounds();

      // Expand bounds slightly for easier grabbing
      const hitMargin = 0;
      const isHit = x >= bounds.x - hitMargin && x <= bounds.x + bounds.width + hitMargin &&
        y >= bounds.y - hitMargin && y <= bounds.y + bounds.height + hitMargin;

      if (isHit) {
        this.isSelected = true; // Select on click
        this.drawSelectionUI(); // Force redraw to show handles

        if (this.isCropping) {
          // Dragging body while cropping -> Moves the Mask (Pan) or Moves the Design?
          // Typically moves the 'Crop Window' (Panning).
          // For now let's just ignore body drag in crop mode to avoid confusion, or implement Pan.
          // Let's implement Body Drag moves the DESIGN (standard), and crop stays?
          // No, standard Figma: Double click -> You can move image INSIDE the crop.
          // That means modifying offset.
          // Let's stick to simple: Dragging body moves the whole thing.
          this.interactionState = {
            mode: 'drag',
            start: { x, y },
            designStartPos: { ...this.designPosition }
          };
        } else {
          // Standard Drag / Rotate
          if (e.shiftKey) {
            const dx = x - this.designSprite.x;
            const dy = y - this.designSprite.y;
            this.interactionState = {
              mode: 'rotate',
              rotateStart: Math.atan2(dy, dx),
              rotateStartAngle: this.designRotation
            };
          } else {
            this.interactionState = {
              mode: 'drag',
              start: { x, y },
              designStartPos: { ...this.designPosition }
            };
          }
        }
      } else {
        // Clicked Background -> Deselect
        // Only if not clicking a Handle (handled above)
        this.isSelected = false;
        this.isCropping = false; // also exit crop
        this.drawSelectionUI(); // Redraw to clear handles
      }
    });

    // Double Click for Cropping
    canvas.addEventListener('dblclick', (e) => {
      this.toggleCropMode();
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.interactionState.mode === 'crop_resize') {
        // --- CROP RESIZING LOGIC ---
        const startX = this.interactionState.start.x;
        const startY = this.interactionState.start.y;

        const dx = x - startX;
        const dy = y - startY;

        // Convert screen delta to local delta
        // 1. Unrotate (Screen space rotation)
        const angle = -this.designRotation;
        const rotatedDx = dx * Math.cos(angle) - dy * Math.sin(angle);
        const rotatedDy = dx * Math.sin(angle) + dy * Math.cos(angle);

        // 2. Unscale (Screen to Texture ratio)
        // We must calculate the current ratio between screen size and texture size
        const scaleX = this.designSprite.width / this.designSprite.texture.width;
        const scaleY = this.designSprite.height / this.designSprite.texture.height;

        // Avoid division by zero
        const sX = scaleX || 1;
        const sY = scaleY || 1;

        const localDx = rotatedDx / sX;
        const localDy = rotatedDy / sY;

        const handle = this.interactionState.handle;
        const init = this.interactionState.initialCrop;

        let newRect = { ...init };

        // Apply delta based on handle
        if (handle === 'cTL') {
          newRect.x += localDx;
          newRect.y += localDy;
          newRect.width -= localDx;
          newRect.height -= localDy;
        } else if (handle === 'cTR') {
          newRect.y += localDy;
          newRect.width += localDx;
          newRect.height -= localDy;
        } else if (handle === 'cBR') {
          newRect.width += localDx;
          newRect.height += localDy;
        } else if (handle === 'cBL') {
          newRect.x += localDx;
          newRect.width -= localDx;
          newRect.height += localDy;
        }

        // Min size constraint
        if (newRect.width < 10) newRect.width = 10;
        if (newRect.height < 10) newRect.height = 10;

        this.cropRect = newRect;
        this.updateCropMask();
        this.drawSelectionUI();
        return;
      }

      // Hover cursors
      // (Implementation optimization: check hits and set canvas.style.cursor)

      if (this.interactionState.mode === 'drag') {
        const deltaX = (x - this.interactionState.start.x) / this.app.screen.width;
        const deltaY = (y - this.interactionState.start.y) / this.app.screen.height;

        let newX = this.interactionState.designStartPos.x + deltaX;
        let newY = this.interactionState.designStartPos.y + deltaY;

        // --- SMART GUIDES & SNAPPING ---
        const snapThreshold = 0.02; // 2% of screen
        let snappedX = false;
        let snappedY = false;

        if (Math.abs(newX - 0.5) < snapThreshold) {
          newX = 0.5;
          snappedX = true;
        }

        if (Math.abs(newY - 0.5) < snapThreshold) {
          newY = 0.5;
          snappedY = true;
        }

        this.drawGuides(snappedX, snappedY);

        this.designPosition.x = Math.max(0, Math.min(1, newX));
        this.designPosition.y = Math.max(0, Math.min(1, newY));

        this.updateDesignTransform();

      } else if (this.interactionState.mode === 'resize') {
        // Calculate distance from center of design
        const dx = x - this.designSprite.x;
        const dy = y - this.designSprite.y;
        const currentDist = Math.sqrt(dx * dx + dy * dy);

        const startDx = this.interactionState.start.x - this.designSprite.x;
        const startDy = this.interactionState.start.y - this.designSprite.y;
        const startDist = Math.sqrt(startDx * startDx + startDy * startDy);

        const scaleFactor = currentDist / startDist;

        let newScale = this.interactionState.initialParam * scaleFactor;
        newScale = Math.max(10, Math.min(200, newScale));

        // Sync Slider
        this.settings.scale = Math.round(newScale);
        this.sliderScale.value = this.settings.scale;
        this.scaleValue.textContent = `${this.settings.scale}%`;
        this.designScale = this.settings.scale / 100;

        this.updateDesignTransform();

      } else if (this.interactionState.mode === 'rotate') {
        const dx = x - this.designSprite.x;
        const dy = y - this.designSprite.y;
        const angle = Math.atan2(dy, dx);
        this.designRotation = this.interactionState.rotateStartAngle + (angle - this.interactionState.rotateStart);

        // Update slider
        const degrees = Math.round(this.designRotation * (180 / Math.PI));
        this.sliderRotation.value = Math.max(-180, Math.min(180, degrees));
        this.rotationValue.textContent = `${this.sliderRotation.value}°`;
        this.settings.rotation = parseInt(this.sliderRotation.value);

        this.updateDesignTransform();
      }
    });

    const endDrag = () => {
      this.interactionState = { mode: 'none' };
      if (this.guideGraphics) this.guideGraphics.clear(); // Clear guides on drop
    };

    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);

    // Scroll to resize
    canvas.addEventListener('wheel', (e) => {
      if (!this.designSprite) return;
      e.preventDefault();

      const delta = e.deltaY > 0 ? -5 : 5;
      const newScale = Math.max(10, Math.min(200, this.settings.scale + delta));

      this.settings.scale = newScale;
      this.sliderScale.value = newScale;
      this.scaleValue.textContent = `${newScale}%`;
      this.designScale = newScale / 100;

      this.updateDesignTransform();
    });
  }


  async generateAll() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.btnGenerate.disabled = true;
    this.progressSection.style.display = 'block';

    // Determine processing list
    // If mockupQueue has items, use that. Otherwise use current mockupData as single item.
    const mockupsToProcess = (this.mockupQueue && this.mockupQueue.length > 0)
      ? this.mockupQueue
      : [this.mockupData];

    const totalDesigns = this.designFiles.length;
    const totalMockups = mockupsToProcess.length;
    const totalOperations = totalDesigns * totalMockups;
    let processed = 0;

    // Create a separate high-resolution renderer for export
    const exportApp = new PIXI.Application({
      width: this.originalWidth,
      height: this.originalHeight,
      backgroundColor: 0xffffff,
      preserveDrawingBuffer: true,
      resolution: 1,
      antialias: true
    });

    try {
      // Loop MOCKUPS first (Outer Loop) to minimize texture switching
      for (const mockup of mockupsToProcess) {

        // 1. Load Mockup Texture
        // We need to load it if it's not the current one, or just re-verify
        // To be safe, we load the data from file path
        // Note: For the *current* on screen mockup, we already have data.
        // For queued ones, we only have path.

        // Load Mockup Data
        let currentMockupData = null;
        if (mockup.data) {
          currentMockupData = mockup.data;
        } else {
          // We need to read the file
          // We can use the helper or just construct file://
          // Since we need to pass it to PIXI, file:// is fine for renderer
          currentMockupData = `file://${mockup.path.replace(/\\/g, '/')}`;
        }

        // Setup Export Stage with this Mockup
        // We reuse logic from setupLayers but for exportApp
        const protectedTexture = await this.setupExportStage(exportApp, currentMockupData);
        if (!protectedTexture) {
          console.error(`Failed to setup stage for mockup: ${mockup.name}`);
          continue; // Skip this mockup if texture failed
        }

        for (const designFile of this.designFiles) {
          // Update progress
          processed++;
          this.progressText.textContent = `Processing ${processed} / ${totalOperations} (Mockup: ${mockup.name})`;
          this.progressFill.style.width = `${(processed / totalOperations) * 100}%`;

          // Load design
          const designData = await window.electronAPI.loadDesignFile(designFile.path);
          if (!designData) {
            console.error(`Failed to load: ${designFile.name}`);
            continue;
          }

          // Render at full resolution
          await this.renderExport(exportApp, designData);

          // Extract and save
          let base64 = await exportApp.renderer.extract.base64(exportApp.stage, 'image/jpeg', 0.95);

          // Resize if Preset is active
          if (this.settings.exportPreset !== 'original') {
            base64 = await this.resizeImage(base64, this.settings.exportPreset, this.settings.customExportWidth);
          }

          // Generate output filename -> {DesignName}_{MockupName}.jpg
          // Sanitize mockup name
          const mockupName = mockup.name.replace(/\.(png|jpg|jpeg)$/i, '');
          const designName = designFile.name.replace(/\.(png|jpg|jpeg)$/i, '');
          const outputFilename = `${designName}_${mockupName}.jpg`;

          await window.electronAPI.saveRenderedImage({
            base64Data: base64,
            outputPath: this.outputFolder,
            filename: outputFilename
          });

          // Clear textures to free memory
          this.clearExportTextures(exportApp, protectedTexture);

          // Small delay to prevent UI freeze
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Cleanup Mockup specific textures from Stage before switching Mockup
        // This is important because clearExportTextures only cleared the DESIGN.
        // We need to clear the Mockup Base Texture if we are done with it.
        // But Pixi might share it?
        // Let's force destroy the stage children (Background, displacement, etc)
        // exportApp.stage.removeChildren(); // destroy handled in setupExportStage or final

        // Explicitly destroy children to free RAM before next mockup load
        exportApp.stage.removeChildren();
      }

      this.progressText.textContent = `Complete! ${processed} files generated.`;

      // Show Batch Complete Modal
      if (this.batchModal) {
        this.batchMessage.textContent = `Successfully processed ${processed} files.`;
        this.batchModal.style.display = 'flex';
      }

    } catch (error) {
      console.error('Generation error:', error);
      this.progressText.textContent = `Error: ${error.message}`;
    } finally {
      exportApp.destroy(true, { children: true, texture: true, baseTexture: true });

      this.isProcessing = false;
      this.btnGenerate.disabled = false;

      // Hide progress after delay
      setTimeout(() => {
        this.progressSection.style.display = 'none';
        this.progressFill.style.width = '0%';
      }, 3000);
    }
  }

  // Helper to setup the export stage with a specific mockup
  async setupExportStage(app, mockupUrl) {
    // Clear stage
    app.stage.removeChildren();

    return new Promise((resolve) => {
      const texture = PIXI.Texture.from(mockupUrl);
      if (texture.baseTexture.valid) {
        this._buildLayers(app, texture);
        resolve(texture);
      } else {
        texture.baseTexture.on('loaded', () => {
          this._buildLayers(app, texture);
          resolve(texture);
        });
        texture.baseTexture.on('error', () => {
          console.error("Failed to load export mockup texture");
          resolve(null);
        });
      }
    });
  }

  _buildLayers(app, mockupTexture) {
    if (!mockupTexture) return; // Guard

    // Replicate setupLayers logic but for the export app instance
    // 1. Background
    const bg = new PIXI.Sprite(mockupTexture);
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    app.stage.addChild(bg);

    // 2. Displacement
    const dispSprite = new PIXI.Sprite(mockupTexture);
    dispSprite.width = app.screen.width;
    dispSprite.height = app.screen.height;
    const grayFilter = new PIXI.ColorMatrixFilter();
    grayFilter.desaturate();
    const blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.quality = 15;
    blurFilter.blur = 35;
    dispSprite.filters = [grayFilter, blurFilter];
    dispSprite.renderable = false;
    app.stage.addChild(dispSprite);

    const dispFilter = new PIXI.DisplacementFilter(dispSprite);
    dispFilter.resolution = 2;
    dispFilter.scale.x = this.settings.warpStrength;
    dispFilter.scale.y = this.settings.warpStrength;

    // 3. Design Container
    const designContainer = new PIXI.Container();
    designContainer.filters = [dispFilter];
    app.stage.addChild(designContainer);

    // 4. Realism Layers (Shadow/Highlight)
    // Shadow
    const shadow = new PIXI.Sprite(mockupTexture);
    shadow.width = app.screen.width;
    shadow.height = app.screen.height;
    shadow.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    const shadowMatrix = new PIXI.filters.ColorMatrixFilter();
    shadowMatrix.desaturate();
    shadowMatrix.contrast(4, false);
    shadowMatrix.brightness(2.5, false);
    shadow.filters = [shadowMatrix];
    shadow.alpha = 0.35 * (this.settings.textureStrength / 100);
    if (this.settings.showOverlay) app.stage.addChild(shadow);

    // Highlight
    const highlight = new PIXI.Sprite(mockupTexture);
    highlight.width = app.screen.width;
    highlight.height = app.screen.height;
    highlight.blendMode = PIXI.BLEND_MODES.SCREEN;
    const highlightMatrix = new PIXI.filters.ColorMatrixFilter();
    highlightMatrix.contrast(2, false);
    highlightMatrix.brightness(0.6, false);
    highlight.filters = [highlightMatrix];
    highlight.alpha = 0.4 * (this.settings.textureStrength / 100);
    if (this.settings.showOverlay) app.stage.addChild(highlight);
  }

  async renderExport(exportApp, designData) {
    // Find the designContainer created by _buildLayers
    const designContainer = exportApp.stage.children.find(child => child instanceof PIXI.Container && child.filters && child.filters.some(f => f instanceof PIXI.DisplacementFilter));

    if (!designContainer) {
      console.error("Design container not found in exportApp stage.");
      return;
    }

    // Clear previous design sprite if any
    designContainer.removeChildren();

    const designTexture = PIXI.Texture.from(designData);

    // Wait for texture to load
    if (!designTexture.baseTexture.valid) {
      await new Promise(resolve => {
        designTexture.baseTexture.once('loaded', resolve);
        designTexture.baseTexture.once('error', resolve);
      });
    }

    // Double check validity
    if (!designTexture.baseTexture.valid || designTexture.width === 1) { // 1x1 is usually invalid/placeholder
      console.warn("Skipping invalid design texture");
      return;
    }

    // Create Design Sprite (SimplePlane)
    const designSprite = new PIXI.SimplePlane(designTexture, 10, 10);

    // Apply same transforms at full resolution
    // Pivot for centering
    // Check local bounds to be safe
    const bounds = designSprite.getLocalBounds();
    if (bounds && bounds.width) {
      designSprite.pivot.set(bounds.width / 2, bounds.height / 2);
    }

    // Scale position to full resolution
    designSprite.x = this.originalWidth * this.designPosition.x;
    designSprite.y = this.originalHeight * this.designPosition.y;

    // Calculate design size at full resolution
    // Note: this.baseDesignWidth was calculated relative to screen.
    // We need to calculate relative to original image.
    // Ratio: originalWidth / screenWidth

    // Better approach: Re-calculate based on percentage of mockup width, just like in positionDesign()
    // targetWidth = screenWidth * 0.3
    // Here: targetWidth = originalWidth * 0.3

    // But wait, the user might have scaled it. 
    // this.designScale is the slider status (1.0 = 100%).
    // In positionDesign: this.baseDesignWidth = screenWidth * 0.3
    // currentWidth = baseDesignWidth * designScale

    // So for export:
    const baseWidthExport = this.originalWidth * 0.3;
    const aspectRatio = designTexture.width / designTexture.height;

    designSprite.width = baseWidthExport * this.designScale;
    designSprite.height = (baseWidthExport / aspectRatio) * this.designScale;

    designSprite.rotation = this.designRotation;
    designSprite.alpha = this.settings.opacity / 100;

    // Apply Crop if active
    // We need to scale the crop rect from Screen Space to Original Space
    if (this.cropRect && this.designSprite) { // Check if we have an active crop from the main app
      // The cropRect in main app is in Local Space of the LOCAL design sprite.
      // Since we are creating a NEW design sprite with potentially different pixel dimensions (if texture is same but scaled diff),
      // we simply need to apply the same UV-relative crop?
      // No, cropRect is in pixels relative to the texture size (since it's inside the sprite).
      // If the texture is the SAME (designData is same), then pixels are same.
      // So we can reuse cropRect x/y/w/h directly.

      const cropMask = new PIXI.Graphics();
      cropMask.beginFill(0xffffff);
      cropMask.drawRect(this.cropRect.x, this.cropRect.y, this.cropRect.width, this.cropRect.height);
      cropMask.endFill();

      designSprite.mask = cropMask;
      designSprite.addChild(cropMask);
    }

    designContainer.addChild(designSprite);
  }


  clearExportTextures(exportApp, protectedTexture) {
    const stage = exportApp.stage;
    // We want to keep the BASE mockup texture (which is shared by BG, shadow, highlight)
    // but destroy unique design textures.
    const baseMockupTexture = protectedTexture ? protectedTexture.baseTexture : null;

    const destroyRecursive = (container) => {
      container.children.forEach(child => {
        if (child instanceof PIXI.Sprite || child instanceof PIXI.SimplePlane) {
          if (child.texture) {
            const childBase = child.texture.baseTexture;
            // If this texture is NOT the shared mockup texture, nuke it.
            if (baseMockupTexture && childBase !== baseMockupTexture) {
              child.texture.destroy(true); // Destroy texture + baseTexture
            }
          }
        }

        if (child.children && child.children.length > 0) {
          destroyRecursive(child);
        }
      });
    };

    destroyRecursive(stage);
  }

  // --- LIBRARY METHODS ---

  async resizeImage(base64, preset, customWidth) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let targetWidth, targetHeight;
        const aspect = img.width / img.height;

        if (preset === 'etsy') {
          // Etsy: 2000px width, maintain aspect ratio
          targetWidth = 2000;
          targetHeight = targetWidth / aspect;
        } else if (preset === 'shopify') {
          // Shopify: 2048px square (contain)
          // We need to create a square canvas and center the image
          targetWidth = 2048;
          targetHeight = 2048;
        } else if (preset === 'custom') {
          targetWidth = customWidth;
          targetHeight = targetWidth / aspect;
        } else {
          resolve(base64); // Original
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (preset === 'shopify') {
          // Fill white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Calculate centered position
          let drawW, drawH, offsetX, offsetY;

          if (aspect > 1) { // Landscape
            drawW = targetWidth;
            drawH = targetWidth / aspect;
            offsetX = 0;
            offsetY = (targetHeight - drawH) / 2;
          } else { // Portrait
            drawH = targetHeight;
            drawW = targetHeight * aspect;
            offsetY = 0;
            offsetX = (targetWidth - drawW) / 2;
          }
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        } else {
          // Normal resize
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };

      img.src = base64;
    });
  }
  async openLibrary() {
    this.libraryModal.style.display = 'flex';
    this.selectedLibraryItems.clear(); // Reset selection
    this.loadLibraryData();
    this.updateLibraryFooter();
  }

  closeLibrary() {
    this.libraryModal.style.display = 'none';
  }

  async loadLibraryData() {
    try {
      const categories = await window.electronAPI.scanLibrary();
      this.libraryData = categories;
      this.renderLibraryCategories();
      // Fix: Pass array + name
      this.renderLibraryGrid(this.libraryData['T-Shirts'] || [], 'T-Shirts');
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  }

  renderLibraryCategories() {
    this.libraryCategories.innerHTML = '';

    const allKeys = Object.keys(this.libraryData);

    // Define standard order
    const fixedOrder = ['T-Shirts', 'Hoodies', 'Cups', 'Mugs', 'Caps', 'Wall Frames', 'User Saved'];

    // Separate keys
    const standard = fixedOrder.filter(k => allKeys.includes(k));
    const custom = allKeys.filter(k => !fixedOrder.includes(k)).sort();

    // Combine: Standard first, then Custom
    const keys = [...standard, ...custom];

    keys.forEach((cat) => {
      const li = document.createElement('li');
      // SVG Trash Icon
      li.innerHTML = `
        <span>${cat}</span>
        <div class="delete-icon" title="Delete Category">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>`;

      if (cat === 'T-Shirts') li.classList.add('active'); // Default

      // Selection Click
      li.addEventListener('click', (e) => {
        // Prevent selection if clicking delete bin context
        if (e.target.closest('.delete-icon')) return;

        // Remove active from all
        this.libraryCategories.querySelectorAll('li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        this.renderLibraryGrid(this.libraryData[cat] || [], cat);
      });

      // Delete Click
      const deleteBtn = li.querySelector('.delete-icon');
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Don't select the category

        if (confirm(`Are you sure you want to delete "${cat}"?\nThis action cannot be undone.`)) {
          try {
            const success = await window.electronAPI.deleteLibraryCategory(cat);
            if (success) {
              // Update UI immediately
              const active = this.libraryCategories.querySelector('.active');
              if (active === li) {
                this.renderLibraryGrid(this.libraryData['T-Shirts'] || [], 'T-Shirts'); // Fallback
              }
              this.loadLibraryData();
            } else {
              alert("Could not delete category. Please try restarting the app.");
            }
          } catch (err) {
            console.error(err);
            alert("Error: Please RESTART the app to enable this new feature.");
          }
        }
      });

      this.libraryCategories.appendChild(li);
    });

    // Add "New Category" Button
    const addBtn = document.createElement('li');
    addBtn.className = 'library-category-add';
    addBtn.innerHTML = `<span>+ New Category</span>`;

    // Use standard event listener
    addBtn.addEventListener('click', (e) => {
      console.log("New Category Button Clicked!");
      e.stopPropagation(); // Prevent bubbling issues
      this.createNewCategory();
    });

    this.libraryCategories.appendChild(addBtn);
  }

  renderLibraryGrid(items, categoryName) {
    this.libraryGrid.innerHTML = '';

    if (!items || items.length === 0) {
      // If empty, show only the "Add Mockup" card
    }

    items.forEach(file => {
      const el = document.createElement('div');
      el.className = 'library-item';
      if (this.selectedLibraryItems.has(file.path)) {
        el.classList.add('selected');
      }

      el.innerHTML = `<img src="${file.data ? file.data : 'file://' + file.path.replace(/\\/g, '/')}" loading="lazy">`;

      // Click Handler: Toggle Selection
      el.addEventListener('click', () => {
        this.toggleLibrarySelection(file, el);
      });

      this.libraryGrid.appendChild(el);
    });

    // Add "New Mockup" card at the end
    const addCard = document.createElement('div');
    addCard.className = 'library-item library-item-add';
    addCard.innerHTML = `
      <div class="add-icon">+</div>
      <div style="font-size: 11px; font-weight: 500;">Add Mockup</div>
    `;
    addCard.addEventListener('click', () => {
      this.addMockupToCategory(categoryName);
    });

    // Drag & Drop Support
    addCard.addEventListener('dragover', (e) => {
      e.preventDefault();
      addCard.style.borderColor = 'var(--accent-color)';
      addCard.style.background = 'rgba(0, 113, 227, 0.05)';
    });

    addCard.addEventListener('dragleave', (e) => {
      e.preventDefault();
      addCard.style.borderColor = '';
      addCard.style.background = '';
    });

    addCard.addEventListener('drop', async (e) => {
      e.preventDefault();
      addCard.style.borderColor = '';
      addCard.style.background = '';

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (e.dataTransfer.files[0].path) {
          this.addMockupToCategory(categoryName, e.dataTransfer.files[0].path);
        }
      }
    });

    this.libraryGrid.appendChild(addCard);
  }

  toggleLibrarySelection(file, element) {
    if (this.selectedLibraryItems.has(file.path)) {
      this.selectedLibraryItems.delete(file.path);
      element.classList.remove('selected');
    } else {
      this.selectedLibraryItems.add(file.path);
      element.classList.add('selected');
    }
    this.updateLibraryFooter();
  }

  updateLibraryFooter() {
    // We need to inject a footer button if it doesn't exist, or update it
    const footer = this.libraryModal.querySelector('.modal-footer');
    if (!footer) return;

    // Clear existing or find specific button
    footer.innerHTML = '';

    // Hint
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = this.selectedLibraryItems.size > 0
      ? `${this.selectedLibraryItems.size} mockups selected`
      : 'Select multiple mockups to batch generate';
    footer.appendChild(hint);

    // Context Action Button
    const btnAction = document.createElement('button');
    btnAction.className = 'btn btn-primary';
    btnAction.style.width = 'auto'; // Auto width

    if (this.selectedLibraryItems.size > 0) {
      btnAction.textContent = this.selectedLibraryItems.size === 1 ? 'Use Mockup' : `Use ${this.selectedLibraryItems.size} Mockups`;
      btnAction.disabled = false;
      btnAction.addEventListener('click', () => this.confirmLibrarySelection());
    } else {
      btnAction.textContent = 'Select Mockup';
      btnAction.disabled = true;
    }

    footer.appendChild(btnAction);
  }

  async confirmLibrarySelection() {
    const selectedPaths = Array.from(this.selectedLibraryItems);

    if (selectedPaths.length === 0) return;

    // Queue Logic
    this.mockupQueue = selectedPaths.map(path => ({
      path: path,
      name: path.split(/[\\/]/).pop()
    }));

    // If only one, load it immediately like before
    // If multiple, load the FIRST one as preview, and queue the rest.

    const firstMockup = this.mockupQueue[0];

    // Load the first one
    const safePath = firstMockup.path.replace(/\\/g, '/');
    this.mockupData = {
      name: firstMockup.name,
      path: firstMockup.path,
      data: `file://${safePath}`
    };

    this.mockupInfo.textContent = this.selectedLibraryItems.size > 1
      ? `${firstMockup.name} (+${this.selectedLibraryItems.size - 1} others)`
      : firstMockup.name;

    this.initPixiApp();
    this.closeLibrary();
    this.updateGenerateButton(); // Important to update label
  }

  loadMockupFromLibrary(file) {
    // Determine path with protocol for Electron/Pixi
    // Ensure properly escaped for URL
    const safePath = file.path.replace(/\\/g, '/');

    // We treat 'data' as the source URL for the image
    // For local files, we use file://
    this.mockupData = {
      name: file.name,
      path: file.path,
      data: `file:///${safePath}` // Prepend file:/// (triple slash for Windows root d:/...) 
      // Actually, for d:/... usually file:///d:/... is safe.
      // Let's rely on browser to handle 'file://' + absolute path
    };

    // Fix: Ensure we don't end up with file://d:/... (missing a slash) or file://// (too many)
    // Electron handles "d:/foo" -> "file:///d:/foo" usually.
    // Let's try simple concatenation.
    this.mockupData.data = `file://${safePath}`;

    this.mockupInfo.textContent = file.name;
    this.initPixiApp();
    this.closeLibrary();
  }

  async createNewCategory() {
    try {
      const name = await this.showInputPrompt("Enter Category Name", "e.g. Custom Hoodies");
      if (!name) return;

      const result = await window.electronAPI.createLibraryCategory(name);
      if (result) {
        this.loadLibraryData();
      } else {
        alert("Could not create category. Name might be invalid or already exists.");
      }
    } catch (err) {
      console.error("Input cancelled or failed:", err);
    }
  }

  showInputPrompt(title, placeholder = "") {
    return new Promise((resolve, reject) => {
      this.inputModalTitle.textContent = title;
      this.inputModalValue.value = "";
      this.inputModalValue.placeholder = placeholder;
      this.inputModal.style.display = 'flex';
      this.inputModalValue.focus();

      const closeInfo = () => {
        this.inputModal.style.display = 'none';
        cleanup();
      };

      const handleConfirm = () => {
        const val = this.inputModalValue.value.trim();
        if (val) {
          resolve(val);
          closeInfo();
        }
      };

      const handleCancel = () => {
        resolve(null); // Return null on cancel
        closeInfo();
      };

      const handleKey = (e) => {
        if (e.key === 'Enter') handleConfirm();
        if (e.key === 'Escape') handleCancel();
      };

      const cleanup = () => {
        this.btnConfirmInput.removeEventListener('click', handleConfirm);
        this.btnCancelInput.removeEventListener('click', handleCancel);
        this.btnCloseInput.removeEventListener('click', handleCancel);
        this.inputModalValue.removeEventListener('keydown', handleKey);
      };

      this.btnConfirmInput.addEventListener('click', handleConfirm);
      this.btnCancelInput.addEventListener('click', handleCancel);
      this.btnCloseInput.addEventListener('click', handleCancel);
      this.inputModalValue.addEventListener('keydown', handleKey);
    });
  }



  initAutoUpdater() {
    console.log('Initializing Auto Updater (Modal)...');

    // Status Listener
    window.electronAPI.onUpdateStatus((data) => {
      console.log('Update Status:', data);
      this.updateModal.style.display = 'flex'; // Show modal
      this.updateModalMessage.innerText = data.message;
      this.updateModalTitle.innerText = "Software Update";

      if (data.status === 'checking') {
        this.updateSpinner.classList.remove('hidden');
        this.updateProgressContainer.classList.add('hidden');
        this.updateProgressText.classList.add('hidden');
        this.btnDownloadUpdate.classList.add('hidden');
        this.btnRestartUpdate.classList.add('hidden');
        this.btnCloseUpdate.classList.remove('hidden');
        this.updateNewVersion.classList.add('hidden');
      }
      else if (data.status === 'available') {
        this.updateSpinner.classList.add('hidden');
        this.updateNewVersion.innerText = `New Version: ${data.version}`;
        this.updateNewVersion.classList.remove('hidden');
        this.btnDownloadUpdate.classList.remove('hidden');
        this.btnCloseUpdate.classList.remove('hidden');
      }
      else if (data.status === 'not-available') {
        this.updateSpinner.classList.add('hidden');
        // Auto close after 3s
        setTimeout(() => {
          this.updateModal.style.display = 'none';
        }, 3000);
      }
      else if (data.status === 'downloaded') {
        this.updateSpinner.classList.add('hidden');
        this.updateProgressContainer.classList.add('hidden');
        this.updateProgressText.classList.add('hidden');
        this.btnCloseUpdate.classList.remove('hidden');
        this.btnDownloadUpdate.classList.add('hidden');
        this.btnRestartUpdate.classList.remove('hidden'); // Show Restart
      }
      else if (data.status === 'error') {
        this.updateSpinner.classList.add('hidden');
      }
    });

    // Progress Listener
    window.electronAPI.onDownloadProgress((data) => {
      console.log('Download Progress:', data);
      this.updateSpinner.classList.add('hidden');
      this.updateProgressContainer.classList.remove('hidden');
      this.updateProgressText.classList.remove('hidden');

      const percent = Math.round(data.percent);
      if (this.updateProgressFill) this.updateProgressFill.style.width = `${percent}%`;
      this.updateProgressText.innerText = `${percent}%`;
      this.updateModalMessage.innerText = `Downloading Update...`;
    });
  }

  async addMockupToCategory(category, droppedFilePath = null) {
    let filePath = droppedFilePath;

    if (!filePath) {
      const file = await window.electronAPI.selectMockupFile();
      if (file && file.path) filePath = file.path;
    }

    if (filePath) {
      const result = await window.electronAPI.addLibraryMockup({
        filePath: filePath,
        category: category
      });

      if (result) {
        this.loadLibraryData();
      }
    }
  }

}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  window.mockupApp = new RapidMockStudio();
});
