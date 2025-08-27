// Advanced Advertisement System
class AdvancedAdvertisementManager {
    constructor() {
        this.advertisement = null;
        this.countdown = window.AdvertisementConfig?.COUNTDOWN_DURATION || 60;
        this.canSkip = false;
        this.countdownInterval = null;
        this.advertisementShown = false;
        this.lastAdTime = null;
        this.displayInterval = window.AdvertisementConfig?.DISPLAY_INTERVAL || 30 * 60 * 1000;
        this.userProfile = this.getUserProfile();
        this.analytics = new AdvertisementAnalytics();
        this.targeting = new AdvertisementTargeting();
        this.personalization = new AdvertisementPersonalization();
        this.abTesting = new ABTesting();
        this.frequencyCapping = new FrequencyCapping();
        this.init();
    }

    async init() {
        // Add custom CSS for video controls
        this.addCustomStyles();
        
        // Check frequency capping first
        if (!this.frequencyCapping.canShowAd()) {
            console.log('Ad blocked by frequency capping');
            return;
        }

        // Check targeting
        if (!this.targeting.shouldShowAd()) {
            console.log('Ad blocked by targeting rules');
            return;
        }

        // Check if advertisement should be shown based on interval
        this.checkAndShowAdvertisement();
        
        // Set up periodic check
        setInterval(() => {
            this.checkAndShowAdvertisement();
        }, this.displayInterval);
    }

    addCustomStyles() {
        if (document.getElementById('advanced-ad-video-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'advanced-ad-video-styles';
        style.textContent = `
            #ad-video {
                border-radius: 8px;
            }
            
            #volume-slider {
                -webkit-appearance: none;
                appearance: none;
                height: 6px;
                border-radius: 3px;
                background: rgba(255, 255, 255, 0.3);
                outline: none;
                transition: background 0.2s;
            }
            
            #volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            #volume-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            #volume-btn, #play-pause-btn, #fullscreen-btn {
                background: rgba(0, 0, 0, 0.5);
                border: none;
                border-radius: 4px;
                padding: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            #volume-btn:hover, #play-pause-btn:hover, #fullscreen-btn:hover {
                background: rgba(0, 0, 0, 0.7);
                transform: scale(1.05);
            }
            
            .video-controls-overlay {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            #ad-video:hover + .video-controls-overlay,
            .video-controls-overlay:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    getUserProfile() {
        const profile = {
            deviceType: this.getDeviceType(),
            browser: this.getBrowser(),
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: this.getDayOfWeek(),
            interests: this.getStoredInterests(),
            behavior: this.getStoredBehavior(),
            preferences: this.getStoredPreferences()
        };
        return profile;
    }

    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
            return /iPad/.test(userAgent) ? 'tablet' : 'mobile';
        }
        return 'desktop';
    }

    getBrowser() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'chrome';
        if (userAgent.includes('Firefox')) return 'firefox';
        if (userAgent.includes('Safari')) return 'safari';
        if (userAgent.includes('Edge')) return 'edge';
        return 'unknown';
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    getDayOfWeek() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date().getDay()];
    }

    getStoredInterests() {
        try {
            return JSON.parse(localStorage.getItem('userInterests') || '[]');
        } catch {
            return [];
        }
    }

    getStoredBehavior() {
        try {
            return JSON.parse(localStorage.getItem('userBehavior') || '{}');
        } catch {
            return {};
        }
    }

    getStoredPreferences() {
        try {
            return JSON.parse(localStorage.getItem('adPreferences') || '{}');
        } catch {
            return {};
        }
    }

    checkAndShowAdvertisement() {
        const now = Date.now();
        const lastAdTime = sessionStorage.getItem(window.AdvertisementConfig?.LAST_AD_TIME_KEY || 'lastAdTime');
        
        if (!lastAdTime || (now - parseInt(lastAdTime)) >= this.displayInterval) {
            this.fetchAndShowAdvertisement();
        }
    }

    async fetchAndShowAdvertisement() {
        try {
            const endpoint = window.AdvertisementConfig?.API_ENDPOINTS?.ACTIVE_AD || '/api/advertisements/active';
            const response = await fetch(endpoint, {
                headers: {
                    'X-User-Profile': JSON.stringify(this.userProfile),
                    'X-AB-Test-Variant': this.abTesting.getCurrentVariant()
                }
            });
            const data = await response.json();
            
            if (data.success && data.advertisement) {
                this.advertisement = data.advertisement;
                this.showAdvertisement();
            }
        } catch (error) {
            console.error('Error fetching advertisement:', error);
        }
    }

    showAdvertisement() {
        // Create advertisement overlay with advanced features
        const overlay = document.createElement('div');
        overlay.id = 'advertisement-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center';
        
        overlay.innerHTML = this.generateAdvancedAdHTML();
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Initialize advanced features
        this.initializeAdvancedFeatures();
        
        // Start countdown
        this.startCountdown();
        
        // Add event listeners
        this.addAdvancedEventListeners();
        
        // Track impression
        this.analytics.trackImpression(this.advertisement);
        
        // Mark as shown and record time
        this.advertisementShown = true;
        sessionStorage.setItem(window.AdvertisementConfig?.LAST_AD_TIME_KEY || 'lastAdTime', Date.now().toString());
        
        // Update frequency capping
        this.frequencyCapping.recordImpression();
    }

    generateAdvancedAdHTML() {
        const config = window.AdvertisementConfig;
        const isVideo = this.advertisement.video_url;
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 relative overflow-hidden">
                <!-- Advanced Controls -->
                <div class="absolute top-2 right-2 flex gap-2 z-20">
                    <button id="volume-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    ${isVideo ? `
                        <button id="fullscreen-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg">
                            <i class="fas fa-expand"></i>
                        </button>
                    ` : ''}
                    <button id="close-ad-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold opacity-0 transition-opacity duration-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Countdown timer -->
                <div id="countdown-timer" class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    <span id="countdown-text">${this.countdown}</span>s
                </div>
                
                <!-- Progress bar for videos -->
                ${isVideo && config?.SHOW_PROGRESS_BAR ? `
                    <div class="absolute bottom-0 left-0 w-full h-1 bg-gray-300 z-10">
                        <div id="progress-bar" class="h-full bg-blue-500 transition-all duration-300" style="width: 0%"></div>
                    </div>
                ` : ''}
                
                <!-- Advertisement content -->
                <div class="relative">
                    ${isVideo ? this.generateVideoHTML() : this.generateImageHTML()}
                    
                    <!-- Overlay for click tracking -->
                    <div class="absolute inset-0 cursor-pointer" id="ad-click-area"></div>
                </div>
                
                <!-- Advertisement text -->
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${this.advertisement.title}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${this.advertisement.description}</p>
                    
                    <!-- Personalization indicator -->
                    ${this.personalization.isPersonalized() ? `
                        <div class="mb-3 text-xs text-blue-600 dark:text-blue-400">
                            <i class="fas fa-user-check mr-1"></i>Personalized for you
                        </div>
                    ` : ''}
                    
                    <!-- Skip button (initially disabled) -->
                    <div class="flex justify-between items-center">
                        <button id="skip-ad-btn" class="bg-gray-300 text-gray-500 px-6 py-2 rounded-md font-semibold cursor-not-allowed transition-all duration-300" disabled>
                            Skip Ad (<span id="skip-countdown">${this.countdown - 5}</span>s)
                        </button>
                        
                        ${this.advertisement.link_url ? `
                            <a href="${this.advertisement.link_url}" target="_blank" class="bg-primary-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-primary-700 transition-all duration-300">
                                Learn More
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    generateVideoHTML() {
        const config = window.AdvertisementConfig;
        return `
            <div class="relative">
            <video id="ad-video" class="w-full h-64 object-cover" 
                   controls 
                   ${config?.VIDEO_AUTOPLAY ? 'autoplay' : ''} 
                   ${config?.VIDEO_MUTED ? 'muted' : ''} 
                   preload="${config?.VIDEO_PRELOAD || 'metadata'}">
                <source src="${this.advertisement.video_url}" type="video/mp4">
                <source src="${this.advertisement.video_url}" type="video/webm">
                <source src="${this.advertisement.video_url}" type="video/ogg">
                Your browser does not support the video tag.
            </video>
                
                <!-- Enhanced Video Controls Overlay -->
                <div class="video-controls-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div class="flex items-center justify-between text-white">
                        <!-- Volume Control -->
                        <div class="flex items-center space-x-2">
                            <button id="volume-btn" class="text-white hover:text-gray-300 transition-colors" title="Toggle Mute">
                                <i class="fas fa-volume-up text-lg"></i>
                            </button>
                            <div class="relative">
                                <input type="range" id="volume-slider" min="0" max="100" value="100" 
                                       class="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                       title="Volume Control">
                            </div>
                        </div>
                        
                        <!-- Play/Pause Button -->
                        <button id="play-pause-btn" class="text-white hover:text-gray-300 transition-colors" title="Play/Pause">
                            <i class="fas fa-pause text-lg"></i>
                        </button>
                        
                        <!-- Fullscreen Button -->
                        <button id="fullscreen-btn" class="text-white hover:text-gray-300 transition-colors" title="Fullscreen">
                            <i class="fas fa-expand text-lg"></i>
                        </button>
                    </div>
                </div>
                
            <div class="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                <i class="fas fa-play mr-1"></i>Video Advertisement
                </div>
            </div>
        `;
    }

    generateImageHTML() {
        return `
            <img src="${this.advertisement.image_url}" alt="${this.advertisement.title}" class="w-full h-64 object-cover">
            <div class="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                <i class="fas fa-image mr-1"></i>Image Advertisement
            </div>
        `;
    }

    initializeAdvancedFeatures() {
        // Initialize A/B testing
        this.abTesting.initialize();
        
        // Initialize personalization
        this.personalization.initialize(this.advertisement);
        
        // Initialize analytics
        this.analytics.initialize(this.advertisement);
    }

    addAdvancedEventListeners() {
        // Volume control
        const volumeBtn = document.getElementById('volume-btn');
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => this.toggleVolume());
        }

        // Fullscreen control
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Skip button
        const skipBtn = document.getElementById('skip-ad-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                if (this.canSkip) {
                    this.analytics.trackSkip(this.advertisement);
                    this.closeAdvertisement();
                }
            });
        }

        // Close button
        const closeBtn = document.getElementById('close-ad-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (this.canSkip) {
                    this.closeAdvertisement();
                }
            });
        }

        // Click area for tracking
        const clickArea = document.getElementById('ad-click-area');
        if (clickArea && this.advertisement.link_url) {
            clickArea.addEventListener('click', () => {
                this.analytics.trackClick(this.advertisement);
                window.open(this.advertisement.link_url, '_blank');
                this.closeAdvertisement();
            });
        }

        // Video event listeners
        if (this.advertisement.video_url) {
            this.addAdvancedVideoEventListeners();
        }

        // Keyboard navigation
        if (window.AdvertisementConfig?.ACCESSIBILITY?.ENABLE_KEYBOARD_NAVIGATION) {
            this.addKeyboardEventListeners();
        }
    }

    addAdvancedVideoEventListeners() {
        const video = document.getElementById('ad-video');
        if (!video) return;

        // Initialize video with sound enabled
        video.volume = 1.0;
        video.muted = false;

        // Progress tracking
        video.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

            // Enable skip after 50% for videos
            if (progress >= 50 && !this.canSkip) {
                this.enableSkip();
            }
        });

        // Volume control
        video.addEventListener('volumechange', () => {
            this.updateVolumeButton(video.muted);
        });

        // Fullscreen events
        video.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButton();
        });

        // Auto-close when video ends
        video.addEventListener('ended', () => {
            this.analytics.trackCompletion(this.advertisement);
            this.closeAdvertisement();
        });

        // Track engagement
        let engagementStart = Date.now();
        video.addEventListener('play', () => {
            engagementStart = Date.now();
            this.updatePlayPauseButton(true);
        });

        video.addEventListener('pause', () => {
            const engagementTime = Date.now() - engagementStart;
            this.analytics.trackEngagement(this.advertisement, engagementTime);
            this.updatePlayPauseButton(false);
        });

        // Add custom control event listeners
        this.addCustomAdvancedVideoControls(video);
    }

    addCustomAdvancedVideoControls(video) {
        // Volume button
        const volumeBtn = document.getElementById('volume-btn');
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                video.muted = !video.muted;
                this.updateVolumeButton(video.muted);
            });
        }

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                video.volume = volume;
                video.muted = volume === 0;
                this.updateVolumeButton(video.muted);
            });
        }

        // Play/Pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    video.requestFullscreen();
                }
            });
        }

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target === video || e.target.closest('#advertisement-overlay')) {
                switch (e.key) {
                    case ' ':
                        e.preventDefault();
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        video.currentTime += 10;
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        video.currentTime -= 10;
                        break;
                    case 'm':
                    case 'M':
                        e.preventDefault();
                        video.muted = !video.muted;
                        this.updateVolumeButton(video.muted);
                        break;
                    case 'f':
                    case 'F':
                        e.preventDefault();
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        } else {
                            video.requestFullscreen();
                        }
                        break;
                    case '0':
                        e.preventDefault();
                        video.currentTime = 0;
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        e.preventDefault();
                        const percentage = parseInt(e.key) * 10;
                        video.currentTime = (video.duration * percentage) / 100;
                        break;
                }
            }
        });
    }

    addKeyboardEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Escape':
                    if (this.canSkip) {
                        e.preventDefault();
                        this.closeAdvertisement();
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    const video = document.getElementById('ad-video');
                    if (video) {
                        video.paused ? video.play() : video.pause();
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    const videoRight = document.getElementById('ad-video');
                    if (videoRight) {
                        videoRight.currentTime += 10;
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    const videoLeft = document.getElementById('ad-video');
                    if (videoLeft) {
                        videoLeft.currentTime -= 10;
                    }
                    break;
            }
        });
    }

    toggleVolume() {
        const video = document.getElementById('ad-video');
        if (video) {
            video.muted = !video.muted;
            this.updateVolumeButton(video.muted);
        }
    }

    updateVolumeButton(muted) {
        const volumeBtn = document.getElementById('volume-btn');
        if (volumeBtn) {
            volumeBtn.innerHTML = muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        }
    }

    updatePlayPauseButton(playing) {
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = playing ? 
                '<i class="fas fa-pause text-lg"></i>' : 
                '<i class="fas fa-play text-lg"></i>';
        }
    }

    toggleFullscreen() {
        const video = document.getElementById('ad-video');
        if (video) {
            if (!document.fullscreenElement) {
                video.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }

    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            const isFullscreen = !!document.fullscreenElement;
            fullscreenBtn.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        }
    }

    enableSkip() {
        this.canSkip = true;
        const skipBtn = document.getElementById('skip-ad-btn');
        const closeBtn = document.getElementById('close-ad-btn');
        
        if (skipBtn) {
            skipBtn.disabled = false;
            skipBtn.className = 'bg-red-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-600 transition-all duration-300';
        }
        if (closeBtn) {
            closeBtn.classList.remove('opacity-0');
        }
    }

    startCountdown() {
        let timeLeft = this.countdown;
        const countdownText = document.getElementById('countdown-text');
        const skipCountdown = document.getElementById('skip-countdown');
        
        this.countdownInterval = setInterval(() => {
            timeLeft--;
            
            // Update countdown displays
            if (countdownText) countdownText.textContent = timeLeft;
            if (skipCountdown) skipCountdown.textContent = Math.max(0, timeLeft - 5);
            
            // Enable skip after 5 seconds for images
            if (timeLeft <= 55 && !this.canSkip && !this.advertisement.video_url) {
                this.enableSkip();
            }
            
            // Auto-close when countdown reaches 0
            if (timeLeft <= 0) {
                this.closeAdvertisement();
            }
        }, 1000);
    }

    closeAdvertisement() {
        // Clear countdown interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Track completion
        this.analytics.trackCompletion(this.advertisement);
        
        // Remove overlay with animation
        const overlay = document.getElementById('advertisement-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
        
        // Track advertisement view
        this.trackAdvertisementView();
    }

    trackAdvertisementView() {
        console.log('Advertisement viewed:', this.advertisement.title);
        
        const endpoint = window.AdvertisementConfig?.API_ENDPOINTS?.TRACK_VIEW || '/api/advertisements/track-view';
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                advertisement_id: this.advertisement.id,
                action: 'view',
                user_profile: this.userProfile,
                ab_test_variant: this.abTesting.getCurrentVariant()
            })
        }).catch(error => {
            console.error('Error tracking advertisement view:', error);
        });
    }
}

// Initialize advanced advertisement manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        new AdvancedAdvertisementManager();
    }, 1000);
});
