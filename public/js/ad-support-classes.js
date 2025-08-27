// A/B Testing Class
class ABTesting {
    constructor() {
        this.variant = null;
        this.testId = null;
    }

    initialize() {
        this.testId = this.getOrCreateTestId();
        this.variant = this.getOrAssignVariant();
    }

    getOrCreateTestId() {
        let testId = sessionStorage.getItem('abTestId');
        if (!testId) {
            testId = 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('abTestId', testId);
        }
        return testId;
    }

    getOrAssignVariant() {
        let variant = sessionStorage.getItem('abTestVariant');
        if (!variant) {
            const variants = window.AdvertisementConfig?.AB_TEST_VARIANTS || ['A', 'B'];
            variant = variants[Math.floor(Math.random() * variants.length)];
            sessionStorage.setItem('abTestVariant', variant);
        }
        return variant;
    }

    getCurrentVariant() {
        return this.variant;
    }
}

// Targeting Class
class AdvertisementTargeting {
    shouldShowAd() {
        const config = window.AdvertisementConfig;
        if (!config?.ENABLE_TARGETING) return true;

        // Check device type
        const deviceType = this.getDeviceType();
        if (!config.TARGETING_RULES.DEVICE_TYPE.includes(deviceType)) {
            return false;
        }

        // Check browser
        const browser = this.getBrowser();
        if (!config.TARGETING_RULES.BROWSER.includes(browser)) {
            return false;
        }

        // Check time of day
        const timeOfDay = this.getTimeOfDay();
        if (!config.TARGETING_RULES.TIME_OF_DAY.includes(timeOfDay)) {
            return false;
        }

        // Check day of week
        const dayOfWeek = this.getDayOfWeek();
        if (!config.TARGETING_RULES.DAY_OF_WEEK.includes(dayOfWeek)) {
            return false;
        }

        return true;
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
}

// Personalization Class
class AdvertisementPersonalization {
    initialize(advertisement) {
        if (!window.AdvertisementConfig?.ENABLE_PERSONALIZATION) return;
        
        // Store user behavior
        this.trackBehavior(advertisement);
        
        // Update interests based on ad interaction
        this.updateInterests(advertisement);
    }

    isPersonalized() {
        const interests = this.getStoredInterests();
        return interests.length > 0;
    }

    trackBehavior(advertisement) {
        const behavior = this.getStoredBehavior();
        behavior.lastAdCategory = advertisement.category || 'general';
        behavior.lastAdInteraction = Date.now();
        behavior.totalAdsViewed = (behavior.totalAdsViewed || 0) + 1;
        
        localStorage.setItem('userBehavior', JSON.stringify(behavior));
    }

    updateInterests(advertisement) {
        const interests = this.getStoredInterests();
        const category = advertisement.category || 'general';
        
        if (!interests.includes(category)) {
            interests.push(category);
            localStorage.setItem('userInterests', JSON.stringify(interests));
        }
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
}

// Analytics Class
class AdvertisementAnalytics {
    initialize(advertisement) {
        this.advertisement = advertisement;
        this.startTime = Date.now();
        this.engagementTime = 0;
    }

    trackImpression(advertisement) {
        this.sendAnalytics('impression', advertisement);
    }

    trackClick(advertisement) {
        this.sendAnalytics('click', advertisement);
    }

    trackSkip(advertisement) {
        this.sendAnalytics('skip', advertisement);
    }

    trackCompletion(advertisement) {
        this.sendAnalytics('completion', advertisement);
    }

    trackEngagement(advertisement, time) {
        this.engagementTime += time;
        this.sendAnalytics('engagement', advertisement, { engagementTime: this.engagementTime });
    }

    sendAnalytics(action, advertisement, additionalData = {}) {
        const endpoint = window.AdvertisementConfig?.API_ENDPOINTS?.ANALYTICS || '/api/advertisements/analytics';
        
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                advertisement_id: advertisement.id,
                action: action,
                timestamp: Date.now(),
                user_agent: navigator.userAgent,
                referrer: document.referrer,
                ...additionalData
            })
        }).catch(error => {
            console.error('Error sending analytics:', error);
        });
    }
}

// Frequency Capping Class
class FrequencyCapping {
    constructor() {
        this.config = window.AdvertisementConfig?.FREQUENCY_CAPPING || {
            DAILY_LIMIT: 5,
            WEEKLY_LIMIT: 20,
            MONTHLY_LIMIT: 50
        };
    }

    canShowAd() {
        if (!window.AdvertisementConfig?.ENABLE_FREQUENCY_CAPPING) return true;

        const dailyCount = this.getDailyCount();
        const weeklyCount = this.getWeeklyCount();
        const monthlyCount = this.getMonthlyCount();

        return dailyCount < this.config.DAILY_LIMIT &&
               weeklyCount < this.config.WEEKLY_LIMIT &&
               monthlyCount < this.config.MONTHLY_LIMIT;
    }

    recordImpression() {
        const now = Date.now();
        const impressions = this.getStoredImpressions();
        
        impressions.push(now);
        
        // Clean old impressions
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        const filteredImpressions = impressions.filter(timestamp => timestamp > oneMonthAgo);
        
        localStorage.setItem('adImpressions', JSON.stringify(filteredImpressions));
    }

    getDailyCount() {
        const impressions = this.getStoredImpressions();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return impressions.filter(timestamp => timestamp > oneDayAgo).length;
    }

    getWeeklyCount() {
        const impressions = this.getStoredImpressions();
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return impressions.filter(timestamp => timestamp > oneWeekAgo).length;
    }

    getMonthlyCount() {
        const impressions = this.getStoredImpressions();
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return impressions.filter(timestamp => timestamp > oneMonthAgo).length;
    }

    getStoredImpressions() {
        try {
            return JSON.parse(localStorage.getItem('adImpressions') || '[]');
        } catch {
            return [];
        }
    }
}
