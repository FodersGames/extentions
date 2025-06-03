(function(Scratch) {
    'use strict';

    class SystemInfoExtension {
        constructor() {
            this.startTime = Date.now();
            this.clickCount = 0;
            this.mouseMovements = 0;
            this.lastKeys = [];
            this.scrollPosition = 0;
            this.geoData = null;
            this.connectionData = null;
            
            // Initialize event listeners
            this._initEventListeners();
            
            // Fetch geo data
            this._fetchGeoData();
            
            // Test connection
            this._testConnection();
        }

        getInfo() {
            return {
                id: 'systemInfo',
                name: 'System Info',
                color1: '#4A90E2',
                color2: '#357ABD',
                blocks: [
                    // 🌐 Navigateur & Système
                    {
                        opcode: 'getBrowserName',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'browser name'
                    },
                    {
                        opcode: 'getBrowserVersion',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'browser version'
                    },
                    {
                        opcode: 'getBrowserEngine',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'browser engine'
                    },
                    {
                        opcode: 'getOperatingSystem',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'operating system'
                    },
                    {
                        opcode: 'getLanguage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'browser language'
                    },
                    {
                        opcode: 'getTimezone',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'timezone'
                    },
                    {
                        opcode: 'getTimezoneOffset',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'timezone offset (minutes)'
                    },
                    {
                        opcode: 'getScreenResolution',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'screen resolution'
                    },
                    {
                        opcode: 'getScreenWidth',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'screen width'
                    },
                    {
                        opcode: 'getScreenHeight',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'screen height'
                    },
                    {
                        opcode: 'getWindowSize',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'window size'
                    },
                    {
                        opcode: 'hasTouchScreen',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'has touch screen?'
                    },
                    {
                        opcode: 'cookiesEnabled',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'cookies enabled?'
                    },
                    {
                        opcode: 'getDarkMode',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'dark mode preferred?'
                    },

                    // 🌍 Géographiques
                    {
                        opcode: 'getPublicIP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'public IP address'
                    },
                    {
                        opcode: 'getCountry',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'country'
                    },
                    {
                        opcode: 'getCity',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'city'
                    },
                    {
                        opcode: 'getPostalCode',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'postal code'
                    },
                    {
                        opcode: 'getISP',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'internet provider'
                    },
                    {
                        opcode: 'getConnectionType',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'connection type'
                    },

                    // ⏰ Temporelles
                    {
                        opcode: 'getCurrentDate',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'current date'
                    },
                    {
                        opcode: 'getCurrentTime',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'current time'
                    },
                    {
                        opcode: 'getDayOfWeek',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'day of week'
                    },
                    {
                        opcode: 'getTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'unix timestamp'
                    },
                    {
                        opcode: 'getUTCTime',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'UTC time'
                    },
                    {
                        opcode: 'getSeason',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'current season'
                    },
                    {
                        opcode: 'getWeekNumber',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'week number of year'
                    },

                    // 🎮 Scratch & Performance
                    {
                        opcode: 'getScratchVersion',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Scratch version'
                    },
                    {
                        opcode: 'getFPS',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'current FPS'
                    },
                    {
                        opcode: 'getRuntime',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'runtime (seconds)'
                    },
                    {
                        opcode: 'getMemoryUsage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'memory usage (MB)'
                    },
                    {
                        opcode: 'getSpriteCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'number of sprites'
                    },
                    {
                        opcode: 'getCostumeCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total costumes'
                    },
                    {
                        opcode: 'getSoundCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total sounds'
                    },
                    {
                        opcode: 'isTurboMode',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'turbo mode enabled?'
                    },

                    // 🔗 Réseau
                    {
                        opcode: 'getConnectionSpeed',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'connection speed (Mbps)'
                    },
                    {
                        opcode: 'getPing',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'ping (ms)'
                    },
                    {
                        opcode: 'getNetworkType',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'network type'
                    },
                    {
                        opcode: 'isOnline',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'online?'
                    },
                    {
                        opcode: 'getConnectionQuality',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'connection quality'
                    },

                    // 🎨 Visuelles
                    {
                        opcode: 'getColorDepth',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'color depth (bits)'
                    },
                    {
                        opcode: 'getPixelDensity',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'pixel density'
                    },
                    {
                        opcode: 'getOrientation',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'screen orientation'
                    },
                    {
                        opcode: 'isFullscreen',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'fullscreen mode?'
                    },
                    {
                        opcode: 'getZoomLevel',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'browser zoom level'
                    },
                    {
                        opcode: 'hasHighContrast',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'high contrast mode?'
                    },

                    // 🔊 Audio
                    {
                        opcode: 'getAudioSupport',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'audio formats supported'
                    },
                    {
                        opcode: 'hasMicrophone',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'microphone available?'
                    },

                    // 📱 Mobiles
                    {
                        opcode: 'getDeviceType',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'device type'
                    },
                    {
                        opcode: 'getDeviceModel',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'device model'
                    },
                    {
                        opcode: 'getBatteryLevel',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'battery level (%)'
                    },
                    {
                        opcode: 'isPowerSaveMode',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'power save mode?'
                    },
                    {
                        opcode: 'hasVibration',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'vibration support?'
                    },

                    // 🎯 Utilisateur
                    {
                        opcode: 'isFirstVisit',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'first visit?'
                    },
                    {
                        opcode: 'getTimeSpent',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'time spent (seconds)'
                    },
                    {
                        opcode: 'getClickCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'click count'
                    },
                    {
                        opcode: 'getMouseMovements',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'mouse movements'
                    },
                    {
                        opcode: 'getLastKeys',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last keys pressed'
                    },
                    {
                        opcode: 'getScrollPosition',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'scroll position'
                    }
                ]
            };
        }

        // Initialize event listeners
        _initEventListeners() {
            // Click counter
            document.addEventListener('click', () => {
                this.clickCount++;
            });

            // Mouse movement counter
            document.addEventListener('mousemove', () => {
                this.mouseMovements++;
            });

            // Key press tracker
            document.addEventListener('keydown', (e) => {
                this.lastKeys.push(e.key);
                if (this.lastKeys.length > 10) {
                    this.lastKeys.shift();
                }
            });

            // Scroll position tracker
            window.addEventListener('scroll', () => {
                this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            });
        }

        // Fetch geographical data
        async _fetchGeoData() {
            try {
                const response = await fetch('https://ipapi.co/json/');
                this.geoData = await response.json();
            } catch (error) {
                console.log('Could not fetch geo data:', error);
                this.geoData = {
                    ip: 'Unknown',
                    country_name: 'Unknown',
                    city: 'Unknown',
                    postal: 'Unknown',
                    org: 'Unknown'
                };
            }
        }

        // Test connection speed and ping
        async _testConnection() {
            try {
                const startTime = performance.now();
                await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
                const endTime = performance.now();
                
                this.connectionData = {
                    ping: Math.round(endTime - startTime),
                    speed: this._estimateSpeed(),
                    quality: this._getConnectionQuality(endTime - startTime)
                };
            } catch (error) {
                this.connectionData = {
                    ping: 'Unknown',
                    speed: 'Unknown',
                    quality: 'Unknown'
                };
            }
        }

        _estimateSpeed() {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection && connection.downlink) {
                return connection.downlink;
            }
            return 'Unknown';
        }

        _getConnectionQuality(ping) {
            if (ping < 50) return 'Excellent';
            if (ping < 100) return 'Good';
            if (ping < 200) return 'Average';
            return 'Poor';
        }

        // 🌐 Browser & System Methods
        getBrowserName() {
            const userAgent = navigator.userAgent;
            if (userAgent.includes('Chrome')) return 'Chrome';
            if (userAgent.includes('Firefox')) return 'Firefox';
            if (userAgent.includes('Safari')) return 'Safari';
            if (userAgent.includes('Edge')) return 'Edge';
            if (userAgent.includes('Opera')) return 'Opera';
            return 'Unknown';
        }

        getBrowserVersion() {
            const userAgent = navigator.userAgent;
            const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/);
            return match ? match[2] : 'Unknown';
        }

        getBrowserEngine() {
            const userAgent = navigator.userAgent;
            if (userAgent.includes('WebKit')) return 'WebKit';
            if (userAgent.includes('Gecko')) return 'Gecko';
            if (userAgent.includes('Trident')) return 'Trident';
            return 'Unknown';
        }

        getOperatingSystem() {
            const userAgent = navigator.userAgent;
            if (userAgent.includes('Windows')) return 'Windows';
            if (userAgent.includes('Mac')) return 'macOS';
            if (userAgent.includes('Linux')) return 'Linux';
            if (userAgent.includes('Android')) return 'Android';
            if (userAgent.includes('iOS')) return 'iOS';
            return 'Unknown';
        }

        getLanguage() {
            return navigator.language || navigator.userLanguage || 'Unknown';
        }

        getTimezone() {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        }

        getTimezoneOffset() {
            return new Date().getTimezoneOffset();
        }

        getScreenResolution() {
            return `${screen.width}x${screen.height}`;
        }

        getScreenWidth() {
            return screen.width;
        }

        getScreenHeight() {
            return screen.height;
        }

        getWindowSize() {
            return `${window.innerWidth}x${window.innerHeight}`;
        }

        hasTouchScreen() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }

        cookiesEnabled() {
            return navigator.cookieEnabled;
        }

        getDarkMode() {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // 🌍 Geographic Methods
        getPublicIP() {
            return this.geoData ? this.geoData.ip : 'Loading...';
        }

        getCountry() {
            return this.geoData ? this.geoData.country_name : 'Loading...';
        }

        getCity() {
            return this.geoData ? this.geoData.city : 'Loading...';
        }

        getPostalCode() {
            return this.geoData ? this.geoData.postal : 'Loading...';
        }

        getISP() {
            return this.geoData ? this.geoData.org : 'Loading...';
        }

        getConnectionType() {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return connection ? connection.effectiveType || 'Unknown' : 'Unknown';
        }

        // ⏰ Time Methods
        getCurrentDate() {
            return new Date().toLocaleDateString();
        }

        getCurrentTime() {
            return new Date().toLocaleTimeString();
        }

        getDayOfWeek() {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[new Date().getDay()];
        }

        getTimestamp() {
            return Date.now();
        }

        getUTCTime() {
            return new Date().toUTCString();
        }

        getSeason() {
            const month = new Date().getMonth();
            if (month >= 2 && month <= 4) return 'Spring';
            if (month >= 5 && month <= 7) return 'Summer';
            if (month >= 8 && month <= 10) return 'Autumn';
            return 'Winter';
        }

        getWeekNumber() {
            const date = new Date();
            const firstDay = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDay) / 86400000;
            return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
        }

        // 🎮 Scratch & Performance Methods
        getScratchVersion() {
            if (typeof Scratch !== 'undefined' && Scratch.vm) {
                return 'Scratch 3.0';
            }
            if (window.location.href.includes('turbowarp')) {
                return 'TurboWarp';
            }
            return 'Unknown';
        }

        getFPS() {
            // Simplified FPS calculation
            return Math.round(1000 / 16.67); // Approximate 60 FPS
        }

        getRuntime() {
            return Math.round((Date.now() - this.startTime) / 1000);
        }

        getMemoryUsage() {
            if (performance.memory) {
                return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }
            return 'Unknown';
        }

        getSpriteCount() {
            if (Scratch.vm && Scratch.vm.runtime) {
                return Scratch.vm.runtime.targets.length - 1; // Exclude stage
            }
            return 'Unknown';
        }

        getCostumeCount() {
            if (Scratch.vm && Scratch.vm.runtime) {
                let count = 0;
                Scratch.vm.runtime.targets.forEach(target => {
                    count += target.sprite.costumes.length;
                });
                return count;
            }
            return 'Unknown';
        }

        getSoundCount() {
            if (Scratch.vm && Scratch.vm.runtime) {
                let count = 0;
                Scratch.vm.runtime.targets.forEach(target => {
                    count += target.sprite.sounds.length;
                });
                return count;
            }
            return 'Unknown';
        }

        isTurboMode() {
            if (Scratch.vm && Scratch.vm.runtime) {
                return Scratch.vm.runtime.turboMode || false;
            }
            return false;
        }

        // 🔗 Network Methods
        getConnectionSpeed() {
            return this.connectionData ? this.connectionData.speed : 'Testing...';
        }

        getPing() {
            return this.connectionData ? this.connectionData.ping : 'Testing...';
        }

        getNetworkType() {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return connection ? connection.type || 'Unknown' : 'Unknown';
        }

        isOnline() {
            return navigator.onLine;
        }

        getConnectionQuality() {
            return this.connectionData ? this.connectionData.quality : 'Testing...';
        }

        // 🎨 Visual Methods
        getColorDepth() {
            return screen.colorDepth || 'Unknown';
        }

        getPixelDensity() {
            return window.devicePixelRatio || 1;
        }

        getOrientation() {
            return screen.orientation ? screen.orientation.type : 
                   (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
        }

        isFullscreen() {
            return !!(document.fullscreenElement || document.webkitFullscreenElement || 
                     document.mozFullScreenElement || document.msFullscreenElement);
        }

        getZoomLevel() {
            return Math.round(window.devicePixelRatio * 100) + '%';
        }

        hasHighContrast() {
            return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
        }

        // 🔊 Audio Methods
        getAudioSupport() {
            const audio = document.createElement('audio');
            const formats = [];
            if (audio.canPlayType('audio/mpeg')) formats.push('MP3');
            if (audio.canPlayType('audio/wav')) formats.push('WAV');
            if (audio.canPlayType('audio/ogg')) formats.push('OGG');
            return formats.join(', ') || 'None';
        }

        async hasMicrophone() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                return devices.some(device => device.kind === 'audioinput');
            } catch {
                return false;
            }
        }

        // 📱 Mobile Methods
        getDeviceType() {
            const userAgent = navigator.userAgent;
            if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
            if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'Mobile';
            return 'Desktop';
        }

        getDeviceModel() {
            const userAgent = navigator.userAgent;
            if (userAgent.includes('iPhone')) return 'iPhone';
            if (userAgent.includes('iPad')) return 'iPad';
            if (userAgent.includes('Samsung')) return 'Samsung';
            if (userAgent.includes('Pixel')) return 'Google Pixel';
            return 'Unknown';
        }

        async getBatteryLevel() {
            try {
                if ('getBattery' in navigator) {
                    const battery = await navigator.getBattery();
                    return Math.round(battery.level * 100);
                }
            } catch {
                // Battery API not supported
            }
            return 'Unknown';
        }

        async isPowerSaveMode() {
            try {
                if ('getBattery' in navigator) {
                    const battery = await navigator.getBattery();
                    return battery.charging === false && battery.level < 0.2;
                }
            } catch {
                // Battery API not supported
            }
            return false;
        }

        hasVibration() {
            return 'vibrate' in navigator;
        }

        // 🎯 User Methods
        isFirstVisit() {
            const visited = localStorage.getItem('scratch_visited');
            if (!visited) {
                localStorage.setItem('scratch_visited', 'true');
                return true;
            }
            return false;
        }

        getTimeSpent() {
            return Math.round((Date.now() - this.startTime) / 1000);
        }

        getClickCount() {
            return this.clickCount;
        }

        getMouseMovements() {
            return this.mouseMovements;
        }

        getLastKeys() {
            return this.lastKeys.join(', ') || 'None';
        }

        getScrollPosition() {
            return this.scrollPosition;
        }
    }

    Scratch.extensions.register(new SystemInfoExtension());

})(window.Scratch);