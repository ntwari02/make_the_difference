class AdvertisementManager {
    constructor() {
        this.advertisement = null;
        this.countdown = window.AdvertisementConfig?.COUNTDOWN_DURATION || 60;
        this.canSkip = false;
        this.countdownInterval = null;
        this.advertisementShown = false;
        this.lastAdTime = null;
        const minI = window.AdvertisementConfig?.DISPLAY_MIN_INTERVAL || (5*60*1000);
        const maxI = window.AdvertisementConfig?.DISPLAY_MAX_INTERVAL || (20*60*1000);
        this.getNextInterval = () => Math.floor(minI + Math.random() * Math.max(0, (maxI - minI)));
        this.displayInterval = this.getNextInterval();
        this.init();
    }

    async     init() {
        // Add custom CSS for video controls
        this.addCustomStyles();
        
        // Kick off first schedule
        this.scheduleNext();
        // If user is logged in, show an ad immediately once per session
        try {
            const token = localStorage.getItem('token');
            const sessionFlagKey = 'adShownThisSession';
            const alreadyShown = sessionStorage.getItem(sessionFlagKey);
            if (token && !alreadyShown) {
                // Small delay to allow page/layout to settle
                setTimeout(() => {
                    this.fetchAndShowAdvertisement();
                    sessionStorage.setItem(sessionFlagKey, '1');
                }, 500);
            }
        } catch {}
    }

    addCustomStyles() {
        if (document.getElementById('ad-video-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ad-video-styles';
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

    checkAndShowAdvertisement() {
        const now = Date.now();
        const lastAdTime = sessionStorage.getItem(window.AdvertisementConfig?.LAST_AD_TIME_KEY || 'lastAdTime');
        
        // Show ad if it's been more than the configured interval since last ad
        if (!lastAdTime || (now - parseInt(lastAdTime)) >= this.displayInterval) {
            this.fetchAndShowAdvertisement();
        } else {
            this.scheduleNext();
        }
    }

    async fetchAndShowAdvertisement() {
        try {
            const endpoint = window.AdvertisementConfig?.API_ENDPOINTS?.RANDOM_AD || '/api/advertisements/random';
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data.success && data.advertisement) {
                this.advertisement = data.advertisement;
                this.showAdvertisement();
            } else {
                this.scheduleNext();
            }
        } catch (error) {
            console.error('Error fetching advertisement:', error);
            this.scheduleNext();
        }
    }

    showAdvertisement() {
        // Create advertisement overlay
        const overlay = document.createElement('div');
        overlay.id = 'advertisement-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center';
        
        overlay.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 relative overflow-hidden">
                <!-- Close button (initially hidden) -->
                <button id="close-ad-btn" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold opacity-0 transition-opacity duration-300 z-10">
                    <i class="fas fa-times"></i>
                </button>
                
                <!-- Countdown timer -->
                <div id="countdown-timer" class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    <span id="countdown-text">60</span>s
                </div>
                
                <!-- Advertisement content -->
                <div class="relative">
                    ${this.advertisement.video_url ? `
                        <div class="relative">
                            <video id="ad-video" class="w-full h-64 object-cover" controls autoplay preload="metadata">
                                <source src="${this.advertisement.video_url}" type="video/mp4">
                                <source src="${this.advertisement.video_url}" type="video/webm">
                                <source src="${this.advertisement.video_url}" type="video/ogg">
                                Your browser does not support the video tag.
                            </video>
                            
                            <!-- Custom Video Controls Overlay -->
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
                    ` : `
                        <img src="${this.advertisement.image_url}" alt="${this.advertisement.title}" class="w-full h-64 object-cover">
                        <div class="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            <i class="fas fa-image mr-1"></i>Image Advertisement
                        </div>
                    `}
                    
                    <!-- Overlay for click tracking -->
                    <div class="absolute inset-0 cursor-pointer" id="ad-click-area"></div>
                </div>
                
                <!-- Advertisement text -->
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${this.advertisement.title}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${this.advertisement.description}</p>
                    
                    <!-- Skip button (initially disabled) -->
                    <div class="flex justify-between items-center">
                        <button id="skip-ad-btn" class="bg-gray-300 text-gray-500 px-6 py-2 rounded-md font-semibold cursor-not-allowed transition-all duration-300" disabled>
                            Skip Ad (<span id="skip-countdown">55</span>s)
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

        // Add to body
        document.body.appendChild(overlay);
        
        // Start countdown
        this.startCountdown();
        
        // Add event listeners
        this.addEventListeners();
        
        // Add video event listeners if video exists
        if (this.advertisement.video_url) {
            this.addVideoEventListeners();
        }
        
        // Mark as shown and record time
        this.advertisementShown = true;
        sessionStorage.setItem(window.AdvertisementConfig?.LAST_AD_TIME_KEY || 'lastAdTime', Date.now().toString());
    }

    startCountdown() {
        let timeLeft = this.countdown;
        const countdownText = document.getElementById('countdown-text');
        const skipCountdown = document.getElementById('skip-countdown');
        const skipBtn = document.getElementById('skip-ad-btn');
        const closeBtn = document.getElementById('close-ad-btn');
        
        this.countdownInterval = setInterval(() => {
            timeLeft--;
            
            // Update countdown displays
            if (countdownText) countdownText.textContent = timeLeft;
            if (skipCountdown) skipCountdown.textContent = Math.max(0, timeLeft - 5);
            
            // Enable skip after 5 seconds
            if (timeLeft <= 55 && !this.canSkip) {
                this.canSkip = true;
                if (skipBtn) {
                    skipBtn.disabled = false;
                    skipBtn.className = 'bg-red-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-600 transition-all duration-300';
                }
                if (closeBtn) {
                    closeBtn.classList.remove('opacity-0');
                }
            }
            
            // Auto-close when countdown reaches 0
            if (timeLeft <= 0) {
                this.closeAdvertisement();
            }
        }, 1000);
    }

    addEventListeners() {
        // Skip button
        const skipBtn = document.getElementById('skip-ad-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                if (this.canSkip) {
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
                window.open(this.advertisement.link_url, '_blank');
                this.closeAdvertisement();
            });
        }
        
        // Prevent closing with escape key during first 5 seconds
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.canSkip) {
                e.preventDefault();
            }
        });
    }

    addVideoEventListeners() {
        const video = document.getElementById('ad-video');
        if (!video) return;

        // Initialize video with sound enabled
        video.volume = 1.0;
        video.muted = false;

        // Pause countdown when video is paused
        video.addEventListener('pause', () => {
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
            }
            this.updatePlayPauseButton(false);
        });

        // Resume countdown when video is played
        video.addEventListener('play', () => {
            if (!this.countdownInterval) {
                this.startCountdown();
            }
            this.updatePlayPauseButton(true);
        });

        // Auto-close when video ends
        video.addEventListener('ended', () => {
            this.closeAdvertisement();
        });

        // Track video progress
        video.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            if (progress >= 50 && !this.canSkip) { // Enable skip after 50% of video
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
        });

        // Add custom control event listeners
        this.addCustomVideoControls(video);
    }

    addCustomVideoControls(video) {
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

        // Keyboard shortcuts
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
                }
            }
        });
    }

    updateVolumeButton(muted) {
        const volumeBtn = document.getElementById('volume-btn');
        if (volumeBtn) {
            volumeBtn.innerHTML = muted ? 
                '<i class="fas fa-volume-mute text-lg"></i>' : 
                '<i class="fas fa-volume-up text-lg"></i>';
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

    closeAdvertisement() {
        // Clear countdown interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Remove overlay
        const overlay = document.getElementById('advertisement-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Track advertisement view
        this.trackAdvertisementView();
        // Reschedule next ad
        this.scheduleNext();
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
                action: 'view'
            })
        }).catch(error => {
            console.error('Error tracking advertisement view:', error);
        });
    }

    scheduleNext() {
        const t = this.getNextInterval();
        this.displayInterval = t;
        setTimeout(() => this.checkAndShowAdvertisement(), t);
    }
}

// Initialize advertisement manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        new AdvertisementManager();
    }, 1000);
});
