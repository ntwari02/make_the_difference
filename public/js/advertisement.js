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
                                <!-- Progress Bar -->
                                <div class="mb-3">
                                    <div class="relative">
                                        <div class="w-full bg-gray-600 rounded-full h-2 cursor-pointer" id="progress-container">
                                            <div class="bg-red-500 h-2 rounded-full transition-all duration-150" id="progress-bar" style="width: 0%"></div>
                                            <div class="absolute top-0 h-2 w-2 bg-red-500 rounded-full transform -translate-y-1 cursor-pointer hover:scale-125 transition-transform duration-150" id="progress-handle" style="left: 0%"></div>
                                        </div>
                                    </div>
                                    <div class="flex justify-between text-white text-xs mt-1">
                                        <span id="current-time">0:00</span>
                                        <span id="total-time">0:00</span>
                                    </div>
                                </div>
                                
                                <!-- Main Controls -->
                                <div class="flex items-center justify-between text-white">
                                    <!-- Left Controls -->
                                    <div class="flex items-center space-x-3">
                                        <!-- Play/Pause Button -->
                                        <button id="play-pause-btn" class="text-white hover:text-gray-300 transition-colors" title="Play/Pause (Space)">
                                            <i class="fas fa-pause text-lg"></i>
                                        </button>
                                        
                                        <!-- Previous/Next Buttons -->
                                        <button id="prev-10-btn" class="text-white hover:text-gray-300 transition-colors" title="Rewind 10s (←)">
                                            <i class="fas fa-backward text-sm"></i>
                                        </button>
                                        <button id="next-10-btn" class="text-white hover:text-gray-300 transition-colors" title="Forward 10s (→)">
                                            <i class="fas fa-forward text-sm"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Center Controls -->
                                    <div class="flex items-center space-x-3">
                                        <!-- Playback Speed -->
                                        <div class="relative">
                                            <button id="speed-btn" class="text-white hover:text-gray-300 transition-colors text-sm" title="Playback Speed">
                                                1x
                                            </button>
                                            <div id="speed-menu" class="absolute bottom-full mb-2 bg-black bg-opacity-90 rounded-lg p-2 hidden">
                                                <div class="text-white text-sm space-y-1">
                                                    <div class="speed-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-speed="0.5">0.5x</div>
                                                    <div class="speed-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-speed="0.75">0.75x</div>
                                                    <div class="speed-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-speed="1">1x</div>
                                                    <div class="speed-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-speed="1.25">1.25x</div>
                                                    <div class="speed-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-speed="1.5">1.5x</div>
                                                    <div class="speed-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-speed="2">2x</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Quality Selector (if multiple sources) -->
                                        <div class="relative">
                                            <button id="quality-btn" class="text-white hover:text-gray-300 transition-colors text-sm" title="Video Quality">
                                                <i class="fas fa-cog text-sm"></i>
                                            </button>
                                            <div id="quality-menu" class="absolute bottom-full mb-2 bg-black bg-opacity-90 rounded-lg p-2 hidden">
                                                <div class="text-white text-sm space-y-1">
                                                    <div class="quality-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-quality="auto">Auto</div>
                                                    <div class="quality-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-quality="1080p">1080p</div>
                                                    <div class="quality-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-quality="720p">720p</div>
                                                    <div class="quality-option cursor-pointer hover:bg-gray-700 px-2 py-1 rounded" data-quality="480p">480p</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Right Controls -->
                                    <div class="flex items-center space-x-3">
                                    <!-- Volume Control -->
                                    <div class="flex items-center space-x-2">
                                            <button id="volume-btn" class="text-white hover:text-gray-300 transition-colors" title="Toggle Mute (M)">
                                            <i class="fas fa-volume-up text-lg"></i>
                                        </button>
                                        <div class="relative">
                                            <input type="range" id="volume-slider" min="0" max="100" value="100" 
                                                   class="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                                   title="Volume Control">
                                        </div>
                                    </div>
                                    
                                    <!-- Fullscreen Button -->
                                        <button id="fullscreen-btn" class="text-white hover:text-gray-300 transition-colors" title="Fullscreen (F)">
                                        <i class="fas fa-expand text-lg"></i>
                                    </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="absolute top-2 left-2 video-badge text-white px-2 py-1 rounded text-xs">
                                <i class="fas fa-play mr-1"></i>Video Advertisement
                            </div>
                        </div>
                    ` : `
                        <img src="${this.advertisement.image_url}" alt="${this.advertisement.title}" class="w-full h-64 object-cover">
                        <div class="absolute top-2 left-2 video-badge text-white px-2 py-1 rounded text-xs">
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

        // Prepare video for autoplay across browsers
        // Use inline playback (iOS Safari) and attempt autoplay with graceful fallbacks
        try { video.setAttribute('playsinline', ''); } catch {}
        // Start muted to satisfy autoplay policies; we'll unmute if the user interacts
        video.volume = 1.0;
        video.muted = true;

        // Pause countdown when video is paused
        video.addEventListener('pause', () => {
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
            }
            this.updatePlayPauseButton(false);
            
            // Show controls when paused
            const controlsOverlay = document.querySelector('.video-controls-overlay');
            if (controlsOverlay) {
                controlsOverlay.style.opacity = '1';
            }
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

        // Track video progress and update UI
        video.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            
            // Update progress bar
            const progressBar = document.getElementById('progress-bar');
            const progressHandle = document.getElementById('progress-handle');
            if (progressBar && progressHandle) {
                progressBar.style.width = `${progress}%`;
                progressHandle.style.left = `${progress}%`;
            }
            
            // Update time display
            const currentTimeEl = document.getElementById('current-time');
            const totalTimeEl = document.getElementById('total-time');
            if (currentTimeEl && totalTimeEl) {
                currentTimeEl.textContent = this.formatTime(video.currentTime);
                totalTimeEl.textContent = this.formatTime(video.duration);
            }
            
            // Enable skip after 50% of video
            if (progress >= 50 && !this.canSkip) {
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

        // Handle video metadata loaded
        video.addEventListener('loadedmetadata', () => {
            const totalTimeEl = document.getElementById('total-time');
            if (totalTimeEl) {
                totalTimeEl.textContent = this.formatTime(video.duration);
            }
        });

        // Show controls when video is loading
        video.addEventListener('loadstart', () => {
            const controlsOverlay = document.querySelector('.video-controls-overlay');
            if (controlsOverlay) {
                controlsOverlay.style.opacity = '1';
            }
        });

        // Handle video errors
        video.addEventListener('error', () => {
            const controlsOverlay = document.querySelector('.video-controls-overlay');
            if (controlsOverlay) {
                controlsOverlay.style.opacity = '1';
            }
            console.error('Video error:', video.error);
        });

        // Try autoplay with fallbacks (mute-first, then user gesture)
        const attemptAutoplay = async () => {
            try {
                await video.play();
                this.updatePlayPauseButton(true);
            } catch (err1) {
                // Ensure muted and retry
                try {
                    video.muted = true;
                    this.updateVolumeButton(true);
                    await video.play();
                    this.updatePlayPauseButton(true);
                } catch (err2) {
                    // Show overlay controls and wait for user to click play
                    const controlsOverlay = document.querySelector('.video-controls-overlay');
                    if (controlsOverlay) controlsOverlay.style.opacity = '1';
                    this.updatePlayPauseButton(false);
                }
            }
        };
        // Kick off autoplay once enough data is available
        if (video.readyState >= 2) {
            attemptAutoplay();
        } else {
            video.addEventListener('canplay', attemptAutoplay, { once: true });
        }

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

        // Previous/Next 10 seconds buttons
        const prev10Btn = document.getElementById('prev-10-btn');
        const next10Btn = document.getElementById('next-10-btn');
        
        if (prev10Btn) {
            prev10Btn.addEventListener('click', () => {
                video.currentTime = Math.max(0, video.currentTime - 10);
            });
        }
        
        if (next10Btn) {
            next10Btn.addEventListener('click', () => {
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
            });
        }

        // Progress bar seek functionality
        const progressContainer = document.getElementById('progress-container');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                video.currentTime = percentage * video.duration;
            });
        }

        // Playback speed control
        const speedBtn = document.getElementById('speed-btn');
        const speedMenu = document.getElementById('speed-menu');
        
        if (speedBtn && speedMenu) {
            speedBtn.addEventListener('click', () => {
                speedMenu.classList.toggle('hidden');
            });
            
            // Close speed menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!speedBtn.contains(e.target) && !speedMenu.contains(e.target)) {
                    speedMenu.classList.add('hidden');
                }
            });
            
            // Speed options
            const speedOptions = speedMenu.querySelectorAll('.speed-option');
            speedOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const speed = parseFloat(option.dataset.speed);
                    video.playbackRate = speed;
                    speedBtn.textContent = `${speed}x`;
                    speedMenu.classList.add('hidden');
                });
            });
        }

        // Quality selector
        const qualityBtn = document.getElementById('quality-btn');
        const qualityMenu = document.getElementById('quality-menu');
        
        if (qualityBtn && qualityMenu) {
            qualityBtn.addEventListener('click', () => {
                qualityMenu.classList.toggle('hidden');
            });
            
            // Close quality menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
                    qualityMenu.classList.add('hidden');
                }
            });
            
            // Quality options
            const qualityOptions = qualityMenu.querySelectorAll('.quality-option');
            qualityOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const quality = option.dataset.quality;
                    // For now, just update the button text
                    // In a real implementation, you'd switch video sources
                    qualityBtn.innerHTML = `<i class="fas fa-cog text-sm"></i> ${quality}`;
                    qualityMenu.classList.add('hidden');
                });
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
                    case 'ArrowUp':
                        e.preventDefault();
                        video.volume = Math.min(1, video.volume + 0.1);
                        if (volumeSlider) volumeSlider.value = video.volume * 100;
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        video.volume = Math.max(0, video.volume - 0.1);
                        if (volumeSlider) volumeSlider.value = video.volume * 100;
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
                        video.currentTime = (percentage / 100) * video.duration;
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

    formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
