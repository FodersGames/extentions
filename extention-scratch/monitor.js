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
      // Create console window
      this.consoleWindow = document.createElement("div")
      this.consoleWindow.id = "advanced-monitor-console"
      this.consoleWindow.style.cssText = `
                position: fixed;
                top: 50px;
                right: 20px;
                width: 650px;
                height: 500px;
                background: linear-gradient(135deg, #16A085 0%, #1ABC9C 100%);
                border: 2px solid #48C9B0;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 999999;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                display: none;
                flex-direction: column;
                backdrop-filter: blur(10px);
            `

      // Create header
      const header = document.createElement("div")
      header.style.cssText = `
                background: linear-gradient(90deg, #1ABC9C, #16A085);
                color: white;
                padding: 12px 16px;
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                font-size: 14px;
                cursor: move;
            `
      header.innerHTML = `
                <span>🎯 Advanced Monitor Console</span>
                <div>
                    <button id="am-perf-btn" style="background: #9B59B6; border: none; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer; font-size: 11px;">📊 Perf</button>
                    <button id="am-minimize-console" style="background: #E67E22; border: none; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer;">−</button>
                    <button id="am-close-console" style="background: #C0392B; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
                </div>
            `

      // Create toolbar
      const toolbar = document.createElement("div")
      toolbar.style.cssText = `
                background: #148F77;
                padding: 8px 16px;
                border-bottom: 1px solid #1ABC9C;
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            `
      toolbar.innerHTML = `
                <button id="am-clear-logs-btn" style="background: #C0392B; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">🧹 Clear</button>
                <button id="am-export-logs-btn" style="background: #27AE60; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">💿 Save</button>
                <div style="height: 20px; width: 1px; background: #1ABC9C;"></div>
                <label style="color: #E8F8F5; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="am-filter-info" checked style="accent-color: #3498DB;"> 📗 Info
                </label>
                <label style="color: #E8F8F5; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="am-filter-warning" checked style="accent-color: #E67E22;"> ⚡ Warning
                </label>
                <label style="color: #E8F8F5; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="am-filter-error" checked style="accent-color: #C0392B;"> 🚨 Error
                </label>
                <label style="color: #E8F8F5; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="am-filter-debug" checked style="accent-color: #8E44AD;"> 🛠️ Debug
                </label>
            `

      // Create search bar
      const searchBar = document.createElement("div")
      searchBar.style.cssText = `
                background: #148F77;
                padding: 8px 16px;
                border-bottom: 1px solid #1ABC9C;
            `
      searchBar.innerHTML = `
                <input type="text" id="am-search-logs" placeholder="🔎 Search logs..." style="
                    width: 100%;
                    background: #117A65;
                    border: 1px solid #1ABC9C;
                    color: #E8F8F5;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    outline: none;
                ">
            `

      // Create logs container
      const logsContainer = document.createElement("div")
      logsContainer.id = "am-logs-container"
      logsContainer.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 8px;
                background: #117A65;
                color: #E8F8F5;
                font-size: 12px;
                line-height: 1.4;
            `

      // Create status bar
      const statusBar = document.createElement("div")
      statusBar.id = "am-status-bar"
      statusBar.style.cssText = `
                background: #148F77;
                color: #D5F4E6;
                padding: 6px 16px;
                border-top: 1px solid #1ABC9C;
                font-size: 11px;
                border-radius: 0 0 10px 10px;
            `
      statusBar.textContent = "Ready • 0 logs"

      // Assemble console
      this.consoleWindow.appendChild(header)
      this.consoleWindow.appendChild(toolbar)
      this.consoleWindow.appendChild(searchBar)
      this.consoleWindow.appendChild(logsContainer)
      this.consoleWindow.appendChild(statusBar)

      // Add to document
      document.body.appendChild(this.consoleWindow)

      // Add event listeners
      this._addConsoleEventListeners()

      // Make draggable
      this._makeDraggable(header, this.consoleWindow)
    }

    _createPerformanceMonitor() {
      // Create performance window
      this.performanceWindow = document.createElement("div")
      this.performanceWindow.id = "advanced-monitor-performance"
      this.performanceWindow.style.cssText = `
                position: fixed;
                top: 50px;
                left: 20px;
                width: 500px;
                height: 600px;
                background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
                border: 2px solid #BB8FCE;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 999998;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                display: none;
                flex-direction: column;
                backdrop-filter: blur(10px);
            `

      // Create header
      const perfHeader = document.createElement("div")
      perfHeader.style.cssText = `
                background: linear-gradient(90deg, #9B59B6, #8E44AD);
                color: white;
                padding: 12px 16px;
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                font-size: 14px;
                cursor: move;
            `
      perfHeader.innerHTML = `
                <span>📊 Performance Monitor</span>
                <div>
                    <button id="am-perf-reset" style="background: #E67E22; border: none; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer; font-size: 11px;">🔄 Reset</button>
                    <button id="am-close-perf" style="background: #C0392B; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
                </div>
            `

      // Create metrics container
      const metricsContainer = document.createElement("div")
      metricsContainer.id = "am-metrics-container"
      metricsContainer.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #7D3C98;
                color: #F4ECF7;
            `

      // Create real-time metrics display
      metricsContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border-left: 4px solid #3498DB;">
                        <div style="font-size: 11px; color: #D7BDE2; margin-bottom: 4px;">⚡ FPS</div>
                        <div id="am-fps-value" style="font-size: 28px; font-weight: bold; color: #3498DB;">0</div>
                        <div id="am-fps-bar" style="height: 4px; background: rgba(52, 152, 219, 0.3); border-radius: 2px; margin-top: 8px; overflow: hidden;">
                            <div id="am-fps-fill" style="height: 100%; background: #3498DB; width: 0%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border-left: 4px solid #E74C3C;">
                        <div style="font-size: 11px; color: #D7BDE2; margin-bottom: 4px;">🎯 Block Executions</div>
                        <div id="am-blocks-value" style="font-size: 28px; font-weight: bold; color: #E74C3C;">0</div>
                        <div style="font-size: 10px; color: #D7BDE2; margin-top: 4px;">Total tracked</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border-left: 4px solid #F39C12;">
                        <div style="font-size: 11px; color: #D7BDE2; margin-bottom: 4px;">⏱️ Avg Execution Time</div>
                        <div id="am-time-value" style="font-size: 28px; font-weight: bold; color: #F39C12;">0ms</div>
                        <div style="font-size: 10px; color: #D7BDE2; margin-top: 4px;">Per block group</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border-left: 4px solid #27AE60;">
                        <div style="font-size: 11px; color: #D7BDE2; margin-bottom: 4px;">📝 Log Rate</div>
                        <div id="am-lograte-value" style="font-size: 28px; font-weight: bold; color: #27AE60;">0</div>
                        <div style="font-size: 10px; color: #D7BDE2; margin-top: 4px;">Logs per second</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="font-size: 13px; font-weight: bold; color: #F4ECF7; margin-bottom: 12px;">📈 FPS History (Last 60s)</div>
                    <canvas id="am-fps-chart" width="450" height="120" style="width: 100%; background: rgba(0,0,0,0.2); border-radius: 4px;"></canvas>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="font-size: 13px; font-weight: bold; color: #F4ECF7; margin-bottom: 12px;">🎯 Block Execution History</div>
                    <canvas id="am-blocks-chart" width="450" height="120" style="width: 100%; background: rgba(0,0,0,0.2); border-radius: 4px;"></canvas>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 13px; font-weight: bold; color: #F4ECF7; margin-bottom: 8px;">ℹ️ System Information</div>
                    <div style="font-size: 11px; color: #D7BDE2; line-height: 1.6;">
                        <div>🖥️ User Agent: <span id="am-useragent" style="color: #F4ECF7;">Loading...</span></div>
                        <div>🌐 Platform: <span id="am-platform" style="color: #F4ECF7;">Loading...</span></div>
                        <div>⏰ Uptime: <span id="am-uptime" style="color: #F4ECF7;">0s</span></div>
                        <div>📊 Total Logs: <span id="am-total-logs" style="color: #F4ECF7;">0</span></div>
                    </div>
                </div>
            `

      // Assemble performance window
      this.performanceWindow.appendChild(perfHeader)
      this.performanceWindow.appendChild(metricsContainer)

      // Add to document
      document.body.appendChild(this.performanceWindow)

      // Add event listeners
      this._addPerformanceEventListeners()

      // Make draggable
      this._makeDraggable(perfHeader, this.performanceWindow)

      // Initialize system info
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

      // Add indentation based on execution depth
      const indentPx = log.depth * 20

      logElement.style.cssText = `
                margin-bottom: 4px;
                margin-left: ${indentPx}px;
                border-radius: 6px;
                border-left: 4px solid ${this._getLogColor(log.type)};
                background: ${this._getLogBackground(log.type)};
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                transition: all 0.2s ease;
                cursor: ${log.isExpandable ? "pointer" : "default"};
                overflow: hidden;
            `

      const icon = this._getLogIcon(log.type)
      const typeText = log.type.toUpperCase()
      const expandIcon = log.isExpandable ? "▶️" : ""

      logElement.innerHTML = `
                <div class="am-log-header" style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            ${log.isExpandable ? `<span class="am-expand-icon" style="font-size: 12px; transition: transform 0.2s;">${expandIcon}</span>` : ""}
                            <span style="font-size: 14px;">${icon}</span>
                            <span style="color: ${this._getLogColor(log.type)}; font-weight: bold; font-size: 11px;">${typeText}</span>
                            <span style="color: #A9DFBF; font-size: 10px;">#${log.id}</span>
                            ${log.depth > 0 ? `<span style="color: #D5F4E6; font-size: 10px;">depth:${log.depth}</span>` : ""}
                            ${log.isExpandable ? `<span style="color: #E67E22; font-size: 10px;">📋 Click to expand</span>` : ""}
                        </div>
                        <div style="color: #E8F8F5; font-size: 13px; word-break: break-word;">
                            ${this._escapeHtml(log.message)}
                        </div>
                    </div>
                    <div style="color: #A9DFBF; font-size: 10px; white-space: nowrap;">
                        ${log.time}
                    </div>
                </div>
                ${
                  log.isExpandable && log.details
                    ? `
                    <div class="am-log-details" style="display: none; padding: 0 12px 12px 12px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 8px;">
                        <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 12px; margin-top: 8px;">
                            <div style="color: #E67E22; font-weight: bold; margin-bottom: 8px; font-size: 12px;">📋 Detailed Block Analysis:</div>
                            ${this._formatBlockDetails(log.details)}
                        </div>
                    </div>
                `
                    : ""
                }
            `

      // Add click handler for expandable logs
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
          } else {
            details.style.display = "none"
            expandIcon.style.transform = "rotate(0deg)"
            logElement.style.background = this._getLogBackground(log.type)
          }
        })

        // Add hover effect
        header.addEventListener("mouseenter", () => {
          if (!log.isExpanded) {
            logElement.style.background = this._getLogHoverBackground(log.type)
          }
        })

        header.addEventListener("mouseleave", () => {
          if (!log.isExpanded) {
            logElement.style.background = this._getLogBackground(log.type)
          }
        })
      } else {
        // Regular click to copy for non-expandable logs
        logElement.addEventListener("click", () => {
          navigator.clipboard.writeText(`[${log.time}] ${typeText}: ${log.message}`)
          this._showToast("Log copied to clipboard!")
        })
      }

      container.appendChild(logElement)
    }

    _formatBlockDetails(details) {
      if (!details.blocks || details.blocks.length === 0) {
        return '<div style="color: #C0392B;">No blocks found</div>'
      }

      let html = `
                <div style="margin-bottom: 12px;">
                    <span style="color: #48C9B0;">📊 Total Blocks:</span> <span style="color: #E8F8F5;">${details.blocks.length}</span><br>
                    <span style="color: #48C9B0;">🎯 Target:</span> <span style="color: #E8F8F5;">${details.target}</span><br>
                    <span style="color: #48C9B0;">🎭 Sprite:</span> <span style="color: #E8F8F5;">${details.sprite}</span><br>
                    <span style="color: #48C9B0;">⏰ Execution Time:</span> <span style="color: #E8F8F5;">${details.executionTime}</span>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                    <div style="color: #E67E22; font-weight: bold; margin-bottom: 8px;">🔍 Block Details:</div>
            `

      details.blocks.forEach((block, index) => {
        html += `
                    <div style="background: rgba(0,0,0,0.2); border-radius: 4px; padding: 8px; margin-bottom: 6px; border-left: 3px solid #48C9B0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: #48C9B0; font-weight: bold;">Block ${index + 1}</span>
                            <span style="color: #D5F4E6; font-size: 10px;">${block.opcode}</span>
                        </div>
                        <div style="font-size: 11px; color: #D5F4E6;">
                            <strong>Opcode:</strong> <code style="background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 2px;">${block.opcode}</code>
                        </div>
                        ${
                          Object.keys(block.inputs).length > 0
                            ? `
                            <div style="font-size: 11px; color: #D5F4E6; margin-top: 4px;">
                                <strong>Inputs:</strong>
                                <div style="margin-left: 12px; margin-top: 2px;">
                                    ${Object.entries(block.inputs)
                                      .map(
                                        ([key, value]) =>
                                          `<div>• <span style="color: #E67E22;">${key}:</span> <span style="color: #E8F8F5;">${value.value}</span> <span style="color: #A9DFBF;">(${value.type})</span></div>`,
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
                            <div style="font-size: 11px; color: #D5F4E6; margin-top: 4px;">
                                <strong>Fields:</strong>
                                <div style="margin-left: 12px; margin-top: 2px;">
                                    ${Object.entries(block.fields)
                                      .map(
                                        ([key, value]) =>
                                          `<div>• <span style="color: #F39C12;">${key}:</span> <span style="color: #E8F8F5;">${value}</span></div>`,
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
        info: "#3498DB",
        warning: "#E67E22",
        error: "#C0392B",
        debug: "#8E44AD",
      }
      return colors[type] || "#A9DFBF"
    }

    _getLogBackground(type) {
      const backgrounds = {
        info: "rgba(52, 152, 219, 0.15)",
        warning: "rgba(230, 126, 34, 0.15)",
        error: "rgba(192, 57, 43, 0.15)",
        debug: "rgba(142, 68, 173, 0.15)",
      }
      return backgrounds[type] || "rgba(169, 223, 191, 0.1)"
    }

    _getLogHoverBackground(type) {
      const backgrounds = {
        info: "rgba(52, 152, 219, 0.25)",
        warning: "rgba(230, 126, 34, 0.25)",
        error: "rgba(192, 57, 43, 0.25)",
        debug: "rgba(142, 68, 173, 0.25)",
      }
      return backgrounds[type] || "rgba(169, 223, 191, 0.2)"
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
      if (statusBar) {
        const totalLogs = this.logs.length
        const visibleLogs = document.querySelectorAll('.am-log-entry:not([style*="display: none"])').length
        statusBar.textContent = `Ready • ${totalLogs} total logs • ${visibleLogs} visible`
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
                background: #27AE60;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                z-index: 1000000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: amSlideIn 0.3s ease;
            `
      toast.textContent = message

      // Add animation
      const style = document.createElement("style")
      style.textContent = `
                @keyframes amSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `
      document.head.appendChild(style)

      document.body.appendChild(toast)

      setTimeout(() => {
        toast.remove()
        style.remove()
      }, 3000)
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
