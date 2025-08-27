// Advertisement System Configuration
window.AdvertisementConfig = {
    // Timing settings
    DISPLAY_MIN_INTERVAL: 1 * 60 * 1000,   // 1 minute (minimum)
    DISPLAY_MAX_INTERVAL: 15 * 60 * 1000,  // 15 minutes (maximum)
    COUNTDOWN_DURATION: 60, // 60 seconds
    SKIP_DELAY_IMAGE: 5, // 5 seconds for images
    SKIP_DELAY_VIDEO_PERCENT: 50, // 50% of video duration
    
    // Session storage keys
    LAST_AD_TIME_KEY: 'lastAdTime',
    AD_PREFERENCES_KEY: 'adPreferences',
    AD_ANALYTICS_KEY: 'adAnalytics',
    
    // Video settings
    VIDEO_AUTOPLAY: true,
    VIDEO_MUTED: false, // Changed to false to enable sound by default
    VIDEO_CONTROLS: true,
    VIDEO_PRELOAD: 'metadata',
    
    // UI settings
    SHOW_VIDEO_BADGE: true,
    SHOW_IMAGE_BADGE: true,
    SHOW_PROGRESS_BAR: true,
    SHOW_VOLUME_CONTROL: true,
    SHOW_FULLSCREEN_BUTTON: true,
    
    // Advanced features
    ENABLE_AB_TESTING: true,
    ENABLE_TARGETING: true,
    ENABLE_ANALYTICS: true,
    ENABLE_PERSONALIZATION: true,
    ENABLE_FREQUENCY_CAPPING: true,
    ENABLE_GEO_TARGETING: false, // Requires IP geolocation service
    
    // A/B Testing settings
    AB_TEST_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
    AB_TEST_VARIANTS: ['A', 'B', 'C'],
    
    // Targeting settings
    TARGETING_RULES: {
        DEVICE_TYPE: ['desktop', 'mobile', 'tablet'],
        BROWSER: ['chrome', 'firefox', 'safari', 'edge'],
        TIME_OF_DAY: ['morning', 'afternoon', 'evening', 'night'],
        DAY_OF_WEEK: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    
    // Frequency capping
    FREQUENCY_CAPPING: {
        DAILY_LIMIT: 5,
        WEEKLY_LIMIT: 20,
        MONTHLY_LIMIT: 50
    },
    
    // Personalization settings
    PERSONALIZATION: {
        ENABLE_INTERESTS: true,
        ENABLE_BEHAVIOR_TRACKING: true,
        ENABLE_DEMOGRAPHICS: false
    },
    
    // Analytics settings
    ANALYTICS: {
        TRACK_VIEWS: true,
        TRACK_CLICKS: true,
        TRACK_SKIPS: true,
        TRACK_COMPLETIONS: true,
        TRACK_ENGAGEMENT_TIME: true,
        TRACK_BOUNCE_RATE: true
    },
    
    // API endpoints
    API_ENDPOINTS: {
        ACTIVE_AD: '/api/advertisements/active',
        RANDOM_AD: '/api/advertisements/random',
        TRACK_VIEW: '/api/advertisements/track-view',
        ANALYTICS: '/api/advertisements/analytics',
        PREFERENCES: '/api/advertisements/preferences',
        TARGETING: '/api/advertisements/targeting'
    },
    
    // Animation settings
    ANIMATIONS: {
        ENTRANCE: 'fadeIn',
        EXIT: 'fadeOut',
        DURATION: 300
    },
    
    // Accessibility settings
    ACCESSIBILITY: {
        ENABLE_KEYBOARD_NAVIGATION: true,
        ENABLE_SCREEN_READER: true,
        ENABLE_HIGH_CONTRAST: true,
        ENABLE_LARGE_TEXT: false
    }
};
