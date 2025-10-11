;((Scratch) => {
  class AdvancedMonitorExtension {
    constructor() {
      this.logs = []
      this.logId = 0
      this.consoleWindow = null
      this.performanceWindow = null
      this.isConsoleOpen = false
      this.isPerformanceOpen = false
      this.filters = {
        info: true,
        warning: true,
        error: true,
        debug: true,
      }
      this.maxLogs = 1000
      this.executionDepth = 0

      // Performance tracking
      this.performanceMetrics = {
        fps: 0,
        blockExecutions: 0,
        totalExecutionTime: 0,
        memoryUsage: 0,
        logRate: 0,
        history: {
          fps: [],
          blockExecutions: [],
          executionTime: [],
          logRate: [],
        },
      }
      this.performanceInterval = null
      this.lastFrameTime = performance.now()
      this.frameCount = 0

      // Initialize console
      this._createConsole()
      this._createPerformanceMonitor()
      this._startPerformanceTracking()
    }

    getInfo() {
      return {
        id: "advancedMonitor",
        name: "Advanced Monitor",
        color1: "#16A085",
        color2: "#1ABC9C",
        blocks: [
          {
            opcode: "recordInfo",
            blockType: Scratch.BlockType.COMMAND,
            text: "📗 Record Info: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Information message",
              },
            },
          },
          {
            opcode: "recordWarning",
            blockType: Scratch.BlockType.COMMAND,
            text: "⚡ Record Warning: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Warning message",
              },
            },
          },
          {
            opcode: "recordError",
            blockType: Scratch.BlockType.COMMAND,
            text: "🚨 Record Error: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Error message",
              },
            },
          },
          {
            opcode: "recordDebug",
            blockType: Scratch.BlockType.COMMAND,
            text: "🛠️ Record Debug: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Debug message",
              },
            },
          },
          {
            opcode: "trackAndExecute",
            blockType: Scratch.BlockType.LOOP,
            text: "📈 Track and Execute Blocks",
            arguments: {
              SUBSTACK: {
                type: Scratch.ArgumentType.STRING,
                menu: "SUBSTACK",
              },
            },
          },
          {
            opcode: "showConsole",
            blockType: Scratch.BlockType.COMMAND,
            text: "💻 Show Console",
          },
          {
            opcode: "hideConsole",
            blockType: Scratch.BlockType.COMMAND,
            text: "🚫 Hide Console",
          },
          {
            opcode: "showPerformance",
            blockType: Scratch.BlockType.COMMAND,
            text: "📊 Show Performance Monitor",
          },
          {
            opcode: "hidePerformance",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔒 Hide Performance Monitor",
          },
          {
            opcode: "eraseAllLogs",
            blockType: Scratch.BlockType.COMMAND,
            text: "🧹 Erase All Logs",
          },
          {
            opcode: "getTotalLogs",
            blockType: Scratch.BlockType.REPORTER,
            text: "total logs recorded",
          },
          {
            opcode: "getRecentLog",
            blockType: Scratch.BlockType.REPORTER,
            text: "most recent log message",
          },
          {
            opcode: "getCurrentFPS",
            blockType: Scratch.BlockType.REPORTER,
            text: "current FPS",
          },
          {
            opcode: "getBlockExecutions",
            blockType: Scratch.BlockType.REPORTER,
            text: "total block executions",
          },
          {
            opcode: "saveLogsToFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "💿 Save Logs to File",
          },
        ],
        menus: {
          SUBSTACK: {
            acceptReporters: false,
            items: [""],
          },
        },
      }
    }

    _createConsole() {
      this.consoleWindow = document.createElement("div")
      this.consoleWindow.id = "advanced-monitor-console"
      this.consoleWindow.style.cssText = `
                position: fixed;
                top: 50px;
                right: 20px;
                width: 700px;
                height: 550px;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 16px;
                box-shadow: 
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 20px 25px -5px rgba(0, 0, 0, 0.4),
                    0 10px 10px -5px rgba(0, 0, 0, 0.3),
                    0 0 60px rgba(59, 130, 246, 0.15);
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            `

      const header = document.createElement("div")
      header.style.cssText = `
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
                border-bottom: 1px solid rgba(148, 163, 184, 0.15);
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 600;
                font-size: 14px;
                cursor: move;
                letter-spacing: -0.01em;
            `
      header.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                    ">🎯</div>
                    <span style="background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">Advanced Monitor</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="am-perf-btn" style="
                        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
                        border: 1px solid rgba(168, 85, 247, 0.3);
                        color: #C4B5FD;
                        padding: 6px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        backdrop-filter: blur(10px);
                    " onmouseover="this.style.background='linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(168, 85, 247, 0.3)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">📊 Performance</button>
                    <button id="am-minimize-console" style="
                        background: rgba(100, 116, 139, 0.2);
                        border: 1px solid rgba(148, 163, 184, 0.2);
                        color: #CBD5E1;
                        width: 32px;
                        height: 32px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " onmouseover="this.style.background='rgba(100, 116, 139, 0.3)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='rgba(100, 116, 139, 0.2)'; this.style.transform='translateY(0)'">−</button>
                    <button id="am-close-console" style="
                        background: rgba(239, 68, 68, 0.2);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        color: #FCA5A5;
                        width: 32px;
                        height: 32px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " onmouseover="this.style.background='rgba(239, 68, 68, 0.3)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">×</button>
                </div>
            `

      const toolbar = document.createElement("div")
      toolbar.style.cssText = `
                background: rgba(15, 23, 42, 0.5);
                padding: 12px 20px;
                border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            `
      toolbar.innerHTML = `
                <button id="am-clear-logs-btn" style="
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
                    color: #FCA5A5;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    padding: 8px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                " onmouseover="this.style.background='linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.25) 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">🧹 Clear</button>
                <button id="am-export-logs-btn" style="
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
                    color: #6EE7B7;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    padding: 8px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                " onmouseover="this.style.background='linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">💿 Export</button>
                <div style="height: 24px; width: 1px; background: rgba(148, 163, 184, 0.2);"></div>
                <label style="
                    color: #CBD5E1;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                " onmouseover="this.style.background='rgba(59, 130, 246, 0.1)'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" id="am-filter-info" checked style="
                        accent-color: #3B82F6;
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                    "> <span style="color: #60A5FA;">📗</span> Info
                </label>
                <label style="
                    color: #CBD5E1;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                " onmouseover="this.style.background='rgba(251, 146, 60, 0.1)'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" id="am-filter-warning" checked style="
                        accent-color: #F59E0B;
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                    "> <span style="color: #FBBF24;">⚡</span> Warning
                </label>
                <label style="
                    color: #CBD5E1;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                " onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" id="am-filter-error" checked style="
                        accent-color: #EF4444;
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                    "> <span style="color: #F87171;">🚨</span> Error
                </label>
                <label style="
                    color: #CBD5E1;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                " onmouseover="this.style.background='rgba(168, 85, 247, 0.1)'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" id="am-filter-debug" checked style="
                        accent-color: #A855F7;
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                    "> <span style="color: #C084FC;">🛠️</span> Debug
                </label>
            `

      const searchBar = document.createElement("div")
      searchBar.style.cssText = `
                background: rgba(15, 23, 42, 0.5);
                padding: 12px 20px;
                border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            `
      searchBar.innerHTML = `
                <div style="position: relative;">
                    <div style="
                        position: absolute;
                        left: 14px;
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 14px;
                        opacity: 0.5;
                    ">🔎</div>
                    <input type="text" id="am-search-logs" placeholder="Search logs..." style="
                        width: 100%;
                        background: rgba(30, 41, 59, 0.5);
                        border: 1px solid rgba(148, 163, 184, 0.2);
                        color: #E2E8F0;
                        padding: 10px 14px 10px 40px;
                        border-radius: 10px;
                        font-size: 13px;
                        outline: none;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        font-family: inherit;
                    " onfocus="this.style.background='rgba(30, 41, 59, 0.8)'; this.style.borderColor='rgba(59, 130, 246, 0.5)'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'" onblur="this.style.background='rgba(30, 41, 59, 0.5)'; this.style.borderColor='rgba(148, 163, 184, 0.2)'; this.style.boxShadow='none'">
                </div>
            `

      const logsContainer = document.createElement("div")
      logsContainer.id = "am-logs-container"
      logsContainer.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: rgba(15, 23, 42, 0.3);
                color: #E2E8F0;
                font-size: 13px;
                line-height: 1.5;
            `

      // Add custom scrollbar styles
      const scrollbarStyle = document.createElement("style")
      scrollbarStyle.textContent = `
                #am-logs-container::-webkit-scrollbar {
                    width: 8px;
                }
                #am-logs-container::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.3);
                    border-radius: 4px;
                }
                #am-logs-container::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.5);
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                #am-logs-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.7);
                }
            `
      document.head.appendChild(scrollbarStyle)

      const statusBar = document.createElement("div")
      statusBar.id = "am-status-bar"
      statusBar.style.cssText = `
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
                border-top: 1px solid rgba(148, 163, 184, 0.15);
                color: #94A3B8;
                padding: 10px 20px;
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0.02em;
                display: flex;
                align-items: center;
                gap: 8px;
            `
      statusBar.innerHTML = `
                <div style="
                    width: 6px;
                    height: 6px;
                    background: #10B981;
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                "></div>
                <span id="am-status-text">Ready • 0 logs</span>
            `

      // Add pulse animation
      const pulseStyle = document.createElement("style")
      pulseStyle.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `
      document.head.appendChild(pulseStyle)

      this.consoleWindow.appendChild(header)
      this.consoleWindow.appendChild(toolbar)
      this.consoleWindow.appendChild(searchBar)
      this.consoleWindow.appendChild(logsContainer)
      this.consoleWindow.appendChild(statusBar)

      document.body.appendChild(this.consoleWindow)

      this._addConsoleEventListeners()
      this._makeDraggable(header, this.consoleWindow)
    }

    _createPerformanceMonitor() {
      this.performanceWindow = document.createElement("div")
      this.performanceWindow.id = "advanced-monitor-performance"
      this.performanceWindow.style.cssText = `
                position: fixed;
                top: 50px;
                left: 20px;
                width: 550px;
                height: 650px;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 16px;
                box-shadow: 
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 20px 25px -5px rgba(0, 0, 0, 0.4),
                    0 10px 10px -5px rgba(0, 0, 0, 0.3),
                    0 0 60px rgba(168, 85, 247, 0.15);
                z-index: 999998;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            `

      const perfHeader = document.createElement("div")
      perfHeader.style.cssText = `
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(217, 70, 239, 0.15) 100%);
                border-bottom: 1px solid rgba(148, 163, 184, 0.15);
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 600;
                font-size: 14px;
                cursor: move;
                letter-spacing: -0.01em;
            `
      perfHeader.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #A855F7 0%, #D946EF 100%);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
                    ">📊</div>
                    <span style="background: linear-gradient(135deg, #C084FC 0%, #E879F9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">Performance Monitor</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="am-perf-reset" style="
                        background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%);
                        border: 1px solid rgba(251, 146, 60, 0.3);
                        color: #FCD34D;
                        padding: 6px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    " onmouseover="this.style.background='linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.3) 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(251, 146, 60, 0.3)'" onmouseout="this.style.background='linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">🔄 Reset</button>
                    <button id="am-close-perf" style="
                        background: rgba(239, 68, 68, 0.2);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        color: #FCA5A5;
                        width: 32px;
                        height: 32px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " onmouseover="this.style.background='rgba(239, 68, 68, 0.3)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">×</button>
                </div>
            `

      const metricsContainer = document.createElement("div")
      metricsContainer.id = "am-metrics-container"
      metricsContainer.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: rgba(15, 23, 42, 0.3);
                color: #E2E8F0;
            `

      // Add scrollbar styles for metrics
      const metricsScrollStyle = document.createElement("style")
      metricsScrollStyle.textContent = `
                #am-metrics-container::-webkit-scrollbar {
                    width: 8px;
                }
                #am-metrics-container::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.3);
                    border-radius: 4px;
                }
                #am-metrics-container::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.5);
                    border-radius: 4px;
                }
                #am-metrics-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.7);
                }
            `
      document.head.appendChild(metricsScrollStyle)

      metricsContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
                    <div style="
                        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%);
                        backdrop-filter: blur(10px);
                        padding: 18px;
                        border-radius: 12px;
                        border: 1px solid rgba(59, 130, 246, 0.2);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(59, 130, 246, 0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <div style="font-size: 20px;">⚡</div>
                            <div style="font-size: 11px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">FPS</div>
                        </div>
                        <div id="am-fps-value" style="font-size: 36px; font-weight: 700; color: #60A5FA; line-height: 1; margin-bottom: 12px;">0</div>
                        <div id="am-fps-bar" style="height: 6px; background: rgba(59, 130, 246, 0.2); border-radius: 3px; overflow: hidden;">
                            <div id="am-fps-fill" style="height: 100%; background: linear-gradient(90deg, #3B82F6, #60A5FA); width: 0%; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
                        </div>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
                        backdrop-filter: blur(10px);
                        padding: 18px;
                        border-radius: 12px;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(239, 68, 68, 0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <div style="font-size: 20px;">🎯</div>
                            <div style="font-size: 11px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Blocks</div>
                        </div>
                        <div id="am-blocks-value" style="font-size: 36px; font-weight: 700; color: #F87171; line-height: 1; margin-bottom: 4px;">0</div>
                        <div style="font-size: 10px; color: #94A3B8; font-weight: 500;">Total executions</div>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%);
                        backdrop-filter: blur(10px);
                        padding: 18px;
                        border-radius: 12px;
                        border: 1px solid rgba(251, 146, 60, 0.2);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(251, 146, 60, 0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <div style="font-size: 20px;">⏱️</div>
                            <div style="font-size: 11px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Avg Time</div>
                        </div>
                        <div id="am-time-value" style="font-size: 36px; font-weight: 700; color: #FB923C; line-height: 1; margin-bottom: 4px;">0ms</div>
                        <div style="font-size: 10px; color: #94A3B8; font-weight: 500;">Per block group</div>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
                        backdrop-filter: blur(10px);
                        padding: 18px;
                        border-radius: 12px;
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(16, 185, 129, 0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <div style="font-size: 20px;">📝</div>
                            <div style="font-size: 11px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Log Rate</div>
                        </div>
                        <div id="am-lograte-value" style="font-size: 36px; font-weight: 700; color: #34D399; line-height: 1; margin-bottom: 4px;">0</div>
                        <div style="font-size: 10px; color: #94A3B8; font-weight: 500;">Logs per second</div>
                    </div>
                </div>

                <div style="
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%);
                    backdrop-filter: blur(10px);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 14px;
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                        <div style="font-size: 18px;">📈</div>
                        <div style="font-size: 13px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.01em;">FPS History</div>
                        <div style="font-size: 11px; color: #64748B; margin-left: auto;">Last 60s</div>
                    </div>
                    <canvas id="am-fps-chart" width="490" height="140" style="width: 100%; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.1);"></canvas>
                </div>

                <div style="
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.03) 100%);
                    backdrop-filter: blur(10px);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 14px;
                    border: 1px solid rgba(239, 68, 68, 0.15);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                        <div style="font-size: 18px;">🎯</div>
                        <div style="font-size: 13px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.01em;">Block Execution History</div>
                    </div>
                    <canvas id="am-blocks-chart" width="490" height="140" style="width: 100%; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.1);"></canvas>
                </div>

                <div style="
                    background: linear-gradient(135deg, rgba(100, 116, 139, 0.08) 0%, rgba(71, 85, 105, 0.03) 100%);
                    backdrop-filter: blur(10px);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid rgba(100, 116, 139, 0.2);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                        <div style="font-size: 18px;">ℹ️</div>
                        <div style="font-size: 13px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.01em;">System Information</div>
                    </div>
                    <div style="font-size: 12px; color: #94A3B8; line-height: 1.8; font-weight: 500;">
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                            <span style="opacity: 0.7;">🖥️ User Agent:</span>
                            <span id="am-useragent" style="color: #CBD5E1; margin-left: auto; text-align: right; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Loading...</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                            <span style="opacity: 0.7;">🌐 Platform:</span>
                            <span id="am-platform" style="color: #CBD5E1; margin-left: auto;">Loading...</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
                            <span style="opacity: 0.7;">⏰ Uptime:</span>
                            <span id="am-uptime" style="color: #CBD5E1; margin-left: auto;">0s</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
                            <span style="opacity: 0.7;">📊 Total Logs:</span>
                            <span id="am-total-logs" style="color: #CBD5E1; margin-left: auto;">0</span>
                        </div>
                    </div>
                </div>
            `

      this.performanceWindow.appendChild(perfHeader)
      this.performanceWindow.appendChild(metricsContainer)

      document.body.appendChild(this.performanceWindow)

      this._addPerformanceEventListeners()
      this._makeDraggable(perfHeader, this.performanceWindow)

      document.getElementById("am-useragent").textContent = navigator.userAgent.substring(0, 50) + "..."
      document.getElementById("am-platform").textContent = navigator.platform
    }

    _startPerformanceTracking() {
      this.startTime = Date.now()

      // Update performance metrics every 100ms
      this.performanceInterval = setInterval(() => {
        this._updatePerformanceMetrics()
      }, 100)

      // Track FPS
      const trackFPS = () => {
        const now = performance.now()
        const delta = now - this.lastFrameTime
        this.frameCount++

        if (delta >= 1000) {
          this.performanceMetrics.fps = Math.round((this.frameCount * 1000) / delta)
          this.frameCount = 0
          this.lastFrameTime = now
        }

        requestAnimationFrame(trackFPS)
      }
      trackFPS()
    }

    _updatePerformanceMetrics() {
      if (!this.isPerformanceOpen) return

      // Update FPS
      const fpsValue = document.getElementById("am-fps-value")
      const fpsFill = document.getElementById("am-fps-fill")
      if (fpsValue) {
        fpsValue.textContent = this.performanceMetrics.fps
        const fpsPercent = Math.min((this.performanceMetrics.fps / 60) * 100, 100)
        fpsFill.style.width = fpsPercent + "%"

        // Color based on performance
        if (this.performanceMetrics.fps >= 50) {
          fpsFill.style.background = "#27AE60"
        } else if (this.performanceMetrics.fps >= 30) {
          fpsFill.style.background = "#F39C12"
        } else {
          fpsFill.style.background = "#E74C3C"
        }
      }

      // Update block executions
      const blocksValue = document.getElementById("am-blocks-value")
      if (blocksValue) {
        blocksValue.textContent = this.performanceMetrics.blockExecutions
      }

      // Update average execution time
      const timeValue = document.getElementById("am-time-value")
      if (timeValue) {
        const avgTime =
          this.performanceMetrics.blockExecutions > 0
            ? Math.round(this.performanceMetrics.totalExecutionTime / this.performanceMetrics.blockExecutions)
            : 0
        timeValue.textContent = avgTime + "ms"
      }

      // Update log rate
      const logRateValue = document.getElementById("am-lograte-value")
      if (logRateValue) {
        logRateValue.textContent = this.performanceMetrics.logRate
      }

      // Update uptime
      const uptimeValue = document.getElementById("am-uptime")
      if (uptimeValue) {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000)
        uptimeValue.textContent = uptime + "s"
      }

      // Update total logs
      const totalLogsValue = document.getElementById("am-total-logs")
      if (totalLogsValue) {
        totalLogsValue.textContent = this.logs.length
      }

      // Update history
      this.performanceMetrics.history.fps.push(this.performanceMetrics.fps)
      this.performanceMetrics.history.blockExecutions.push(this.performanceMetrics.blockExecutions)

      // Keep only last 60 data points (60 seconds at 1 update per second)
      if (this.performanceMetrics.history.fps.length > 60) {
        this.performanceMetrics.history.fps.shift()
        this.performanceMetrics.history.blockExecutions.shift()
      }

      // Draw charts
      this._drawChart("am-fps-chart", this.performanceMetrics.history.fps, "#3498DB", 60)
      this._drawChart("am-blocks-chart", this.performanceMetrics.history.blockExecutions, "#E74C3C", null)
    }

    _drawChart(canvasId, data, color, maxValue) {
      const canvas = document.getElementById(canvasId)
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (data.length === 0) return

      // Calculate max value for scaling
      const max = maxValue || Math.max(...data, 1)
      const pointWidth = width / Math.max(data.length - 1, 1)

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw line
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()

      data.forEach((value, index) => {
        const x = index * pointWidth
        const y = height - (value / max) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw fill
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fillStyle = color.replace(")", ", 0.2)").replace("rgb", "rgba")
      ctx.fill()
    }

    _addConsoleEventListeners() {
      // Close button
      document.getElementById("am-close-console").addEventListener("click", () => {
        this.hideConsole()
      })

      // Performance button
      document.getElementById("am-perf-btn").addEventListener("click", () => {
        this.showPerformance()
      })

      // Clear button
      document.getElementById("am-clear-logs-btn").addEventListener("click", () => {
        this.eraseAllLogs()
      })

      // Export button
      document
        .getElementById("am-export-logs-btn")
        .addEventListener("click", () => {
          this.saveLogsToFile()
        })

      // Filter checkboxes
      ;["info", "warning", "error", "debug"].forEach((type) => {
        document.getElementById(`am-filter-${type}`).addEventListener("change", (e) => {
          this.filters[type] = e.target.checked
          this._refreshLogDisplay()
        })
      })

      // Search functionality
      document.getElementById("am-search-logs").addEventListener("input", (e) => {
        this._filterLogs(e.target.value)
      })
    }

    _addPerformanceEventListeners() {
      // Close button
      document.getElementById("am-close-perf").addEventListener("click", () => {
        this.hidePerformance()
      })

      // Reset button
      document.getElementById("am-perf-reset").addEventListener("click", () => {
        this.performanceMetrics.blockExecutions = 0
        this.performanceMetrics.totalExecutionTime = 0
        this.performanceMetrics.logRate = 0
        this.performanceMetrics.history.fps = []
        this.performanceMetrics.history.blockExecutions = []
        this.startTime = Date.now()
        this._showToast("Performance metrics reset!")
      })
    }

    _makeDraggable(header, window) {
      let isDragging = false
      let currentX
      let currentY
      let initialX
      let initialY
      let xOffset = 0
      let yOffset = 0

      header.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "BUTTON") return
        initialX = e.clientX - xOffset
        initialY = e.clientY - yOffset
        isDragging = true
      })

      document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          e.preventDefault()
          currentX = e.clientX - initialX
          currentY = e.clientY - initialY
          xOffset = currentX
          yOffset = currentY
          window.style.transform = `translate(${currentX}px, ${currentY}px)`
        }
      })

      document.addEventListener("mouseup", () => {
        isDragging = false
      })
    }

    _addLog(type, message, details = null, isExpandable = false) {
      const timestamp = new Date()
      const log = {
        id: ++this.logId,
        type: type,
        message: message,
        details: details,
        timestamp: timestamp,
        time: timestamp.toLocaleTimeString(),
        depth: this.executionDepth,
        isExpandable: isExpandable,
        isExpanded: false,
      }

      this.logs.push(log)

      // Update log rate
      this.performanceMetrics.logRate++
      setTimeout(() => {
        this.performanceMetrics.logRate = Math.max(0, this.performanceMetrics.logRate - 1)
      }, 1000)

      // Limit logs
      if (this.logs.length > this.maxLogs) {
        this.logs.shift()
      }

      // Add to display
      this._addLogToDisplay(log)
      this._updateStatusBar()

      // Auto-scroll to bottom
      const container = document.getElementById("am-logs-container")
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }

    _addLogToDisplay(log) {
      const container = document.getElementById("am-logs-container")
      if (!container) return

      const logElement = document.createElement("div")
      logElement.className = `am-log-entry am-log-${log.type}`
      logElement.dataset.logId = log.id

      const indentPx = log.depth * 20

      logElement.style.cssText = `
                margin-bottom: 8px;
                margin-left: ${indentPx}px;
                border-radius: 10px;
                border-left: 3px solid ${this._getLogColor(log.type)};
                background: ${this._getLogBackground(log.type)};
                backdrop-filter: blur(10px);
                font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: ${log.isExpandable ? "pointer" : "default"};
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            `

      const icon = this._getLogIcon(log.type)
      const typeText = log.type.toUpperCase()
      const expandIcon = log.isExpandable ? "▶" : ""

      logElement.innerHTML = `
                <div class="am-log-header" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
                            ${log.isExpandable ? `<span class="am-expand-icon" style="font-size: 10px; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); color: ${this._getLogColor(log.type)};">${expandIcon}</span>` : ""}
                            <span style="font-size: 16px;">${icon}</span>
                            <span style="
                                color: ${this._getLogColor(log.type)};
                                font-weight: 700;
                                font-size: 10px;
                                text-transform: uppercase;
                                letter-spacing: 0.05em;
                                padding: 2px 8px;
                                background: ${this._getLogColor(log.type)}20;
                                border-radius: 4px;
                            ">${typeText}</span>
                            <span style="
                                color: #64748B;
                                font-size: 10px;
                                padding: 2px 6px;
                                background: rgba(100, 116, 139, 0.1);
                                border-radius: 4px;
                                font-weight: 600;
                            ">#${log.id}</span>
                            ${log.depth > 0 ? `<span style="color: #64748B; font-size: 10px; padding: 2px 6px; background: rgba(100, 116, 139, 0.1); border-radius: 4px;">depth:${log.depth}</span>` : ""}
                            ${log.isExpandable ? `<span style="color: #FB923C; font-size: 10px; padding: 2px 6px; background: rgba(251, 146, 60, 0.1); border-radius: 4px; font-weight: 500;">📋 Expandable</span>` : ""}
                        </div>
                        <div style="color: #E2E8F0; font-size: 13px; word-break: break-word; line-height: 1.5; font-weight: 500;">
                            ${this._escapeHtml(log.message)}
                        </div>
                    </div>
                    <div style="
                        color: #64748B;
                        font-size: 10px;
                        white-space: nowrap;
                        padding: 2px 8px;
                        background: rgba(100, 116, 139, 0.1);
                        border-radius: 4px;
                        font-weight: 600;
                    ">
                        ${log.time}
                    </div>
                </div>
                ${
                  log.isExpandable && log.details
                    ? `
                    <div class="am-log-details" style="display: none; padding: 0 16px 16px 16px; border-top: 1px solid rgba(148, 163, 184, 0.1); margin-top: 8px;">
                        <div style="
                            background: rgba(15, 23, 42, 0.5);
                            border-radius: 8px;
                            padding: 16px;
                            margin-top: 12px;
                            border: 1px solid rgba(148, 163, 184, 0.1);
                        ">
                            <div style="color: #FB923C; font-weight: 700; margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                                <span>📋</span> Detailed Block Analysis
                            </div>
                            ${this._formatBlockDetails(log.details)}
                        </div>
                    </div>
                `
                    : ""
                }
            `

      if (log.isExpandable) {
        const header = logElement.querySelector(".am-log-header")
        const details = logElement.querySelector(".am-log-details")
        const expandIcon = logElement.querySelector(".am-expand-icon")

        header.addEventListener("click", () => {
          log.isExpanded = !log.isExpanded

          if (log.isExpanded) {
            details.style.display = "block"
            expandIcon.style.transform = "rotate(90deg)"
            logElement.style.background = this._getLogHoverBackground(log.type)
            logElement.style.boxShadow = `0 4px 16px ${this._getLogColor(log.type)}30`
          } else {
            details.style.display = "none"
            expandIcon.style.transform = "rotate(0deg)"
            logElement.style.background = this._getLogBackground(log.type)
            logElement.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"
          }
        })

        header.addEventListener("mouseenter", () => {
          if (!log.isExpanded) {
            logElement.style.background = this._getLogHoverBackground(log.type)
            logElement.style.transform = "translateX(4px)"
            logElement.style.boxShadow = `0 4px 12px ${this._getLogColor(log.type)}20`
          }
        })

        header.addEventListener("mouseleave", () => {
          if (!log.isExpanded) {
            logElement.style.background = this._getLogBackground(log.type)
            logElement.style.transform = "translateX(0)"
            logElement.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"
          }
        })
      } else {
        logElement.addEventListener("click", () => {
          navigator.clipboard.writeText(`[${log.time}] ${typeText}: ${log.message}`)
          this._showToast("Log copied to clipboard!")
        })

        logElement.addEventListener("mouseenter", () => {
          logElement.style.transform = "translateX(4px)"
          logElement.style.boxShadow = `0 4px 12px ${this._getLogColor(log.type)}20`
        })

        logElement.addEventListener("mouseleave", () => {
          logElement.style.transform = "translateX(0)"
          logElement.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"
        })
      }

      container.appendChild(logElement)
    }

    _formatBlockDetails(details) {
      if (!details.blocks || details.blocks.length === 0) {
        return '<div style="color: #F87171; font-size: 12px;">No blocks found</div>'
      }

      let html = `
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; border-left: 3px solid #3B82F6;">
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 12px;">
                        <span style="color: #60A5FA; font-weight: 600;">📊 Total Blocks:</span>
                        <span style="color: #E2E8F0; font-weight: 600;">${details.blocks.length}</span>
                        
                        <span style="color: #60A5FA; font-weight: 600;">🎯 Target:</span>
                        <span style="color: #E2E8F0;">${details.target}</span>
                        
                        <span style="color: #60A5FA; font-weight: 600;">🎭 Sprite:</span>
                        <span style="color: #E2E8F0;">${details.sprite}</span>
                        
                        <span style="color: #60A5FA; font-weight: 600;">⏰ Execution Time:</span>
                        <span style="color: #E2E8F0; font-weight: 600;">${details.executionTime}</span>
                    </div>
                </div>
                <div style="border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 16px;">
                    <div style="color: #FB923C; font-weight: 700; margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                        <span>🔍</span> Block Details
                    </div>
            `

      details.blocks.forEach((block, index) => {
        html += `
                    <div style="
                        background: rgba(30, 41, 59, 0.5);
                        border-radius: 8px;
                        padding: 14px;
                        margin-bottom: 10px;
                        border-left: 3px solid #60A5FA;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(30, 41, 59, 0.7)'; this.style.transform='translateX(4px)'" onmouseout="this.style.background='rgba(30, 41, 59, 0.5)'; this.style.transform='translateX(0)'">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: #60A5FA; font-weight: 700; font-size: 11px;">Block ${index + 1}</span>
                            <span style="
                                color: #94A3B8;
                                font-size: 10px;
                                padding: 2px 8px;
                                background: rgba(100, 116, 139, 0.2);
                                border-radius: 4px;
                                font-family: 'SF Mono', monospace;
                            ">${block.opcode}</span>
                        </div>
                        <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 6px;">
                            <strong style="color: #94A3B8;">Opcode:</strong>
                            <code style="
                                background: rgba(15, 23, 42, 0.6);
                                padding: 3px 8px;
                                border-radius: 4px;
                                margin-left: 6px;
                                color: #60A5FA;
                                font-family: 'SF Mono', monospace;
                                font-size: 10px;
                            ">${block.opcode}</code>
                        </div>
                        ${
                          Object.keys(block.inputs).length > 0
                            ? `
                            <div style="font-size: 11px; color: #CBD5E1; margin-top: 8px;">
                                <strong style="color: #94A3B8;">Inputs:</strong>
                                <div style="margin-left: 16px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                                    ${Object.entries(block.inputs)
                                      .map(
                                        ([key, value]) =>
                                          `<div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="color: #FB923C; font-weight: 600;">•</span>
                                            <span style="color: #FB923C; font-weight: 600;">${key}:</span>
                                            <span style="color: #E2E8F0;">${value.value}</span>
                                            <span style="color: #64748B; font-size: 10px;">(${value.type})</span>
                                        </div>`,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `
                            : ""
                        }
                        ${
                          Object.keys(block.fields).length > 0
                            ? `
                            <div style="font-size: 11px; color: #CBD5E1; margin-top: 8px;">
                                <strong style="color: #94A3B8;">Fields:</strong>
                                <div style="margin-left: 16px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                                    ${Object.entries(block.fields)
                                      .map(
                                        ([key, value]) =>
                                          `<div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="color: #34D399; font-weight: 600;">•</span>
                                            <span style="color: #34D399; font-weight: 600;">${key}:</span>
                                            <span style="color: #E2E8F0;">${value}</span>
                                        </div>`,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `
                            : ""
                        }
                    </div>
                `
      })

      html += "</div>"
      return html
    }

    _getLogColor(type) {
      const colors = {
        info: "#3B82F6",
        warning: "#F59E0B",
        error: "#EF4444",
        debug: "#A855F7",
      }
      return colors[type] || "#60A5FA"
    }

    _getLogBackground(type) {
      const backgrounds = {
        info: "rgba(59, 130, 246, 0.08)",
        warning: "rgba(245, 158, 11, 0.08)",
        error: "rgba(239, 68, 68, 0.08)",
        debug: "rgba(168, 85, 247, 0.08)",
      }
      return backgrounds[type] || "rgba(59, 130, 246, 0.05)"
    }

    _getLogHoverBackground(type) {
      const backgrounds = {
        info: "rgba(59, 130, 246, 0.15)",
        warning: "rgba(245, 158, 11, 0.15)",
        error: "rgba(239, 68, 68, 0.15)",
        debug: "rgba(168, 85, 247, 0.15)",
      }
      return backgrounds[type] || "rgba(59, 130, 246, 0.1)"
    }

    _getLogIcon(type) {
      const icons = {
        info: "📗",
        warning: "⚡",
        error: "🚨",
        debug: "🛠️",
      }
      return icons[type] || "📝"
    }

    _escapeHtml(text) {
      const div = document.createElement("div")
      div.textContent = text
      return div.innerHTML
    }

    _updateStatusBar() {
      const statusBar = document.getElementById("am-status-bar")
      const statusText = document.getElementById("am-status-text")
      if (statusText) {
        const totalLogs = this.logs.length
        const visibleLogs = document.querySelectorAll('.am-log-entry:not([style*="display: none"])').length
        statusText.textContent = `Ready • ${totalLogs} total logs • ${visibleLogs} visible`
      }
    }

    _refreshLogDisplay() {
      const container = document.getElementById("am-logs-container")
      if (container) {
        container.innerHTML = ""
        this.logs.forEach((log) => {
          if (this.filters[log.type]) {
            this._addLogToDisplay(log)
          }
        })
        this._updateStatusBar()
      }
    }

    _filterLogs(searchTerm) {
      const logEntries = document.querySelectorAll(".am-log-entry")
      logEntries.forEach((entry) => {
        const text = entry.textContent.toLowerCase()
        const matches = text.includes(searchTerm.toLowerCase())
        entry.style.display = matches ? "block" : "none"
      })
      this._updateStatusBar()
    }

    _showToast(message) {
      const toast = document.createElement("div")
      toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(16, 185, 129, 0.95);
                backdrop-filter: blur(20px);
                color: white;
                padding: 14px 20px;
                border-radius: 10px;
                z-index: 1000000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 13px;
                font-weight: 600;
                box-shadow: 
                    0 0 0 1px rgba(255, 255, 255, 0.1),
                    0 10px 25px rgba(0, 0, 0, 0.3),
                    0 0 30px rgba(16, 185, 129, 0.3);
                animation: amSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 10px;
            `
      toast.innerHTML = `
                <div style="
                    width: 6px;
                    height: 6px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
                "></div>
                <span>${message}</span>
            `

      const style = document.createElement("style")
      style.textContent = `
                @keyframes amSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes amSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `
      document.head.appendChild(style)

      document.body.appendChild(toast)

      setTimeout(() => {
        toast.style.animation = "amSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        setTimeout(() => {
          toast.remove()
          style.remove()
        }, 300)
      }, 2700)
    }

    // Analyze blocks in the substack
    _analyzeSubstackBlocks(util, substackName) {
      const target = util.target
      const thread = util.thread
      const blockId = thread.peekStack()

      if (!blockId) return []

      const block = target.blocks.getBlock(blockId)
      if (!block || !block.inputs[substackName]) return []

      const substackBlockId = block.inputs[substackName].block
      if (!substackBlockId) return []

      const analyzedBlocks = []
      let currentBlockId = substackBlockId

      while (currentBlockId) {
        const currentBlock = target.blocks.getBlock(currentBlockId)
        if (!currentBlock) break

        const blockInfo = {
          id: currentBlockId,
          opcode: currentBlock.opcode,
          inputs: {},
          fields: {},
          target: target.getName(),
          sprite: target.sprite.name,
        }

        // Get inputs
        if (currentBlock.inputs) {
          for (const [key, input] of Object.entries(currentBlock.inputs)) {
            if (input.block) {
              const inputBlock = target.blocks.getBlock(input.block)
              if (inputBlock) {
                blockInfo.inputs[key] = {
                  type: inputBlock.opcode,
                  value: this._getBlockValue(inputBlock, target),
                }
              }
            }
          }
        }

        // Get fields
        if (currentBlock.fields) {
          for (const [key, field] of Object.entries(currentBlock.fields)) {
            blockInfo.fields[key] = field.value
          }
        }

        analyzedBlocks.push(blockInfo)
        currentBlockId = currentBlock.next
      }

      return analyzedBlocks
    }

    _getBlockValue(block, target) {
      try {
        switch (block.opcode) {
          case "text":
            return block.fields.TEXT ? block.fields.TEXT.value : ""
          case "math_number":
            return block.fields.NUM ? block.fields.NUM.value : 0
          case "data_variable":
            const varId = block.fields.VARIABLE ? block.fields.VARIABLE.id : null
            return varId ? target.variables[varId].value : "undefined"
          default:
            return `[${block.opcode}]`
        }
      } catch {
        return "unknown"
      }
    }

    // Public methods for blocks
    recordInfo(args) {
      this._addLog("info", args.MESSAGE)
    }

    recordWarning(args) {
      this._addLog("warning", args.MESSAGE)
    }

    recordError(args) {
      this._addLog("error", args.MESSAGE)
    }

    recordDebug(args) {
      this._addLog("debug", args.MESSAGE)
    }

    trackAndExecute(args, util) {
      const startTime = Date.now()

      // Analyze the blocks in the substack
      const analyzedBlocks = this._analyzeSubstackBlocks(util, "SUBSTACK")
      const endTime = Date.now()
      const executionTime = endTime - startTime

      // Update performance metrics
      this.performanceMetrics.blockExecutions++
      this.performanceMetrics.totalExecutionTime += executionTime

      // Create summary message
      const blockTypes = analyzedBlocks.map((block) => block.opcode)
      const uniqueTypes = [...new Set(blockTypes)]

      let summaryMessage = ""
      if (analyzedBlocks.length === 0) {
        summaryMessage = "📦 Tracked empty block group"
      } else if (analyzedBlocks.length === 1) {
        summaryMessage = `📦 Tracked 1 block: ${analyzedBlocks[0].opcode}`
      } else {
        summaryMessage = `📦 Tracked ${analyzedBlocks.length} blocks (${uniqueTypes.length} types): ${uniqueTypes.slice(0, 3).join(", ")}${uniqueTypes.length > 3 ? "..." : ""}`
      }

      // Create detailed information
      const detailedInfo = {
        blocks: analyzedBlocks,
        target: util.target.getName(),
        sprite: util.target.sprite.name,
        executionTime: executionTime + "ms",
        summary: {
          totalBlocks: analyzedBlocks.length,
          uniqueTypes: uniqueTypes.length,
          blockTypes: uniqueTypes,
        },
      }

      // Add the log with expandable details
      this._addLog("info", summaryMessage, detailedInfo, true)

      // Execute the substack
      if (util.startBranch) {
        util.startBranch(1, false)
      }
    }

    showConsole() {
      this.consoleWindow.style.display = "flex"
      this.isConsoleOpen = true
    }

    hideConsole() {
      this.consoleWindow.style.display = "none"
      this.isConsoleOpen = false
    }

    showPerformance() {
      this.performanceWindow.style.display = "flex"
      this.isPerformanceOpen = true
    }

    hidePerformance() {
      this.performanceWindow.style.display = "none"
      this.isPerformanceOpen = false
    }

    eraseAllLogs() {
      this.logs = []
      this.logId = 0
      const container = document.getElementById("am-logs-container")
      if (container) {
        container.innerHTML = ""
      }
      this._updateStatusBar()
      this._addLog("info", "All logs erased")
    }

    getTotalLogs() {
      return this.logs.length
    }

    getRecentLog() {
      return this.logs.length > 0 ? this.logs[this.logs.length - 1].message : "No logs"
    }

    getCurrentFPS() {
      return this.performanceMetrics.fps
    }

    getBlockExecutions() {
      return this.performanceMetrics.blockExecutions
    }

    saveLogsToFile() {
      const logData = this.logs.map((log) => ({
        id: log.id,
        type: log.type,
        message: log.message,
        details: log.details,
        timestamp: log.timestamp.toISOString(),
        depth: log.depth,
        isExpandable: log.isExpandable,
      }))

      const dataStr = JSON.stringify(logData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `advanced-monitor-logs-${new Date().toISOString().split("T")[0]}.json`
      link.click()

      URL.revokeObjectURL(url)
      this._addLog("info", `Saved ${this.logs.length} logs to file`)
    }
  }

  Scratch.extensions.register(new AdvancedMonitorExtension())
})(window.Scratch)
