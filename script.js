// RecymDemo - Industrial AR Experience
// JavaScript para funcionalidad de Realidad Aumentada

class ARExperience {
    constructor() {
        this.modelViewer = null;
        this.currentModel = 'rack3.glb';
        this.isARSupported = false;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.modelViewer = document.getElementById('model-viewer');
        this.setupEventListeners();
        this.setupARButton();
        this.setupFooterLink();
        this.setupModelSelector();
        this.setupQuoteButton();
        
        // Check AR support immediately for mobile devices
        this.checkARSupport();
        
        console.log('🚀 RecymDemo AR Experience initialized');
    }

    setupEventListeners() {
        // Eventos del modelo viewer
        this.modelViewer.addEventListener('load', () => {
            console.log('✅ Model loaded successfully');
            this.isLoading = false;
            this.hideLoading();
        });

        this.modelViewer.addEventListener('error', (event) => {
            console.error('❌ Model loading error:', event.detail);
            this.isLoading = false;
            this.showError();
        });

        this.modelViewer.addEventListener('progress', (event) => {
            const progress = event.detail.totalProgress;
            this.updateProgress(progress);
            console.log(`📊 Loading progress: ${Math.round(progress * 100)}%`);
        });

        // Eventos de AR
        this.modelViewer.addEventListener('ar-status', (event) => {
            console.log('🔍 AR Status:', event.detail.status);
            this.handleARStatus(event.detail.status);
            this.handleQuoteButtonVisibility(event.detail.status);
        });

        // Evento adicional para cuando se sale de AR
        this.modelViewer.addEventListener('exit-ar', () => {
            console.log('🚪 Exiting AR - hiding quote button');
            this.hideQuoteButton();
        });

        // Eventos de cámara
        this.modelViewer.addEventListener('camera-change', () => {
            console.log('📷 Camera position changed');
        });
    }

    setupModelSelector() {
        // Ya no hay selector de modelos, solo un modelo por defecto
        console.log('📱 Using default model: rack3.glb');
    }

    setupFooterLink() {
        const footerLink = document.querySelector('.footer-link');
        if (footerLink) {
            footerLink.addEventListener('click', () => {
                window.open('https://lat-ar.com', '_blank', 'noopener,noreferrer');
            });
        }
    }

    setupQuoteButton() {
        const quoteButton = document.getElementById('quote-button');
        const quoteContainer = document.getElementById('quote-button-container');
        
        if (quoteButton) {
            quoteButton.addEventListener('click', () => {
                this.handleQuoteRequest();
            });
        }
        
        // Asegurar que el botón esté oculto inicialmente
        if (quoteContainer) {
            quoteContainer.style.display = 'none';
            quoteContainer.classList.remove('visible');
            console.log('🔒 Quote button hidden initially');
        }
    }

    setupARButton() {
        const arButton = document.getElementById('ar-button');
        
        arButton.addEventListener('click', () => {
            this.activateAR();
        });

        // Detectar si el botón AR está disponible
        this.modelViewer.addEventListener('ar-status', (event) => {
            if (event.detail.status === 'not-presenting') {
                arButton.style.display = this.isARSupported ? 'flex' : 'none';
            }
        });
    }

    async checkARSupport() {
        try {
            console.log('🔍 Checking AR support...');
            
            // Verificar soporte de WebXR (Desktop)
            if ('xr' in navigator) {
                try {
                    const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
                    this.isARSupported = isSupported;
                    console.log('🌐 WebXR AR Support:', isSupported);
                } catch (xrError) {
                    console.log('🌐 WebXR not available:', xrError);
                }
            }

            // Verificar soporte de Scene Viewer (Android)
            if (this.isSceneViewerSupported()) {
                this.isARSupported = true;
                console.log('📱 Scene Viewer Support: Available');
            }

            // Verificar soporte de Quick Look (iOS) - Mejorado
            if (this.isQuickLookSupported()) {
                this.isARSupported = true;
                console.log('🍎 Quick Look Support: Available');
            }

            // Fallback: Si no se detectó soporte, asumir que está disponible para móviles
            if (!this.isARSupported && this.isMobileDevice()) {
                this.isARSupported = true;
                console.log('📱 Mobile fallback: Assuming AR support');
            }

            this.updateARButtonVisibility();
            console.log('✅ AR Support check completed:', this.isARSupported);
        } catch (error) {
            console.warn('⚠️ AR Support check failed:', error);
            // En caso de error, asumir soporte para móviles
            if (this.isMobileDevice()) {
                this.isARSupported = true;
                console.log('📱 Error fallback: Assuming AR support for mobile');
            } else {
                this.isARSupported = false;
            }
            this.updateARButtonVisibility();
        }
    }

    isSceneViewerSupported() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('android') && userAgent.includes('chrome');
    }

    isQuickLookSupported() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
        
        if (!isIOS) return false;
        
        // Verificar versión de iOS (Quick Look requiere iOS 12+)
        const iosVersion = this.getIOSVersion();
        if (iosVersion && iosVersion < 12) {
            console.log('🍎 iOS version too old for Quick Look:', iosVersion);
            return false;
        }
        
        // Verificar si es Safari o WebKit
        const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
        const isWebKit = userAgent.includes('webkit');
        
        console.log('🍎 iOS detected:', isIOS, 'Safari:', isSafari, 'WebKit:', isWebKit, 'iOS Version:', iosVersion);
        return isIOS && (isSafari || isWebKit);
    }

    getIOSVersion() {
        const userAgent = navigator.userAgent.toLowerCase();
        const match = userAgent.match(/os (\d+)_/);
        return match ? parseInt(match[1], 10) : null;
    }

    isMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }

    // Método simplificado - ya no se necesita cambiar modelos
    switchModel(modelPath) {
        console.log(`🔄 Model switching disabled - using default: ${this.currentModel}`);
    }

    activateAR() {
        console.log('🚀 Attempting to activate AR...');
        console.log('📱 Device info:', this.getDeviceInfo());
        console.log('🔍 AR Support status:', this.isARSupported);
        
        // Para móviles, intentar activar AR directamente
        if (this.isMobileDevice()) {
            console.log('📱 Mobile device detected, attempting AR activation');
            try {
                this.modelViewer.activateAR();
                return;
            } catch (error) {
                console.error('❌ Mobile AR activation failed:', error);
                // No mostrar error inmediatamente, puede ser un problema temporal
            }
        }
        
        // Para desktop o si falló en móvil
        if (!this.isARSupported) {
            this.showARNotSupported();
            return;
        }

        console.log('🚀 Activating AR experience');
        
        // Intentar activar AR
        try {
            this.modelViewer.activateAR();
        } catch (error) {
            console.error('❌ AR activation failed:', error);
            this.showARError();
        }
    }

    handleARStatus(status) {
        const arButton = document.getElementById('ar-button');
        
        switch (status) {
            case 'not-presenting':
                arButton.innerHTML = `
                    <svg class="ar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    <span>Ver en tu espacio</span>
                `;
                break;
                
            case 'presenting':
                arButton.innerHTML = `
                    <svg class="ar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18"/>
                        <path d="M6 6l12 12"/>
                    </svg>
                    <span>Salir de AR</span>
                `;
                break;
                
            case 'failed':
                console.error('❌ AR presentation failed');
                this.showARError();
                break;
        }
    }

    handleQuoteButtonVisibility(status) {
        const quoteContainer = document.getElementById('quote-button-container');
        if (!quoteContainer) return;

        // Solo mostrar en Android cuando está en AR
        const isAndroid = this.isAndroidDevice();
        const isInAR = status === 'presenting';
        
        console.log('📱 Quote button visibility check:', {
            isAndroid,
            isInAR,
            status,
            userAgent: navigator.userAgent
        });

        if (isAndroid && isInAR) {
            quoteContainer.style.display = 'block';
            quoteContainer.classList.add('visible');
            console.log('✅ Quote button shown for Android AR');
        } else {
            quoteContainer.style.display = 'none';
            quoteContainer.classList.remove('visible');
            console.log('❌ Quote button hidden - Conditions not met');
        }
    }

    isAndroidDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('android');
    }

    hideQuoteButton() {
        const quoteContainer = document.getElementById('quote-button-container');
        if (quoteContainer) {
            quoteContainer.style.display = 'none';
            quoteContainer.classList.remove('visible');
            console.log('🔒 Quote button hidden');
        }
    }

    handleQuoteRequest() {
        console.log('💬 Quote request initiated');
        
        // Mensaje personalizado para WhatsApp
        const message = encodeURIComponent(
            `Hola! Me interesa cotizar esta pieza industrial que vi en AR. ` +
            `¿Podrían enviarme información sobre precios y especificaciones?`
        );
        
        // URL de WhatsApp
        const whatsappUrl = `https://wa.link/my0crk?text=${message}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        // Mostrar notificación de confirmación
        this.showNotification('Redirigiendo a WhatsApp...', 'info');
    }

    updateARButtonVisibility() {
        const arButton = document.getElementById('ar-button');
        arButton.style.display = this.isARSupported ? 'flex' : 'none';
        
        if (!this.isARSupported) {
            this.showARNotSupported();
        }
    }

    showLoading() {
        const loading = this.modelViewer.querySelector('.loading');
        if (loading) {
            loading.style.display = 'block';
            this.resetProgress();
        }
    }

    hideLoading() {
        const loading = this.modelViewer.querySelector('.loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    updateProgress(progress) {
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');
        const loadingText = document.getElementById('loading-text');

        if (progressFill && progressPercentage) {
            const percentage = Math.round(progress * 100);
            progressFill.style.width = `${percentage}%`;
            progressPercentage.textContent = `${percentage}%`;

            // Actualizar estado según progreso
            if (progressStatus) {
                if (percentage < 30) {
                    progressStatus.textContent = 'Descargando modelo...';
                } else if (percentage < 70) {
                    progressStatus.textContent = 'Procesando geometría...';
                } else if (percentage < 90) {
                    progressStatus.textContent = 'Aplicando texturas...';
                } else {
                    progressStatus.textContent = 'Finalizando...';
                }
            }

            // Actualizar texto principal
            if (loadingText) {
                if (percentage < 50) {
                    loadingText.textContent = 'Cargando modelo 3D...';
                } else {
                    loadingText.textContent = 'Preparando experiencia AR...';
                }
            }
        }
    }

    resetProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');
        const loadingText = document.getElementById('loading-text');

        if (progressFill) progressFill.style.width = '0%';
        if (progressPercentage) progressPercentage.textContent = '0%';
        if (progressStatus) progressStatus.textContent = 'Iniciando carga...';
        if (loadingText) loadingText.textContent = 'Cargando modelo 3D...';
    }

    showError() {
        const error = this.modelViewer.querySelector('.error');
        if (error) {
            error.style.display = 'block';
        }
    }

    showARNotSupported() {
        const arButton = document.getElementById('ar-button');
        arButton.innerHTML = `
            <svg class="ar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
            <span>AR no disponible</span>
        `;
        arButton.style.opacity = '0.6';
        arButton.style.cursor = 'not-allowed';
    }

    showARError() {
        // Crear notificación de error
        this.showNotification('Error al activar AR. Intenta de nuevo.', 'error');
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#ff4444' : '#00d4ff',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out',
            maxWidth: '300px',
            fontSize: '0.875rem',
            fontWeight: '500'
        });
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Métodos de utilidad
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isAndroid: /Android/.test(navigator.userAgent)
        };
    }

    logDeviceInfo() {
        const deviceInfo = this.getDeviceInfo();
        console.log('📱 Device Info:', deviceInfo);
    }
}

// Inicializar la experiencia AR cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const arExperience = new ARExperience();
    
    // Hacer disponible globalmente para debugging
    window.arExperience = arExperience;
    
    // Log de información del dispositivo
    arExperience.logDeviceInfo();
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered successfully:', registration.scope);
            
            // Verificar actualizaciones
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Nueva versión disponible
                        showUpdateNotification();
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    });
}

// Función para mostrar notificación de actualización
function showUpdateNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('RecymDemo actualizado', {
            body: 'Una nueva versión está disponible. Recarga la página para obtener las últimas mejoras.',
            icon: '/Assets/visor.webp',
            tag: 'update-notification'
        });
    }
}

// Solicitar permisos de notificación
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
        }
    }
}

// Optimizaciones de rendimiento
const optimizePerformance = () => {
    // Preload del modelo principal
    const model = 'Assets/rack3.glb';
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = model;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    // Optimizar animaciones para mejor rendimiento
    const style = document.createElement('style');
    style.textContent = `
        * {
            will-change: auto;
        }
        .ar-button, .model-container {
            will-change: transform;
        }
    `;
    document.head.appendChild(style);
    
    console.log('🚀 Performance optimizations applied');
};

// Ejecutar optimizaciones
optimizePerformance();
