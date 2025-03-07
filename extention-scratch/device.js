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
            text: 'GPU'
          },
          {
            opcode: 'getNetworkType',
            blockType: 'reporter',
            text: 'Network Connection Type'
          },
          {
            opcode: 'getStorageSpace',
            blockType: 'reporter',
            text: 'Available Storage Space (GB)'
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
      // Note: This is not directly accessible via JavaScript in most browsers.
      // It requires additional libraries or native code.
      return "Not available";
    }
  
    getNetworkType() {
      const connection = navigator.connection;
      if (connection) {
        if (connection.type === 'wifi') return "Wi-Fi";
        if (connection.type === 'cellular') return "Cellular";
        if (connection.type === 'ethernet') return "Ethernet";
      }
      return "Unknown";
    }
  
    getStorageSpace() {
      // Note: This is not directly accessible via JavaScript in most browsers.
      // It requires additional permissions or native code.
      return "Not available";
    }
  
    getProcessorArchitecture() {
      // Note: This is not directly accessible via JavaScript in most browsers.
      // It requires additional libraries or native code.
      return "Not available";
    }
  
    isTouchScreen() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? "Yes" : "No";
    }
  
    getBatteryChargingStatus() {
      if ('getBattery' in navigator) {
        return navigator.getBattery().then(battery => {
          return battery.charging ? "Yes" : "No";
        });
      }
      return "Not available";
    }
  
    getInstalledPlugins() {
      // Note: This is not directly accessible via JavaScript in most browsers.
      // It requires additional permissions or native code.
      return "Not available";
    }
  }
  
  Scratch.extensions.register(new SystemInfo());
  