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
  }
  
  Scratch.extensions.register(new SystemInfo());
  