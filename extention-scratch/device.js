class SystemInfo {
    getInfo() {
      return {
        id: 'systeminfo',
        name: 'System Info',
        blocks: [
          {
            opcode: 'getOS',
            blockType: 'reporter',
            text: 'Operating System'
          },
          {
            opcode: 'getBrowser',
            blockType: 'reporter',
            text: 'Browser'
          },
          {
            opcode: 'getScreenSize',
            blockType: 'reporter',
            text: 'Screen Size'
          },
          {
            opcode: 'getLanguage',
            blockType: 'reporter',
            text: 'Language'
          },
          {
            opcode: 'getTimeZone',
            blockType: 'reporter',
            text: 'Time Zone'
          },
          {
            opcode: 'getOnlineStatus',
            blockType: 'reporter',
            text: 'Online?'
          },
          {
            opcode: 'getCPUCores',
            blockType: 'reporter',
            text: 'CPU Cores'
          },
          {
            opcode: 'getMemory',
            blockType: 'reporter',
            text: 'Device Memory (GB)'
          },
          {
            opcode: 'getBatteryLevel',
            blockType: 'reporter',
            text: 'Battery Level'
          },
          {
            opcode: 'getDeviceType',
            blockType: 'reporter',
            text: 'Device Type'
          },
          {
            opcode: 'getGPU',
            blockType: 'reporter',
            text: 'GPU Info'
          },
          {
            opcode: 'getNetworkType',
            blockType: 'reporter',
            text: 'Network Connection Type'
          },
          {
            opcode: 'getStorageEstimate',
            blockType: 'reporter',
            text: 'Estimated Storage (GB)'
          },
          {
            opcode: 'getProcessorArchitecture',
            blockType: 'reporter',
            text: 'Processor Architecture'
          },
          {
            opcode: 'isTouchScreen',
            blockType: 'reporter',
            text: 'Is Touch Screen?'
          },
          {
            opcode: 'getBatteryChargingStatus',
            blockType: 'reporter',
            text: 'Is Battery Charging?'
          },
          {
            opcode: 'getInstalledPlugins',
            blockType: 'reporter',
            text: 'Installed Plugins'
          }
        ]
      };
    }
  
    getOS() {
      const platform = navigator.platform.toLowerCase();
      if (platform.includes('win')) return "Windows";
      if (platform.includes('mac')) return "macOS";
      if (platform.includes('linux')) return "Linux";
      if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())) return "Mobile";
      return "Unknown OS";
    }
  
    getBrowser() {
      const ua = navigator.userAgent;
      if (ua.includes("Chrome")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
      if (ua.includes("Edge")) return "Edge";
      if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
      return "Unknown Browser";
    }
  
    getScreenSize() {
      return `${window.screen.width}x${window.screen.height}`;
    }
  
    getLanguage() {
      return navigator.language || navigator.userLanguage;
    }
  
    getTimeZone() {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  
    getOnlineStatus() {
      return navigator.onLine ? "Yes" : "No";
    }
  
    getCPUCores() {
      return navigator.hardwareConcurrency || "Unknown";
    }
  
    getMemory() {
      return navigator.deviceMemory || "Unknown";
    }
  
    getBatteryLevel() {
      if ('getBattery' in navigator) {
        return navigator.getBattery().then(battery => {
          return (battery.level * 100).toFixed(2) + "%";
        });
      }
      return "Not available";
    }
  
    getDeviceType() {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "Tablet";
      }
      if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "Mobile";
      }
      return "Desktop";
    }
  
    getGPU() {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'WebGL supported, but GPU info not available';
      }
      return 'WebGL not supported';
    }
  
    getNetworkType() {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.type) return connection.type;
        if (connection.effectiveType) return connection.effectiveType;
      }
      return "Unknown";
    }
  
    async getStorageEstimate() {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          return (estimate.quota / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        } catch (e) {
          return "Estimation failed";
        }
      }
      return "Not available";
    }
  
    getProcessorArchitecture() {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Win64') || userAgent.includes('x64')) return '64-bit';
      if (userAgent.includes('Win32') || userAgent.includes('WOW64')) return '32-bit';
      if (userAgent.includes('x86_64') || userAgent.includes('x86-64')) return '64-bit';
      if (userAgent.includes('i686') || userAgent.includes('i386')) return '32-bit';
      return 'Unknown';
    }
  
    isTouchScreen() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? "Yes" : "No";
    }
  
    async getBatteryChargingStatus() {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          return battery.charging ? "Yes" : "No";
        } catch (e) {
          return "Not available";
        }
      }
      return "Not available";
    }
  
    getInstalledPlugins() {
      if (navigator.plugins) {
        return Array.from(navigator.plugins).map(p => p.name).join(', ');
      }
      return "Not available";
    }
  }
  
  Scratch.extensions.register(new SystemInfo());
  