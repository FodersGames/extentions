;((Scratch) => {
  class AdvancedDebuggerExtension {
    constructor() {
      this.logs = []
      this.logId = 0
      this.consoleWindow = null
      this.isConsoleOpen = false
      this.filters = {
        info: true,
        warning: true,
        error: true,
        debug: true,
      }
      this.maxLogs = 1000
      this.executionDepth = 0

      this.watchedVariables = new Map() // varName -> { sprite, lastValue, history }
      this.variableHistory = new Map() // varName -> array of {value, timestamp}

      this.breakpoints = new Set() // Set of breakpoint IDs
      this.isPaused = false
      this.pauseResolve = null

      this.callStack = [] // Array of {blockName, opcode, timestamp, sprite}
      this.maxCallStackSize = 50

      // Initialize console
      this._createConsole()

      this._startVariableMonitoring()
    }

    getInfo() {
      return {
        id: "advancedDebugger",
        name: "Advanced Debugger",
        color1: "#2C3E50",
        color2: "#34495E",
        blocks: [
          {
            opcode: "logInfo",
            blockType: Scratch.BlockType.COMMAND,
            text: "Log Info: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Information message",
              },
            },
          },
          {
            opcode: "logWarning",
            blockType: Scratch.BlockType.COMMAND,
            text: "Log Warning: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Warning message",
              },
            },
          },
          {
            opcode: "logError",
            blockType: Scratch.BlockType.COMMAND,
            text: "Log Error: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Error message",
              },
            },
          },
          {
            opcode: "logDebug",
            blockType: Scratch.BlockType.COMMAND,
            text: "Log Debug: [MESSAGE]",
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Debug message",
              },
            },
          },
          "---",
          {
            opcode: "watchVariable",
            blockType: Scratch.BlockType.COMMAND,
            text: "Watch variable [VAR]",
            arguments: {
              VAR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "my variable",
              },
            },
          },
          {
            opcode: "unwatchVariable",
            blockType: Scratch.BlockType.COMMAND,
            text: "Unwatch variable [VAR]",
            arguments: {
              VAR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "my variable",
              },
            },
          },
          {
            opcode: "getVariableHistory",
            blockType: Scratch.BlockType.REPORTER,
            text: "history of [VAR]",
            arguments: {
              VAR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "my variable",
              },
            },
          },
          "---",
          {
            opcode: "setBreakpoint",
            blockType: Scratch.BlockType.COMMAND,
            text: "Breakpoint: [LABEL]",
            arguments: {
              LABEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "checkpoint 1",
              },
            },
          },
          {
            opcode: "removeBreakpoint",
            blockType: Scratch.BlockType.COMMAND,
            text: "Remove breakpoint [LABEL]",
            arguments: {
              LABEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "checkpoint 1",
              },
            },
          },
          {
            opcode: "continueExecution",
            blockType: Scratch.BlockType.COMMAND,
            text: "Continue execution",
          },
          {
            opcode: "isPaused",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "is paused?",
          },
          "---",
          {
            opcode: "pushCallStack",
            blockType: Scratch.BlockType.COMMAND,
            text: "Enter function [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "my function",
              },
            },
          },
          {
            opcode: "popCallStack",
            blockType: Scratch.BlockType.COMMAND,
            text: "Exit function",
          },
          {
            opcode: "getCallStackDepth",
            blockType: Scratch.BlockType.REPORTER,
            text: "call stack depth",
          },
          {
            opcode: "getCurrentFunction",
            blockType: Scratch.BlockType.REPORTER,
            text: "current function name",
          },
          "---",
          {
            opcode: "executeAndLog",
            blockType: Scratch.BlockType.LOOP,
            text: "Execute and Log Blocks",
            arguments: {
              SUBSTACK: {
                type: Scratch.ArgumentType.STRING,
                menu: "SUBSTACK",
              },
            },
          },
          {
            opcode: "openConsole",
            blockType: Scratch.BlockType.COMMAND,
            text: "Open Console",
          },
          {
            opcode: "closeConsole",
            blockType: Scratch.BlockType.COMMAND,
            text: "Close Console",
          },
          {
            opcode: "clearLogs",
            blockType: Scratch.BlockType.COMMAND,
            text: "Clear All Logs",
          },
          {
            opcode: "getLogCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "total logs count",
          },
          {
            opcode: "getLastLog",
            blockType: Scratch.BlockType.REPORTER,
            text: "last log message",
          },
          {
            opcode: "exportLogs",
            blockType: Scratch.BlockType.COMMAND,
            text: "Export Logs to File",
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
      this.consoleWindow.id = "advanced-debugger-console"
      this.consoleWindow.style.cssText = `
                position: fixed;
                top: 50px;
                right: 20px;
                width: 750px;
                height: 600px;
                background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
                border: 2px solid #3498DB;
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
                background: linear-gradient(90deg, #3498DB, #2980B9);
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
                <span>Advanced Debugger Console</span>
                <div>
                    <button id="minimize-console" style="background: #F39C12; border: none; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer;">−</button>
                    <button id="close-console" style="background: #E74C3C; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
                </div>
            `

      const pauseIndicator = document.createElement("div")
      pauseIndicator.id = "pause-indicator"
      pauseIndicator.style.cssText = `
                background: #E74C3C;
                color: white;
                padding: 8px 16px;
                display: none;
                align-items: center;
                justify-content: space-between;
                font-size: 12px;
                font-weight: bold;
                border-bottom: 1px solid #C0392B;
            `
      pauseIndicator.innerHTML = `
                <span>⏸️ EXECUTION PAUSED</span>
                <button id="continue-btn" style="background: #27AE60; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">▶️ Continue</button>
            `

      const tabBar = document.createElement("div")
      tabBar.style.cssText = `
                background: #34495E;
                display: flex;
                border-bottom: 2px solid #4A5F7A;
            `
      tabBar.innerHTML = `
                <button class="console-tab active" data-tab="logs" style="flex: 1; background: #3498DB; color: white; border: none; padding: 10px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">Logs</button>
                <button class="console-tab" data-tab="variables" style="flex: 1; background: transparent; color: #BDC3C7; border: none; padding: 10px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">Variables</button>
                <button class="console-tab" data-tab="callstack" style="flex: 1; background: transparent; color: #BDC3C7; border: none; padding: 10px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">Call Stack</button>
                <button class="console-tab" data-tab="breakpoints" style="flex: 1; background: transparent; color: #BDC3C7; border: none; padding: 10px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.2s;">Breakpoints</button>
            `

      // Create toolbar
      const toolbar = document.createElement("div")
      toolbar.style.cssText = `
                background: #34495E;
                padding: 8px 16px;
                border-bottom: 1px solid #4A5F7A;
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            `
      toolbar.innerHTML = `
                <button id="clear-logs-btn" style="background: #E74C3C; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Clear</button>
                <button id="export-logs-btn" style="background: #27AE60; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Export</button>
                <div style="height: 20px; width: 1px; background: #4A5F7A;"></div>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-info" checked style="accent-color: #3498DB;"> Info
                </label>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-warning" checked style="accent-color: #F39C12;"> Warning
                </label>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-error" checked style="accent-color: #E74C3C;"> Error
                </label>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-debug" checked style="accent-color: #9B59B6;"> Debug
                </label>
            `

      // Create search bar
      const searchBar = document.createElement("div")
      searchBar.style.cssText = `
                background: #34495E;
                padding: 8px 16px;
                border-bottom: 1px solid #4A5F7A;
            `
      searchBar.innerHTML = `
                <input type="text" id="search-logs" placeholder="Search logs..." style="
                    width: 100%;
                    background: #2C3E50;
                    border: 1px solid #4A5F7A;
                    color: #ECF0F1;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    outline: none;
                ">
            `

      const contentContainer = document.createElement("div")
      contentContainer.style.cssText = `
                flex: 1;
                overflow: hidden;
                position: relative;
            `

      // Logs container
      const logsContainer = document.createElement("div")
      logsContainer.id = "logs-container"
      logsContainer.className = "tab-content active"
      logsContainer.style.cssText = `
                height: 100%;
                overflow-y: auto;
                padding: 8px;
                background: #2C3E50;
                color: #ECF0F1;
                font-size: 12px;
                line-height: 1.4;
            `

      const variablesContainer = document.createElement("div")
      variablesContainer.id = "variables-container"
      variablesContainer.className = "tab-content"
      variablesContainer.style.cssText = `
                height: 100%;
                overflow-y: auto;
                padding: 8px;
                background: #2C3E50;
                color: #ECF0F1;
                font-size: 12px;
                display: none;
            `

      const callStackContainer = document.createElement("div")
      callStackContainer.id = "callstack-container"
      callStackContainer.className = "tab-content"
      callStackContainer.style.cssText = `
                height: 100%;
                overflow-y: auto;
                padding: 8px;
                background: #2C3E50;
                color: #ECF0F1;
                font-size: 12px;
                display: none;
            `

      const breakpointsContainer = document.createElement("div")
      breakpointsContainer.id = "breakpoints-container"
      breakpointsContainer.className = "tab-content"
      breakpointsContainer.style.cssText = `
                height: 100%;
                overflow-y: auto;
                padding: 8px;
                background: #2C3E50;
                color: #ECF0F1;
                font-size: 12px;
                display: none;
            `

      contentContainer.appendChild(logsContainer)
      contentContainer.appendChild(variablesContainer)
      contentContainer.appendChild(callStackContainer)
      contentContainer.appendChild(breakpointsContainer)

      // Create status bar
      const statusBar = document.createElement("div")
      statusBar.id = "status-bar"
      statusBar.style.cssText = `
                background: #34495E;
                color: #BDC3C7;
                padding: 6px 16px;
                border-top: 1px solid #4A5F7A;
                font-size: 11px;
                border-radius: 0 0 10px 10px;
            `
      statusBar.textContent = "Ready • 0 logs"

      // Assemble console
      this.consoleWindow.appendChild(header)
      this.consoleWindow.appendChild(pauseIndicator)
      this.consoleWindow.appendChild(tabBar)
      this.consoleWindow.appendChild(toolbar)
      this.consoleWindow.appendChild(searchBar)
      this.consoleWindow.appendChild(contentContainer)
      this.consoleWindow.appendChild(statusBar)

      // Add to document
      document.body.appendChild(this.consoleWindow)

      // Add event listeners
      this._addEventListeners()

      // Make draggable
      this._makeDraggable(header)
    }

    _addEventListeners() {
      // Close button
      document.getElementById("close-console").addEventListener("click", () => {
        this.closeConsole()
      })

      // Clear button
      document.getElementById("clear-logs-btn").addEventListener("click", () => {
        this.clearLogs()
      })

      // Export button
      document.getElementById("export-logs-btn").addEventListener("click", () => {
        this.exportLogs()
      })

      document
        .getElementById("continue-btn")
        .addEventListener("click", () => {
          this.continueExecution()
        })

      // Filter checkboxes
      ;["info", "warning", "error", "debug"].forEach((type) => {
        document.getElementById(`filter-${type}`).addEventListener("change", (e) => {
          this.filters[type] = e.target.checked
          this._refreshLogDisplay()
        })
      })

      // Search functionality
      document.getElementById("search-logs").addEventListener("input", (e) => {
        this._filterLogs(e.target.value)
      })

      document.querySelectorAll(".console-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
          const targetTab = e.target.dataset.tab
          this._switchTab(targetTab)
        })
      })
    }

    _switchTab(tabName) {
      // Update tab buttons
      document.querySelectorAll(".console-tab").forEach((tab) => {
        if (tab.dataset.tab === tabName) {
          tab.style.background = "#3498DB"
          tab.style.color = "white"
          tab.classList.add("active")
        } else {
          tab.style.background = "transparent"
          tab.style.color = "#BDC3C7"
          tab.classList.remove("active")
        }
      })

      // Update content visibility
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.style.display = "none"
      })

      const targetContent = document.getElementById(`${tabName}-container`)
      if (targetContent) {
        targetContent.style.display = "block"
      }

      // Refresh content based on tab
      if (tabName === "variables") {
        this._refreshVariablesDisplay()
      } else if (tabName === "callstack") {
        this._refreshCallStackDisplay()
      } else if (tabName === "breakpoints") {
        this._refreshBreakpointsDisplay()
      }
    }

    _startVariableMonitoring() {
      // Check variables every 100ms
      setInterval(() => {
        this._checkWatchedVariables()
      }, 100)
    }

    _checkWatchedVariables() {
      if (!window.vm || !window.vm.runtime) return

      this.watchedVariables.forEach((watchInfo, varName) => {
        const target = window.vm.runtime.targets.find((t) => t.sprite && t.sprite.name === watchInfo.sprite)
        if (!target) return

        // Find the variable
        const variable = Object.values(target.variables).find((v) => v.name === varName)
        if (!variable) return

        const currentValue = variable.value

        // Check if value changed
        if (currentValue !== watchInfo.lastValue) {
          const timestamp = new Date()

          // Update history
          if (!this.variableHistory.has(varName)) {
            this.variableHistory.set(varName, [])
          }

          const history = this.variableHistory.get(varName)
          history.push({
            value: currentValue,
            previousValue: watchInfo.lastValue,
            timestamp: timestamp,
            time: timestamp.toLocaleTimeString(),
          })

          // Limit history size
          if (history.length > 100) {
            history.shift()
          }

          // Log the change
          this._addLog(
            "debug",
            `Variable "${varName}" changed: ${watchInfo.lastValue} → ${currentValue}`,
            {
              variable: varName,
              oldValue: watchInfo.lastValue,
              newValue: currentValue,
              sprite: watchInfo.sprite,
            },
            true,
          )

          // Update last value
          watchInfo.lastValue = currentValue

          // Refresh variables display if tab is active
          const variablesTab = document.querySelector('.console-tab[data-tab="variables"]')
          if (variablesTab && variablesTab.classList.contains("active")) {
            this._refreshVariablesDisplay()
          }
        }
      })
    }

    _refreshVariablesDisplay() {
      const container = document.getElementById("variables-container")
      if (!container) return

      if (this.watchedVariables.size === 0) {
        container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #7F8C8D;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                        <div style="font-size: 14px; margin-bottom: 8px;">No variables being watched</div>
                        <div style="font-size: 12px;">Use the "watch variable" block to start monitoring</div>
                    </div>
                `
        return
      }

      let html = '<div style="padding: 8px;">'

      this.watchedVariables.forEach((watchInfo, varName) => {
        const history = this.variableHistory.get(varName) || []
        const changeCount = history.length

        html += `
                    <div style="background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498DB; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 16px;">📊</span>
                                <span style="color: #3498DB; font-weight: bold; font-size: 14px;">${this._escapeHtml(varName)}</span>
                            </div>
                            <button onclick="window.advancedDebugger.unwatchVariable({VAR: '${this._escapeHtml(varName)}'})" style="background: #E74C3C; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Unwatch</button>
                        </div>
                        <div style="font-size: 12px; color: #BDC3C7; margin-bottom: 8px;">
                            <strong>Current Value:</strong> <span style="color: #ECF0F1; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">${this._escapeHtml(String(watchInfo.lastValue))}</span>
                        </div>
                        <div style="font-size: 12px; color: #BDC3C7; margin-bottom: 8px;">
                            <strong>Sprite:</strong> ${this._escapeHtml(watchInfo.sprite)} • <strong>Changes:</strong> ${changeCount}
                        </div>
                        ${
                          history.length > 0
                            ? `
                            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                                <div style="color: #F39C12; font-weight: bold; margin-bottom: 8px; font-size: 11px;">Recent Changes:</div>
                                <div style="max-height: 150px; overflow-y: auto;">
                                    ${history
                                      .slice(-10)
                                      .reverse()
                                      .map(
                                        (change) => `
                                        <div style="font-size: 11px; padding: 4px 8px; background: rgba(0,0,0,0.2); border-radius: 4px; margin-bottom: 4px;">
                                            <span style="color: #7F8C8D;">${change.time}</span> • 
                                            <span style="color: #E74C3C;">${this._escapeHtml(String(change.previousValue))}</span> → 
                                            <span style="color: #27AE60;">${this._escapeHtml(String(change.value))}</span>
                                        </div>
                                    `,
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
      container.innerHTML = html
    }

    _refreshCallStackDisplay() {
      const container = document.getElementById("callstack-container")
      if (!container) return

      if (this.callStack.length === 0) {
        container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #7F8C8D;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                        <div style="font-size: 14px; margin-bottom: 8px;">Call stack is empty</div>
                        <div style="font-size: 12px;">Use "enter function" and "exit function" blocks to track execution flow</div>
                    </div>
                `
        return
      }

      let html = '<div style="padding: 8px;">'
      html += `<div style="color: #3498DB; font-weight: bold; margin-bottom: 12px; font-size: 13px;">Current Call Stack (${this.callStack.length} levels deep):</div>`

      this.callStack
        .slice()
        .reverse()
        .forEach((call, index) => {
          const depth = this.callStack.length - index - 1
          const indentPx = depth * 20

          html += `
                    <div style="margin-left: ${indentPx}px; margin-bottom: 8px;">
                        <div style="background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498DB; border-radius: 6px; padding: 10px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span style="font-size: 14px;">🔹</span>
                                <span style="color: #3498DB; font-weight: bold; font-size: 13px;">${this._escapeHtml(call.blockName)}</span>
                                <span style="color: #7F8C8D; font-size: 10px;">depth: ${depth}</span>
                            </div>
                            <div style="font-size: 11px; color: #BDC3C7;">
                                <strong>Sprite:</strong> ${this._escapeHtml(call.sprite)} • 
                                <strong>Entered:</strong> ${call.time}
                            </div>
                        </div>
                    </div>
                `
        })

      html += "</div>"
      container.innerHTML = html
    }

    _refreshBreakpointsDisplay() {
      const container = document.getElementById("breakpoints-container")
      if (!container) return

      if (this.breakpoints.size === 0) {
        container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #7F8C8D;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🔴</div>
                        <div style="font-size: 14px; margin-bottom: 8px;">No breakpoints set</div>
                        <div style="font-size: 12px;">Use the "breakpoint" block to pause execution at specific points</div>
                    </div>
                `
        return
      }

      let html = '<div style="padding: 8px;">'
      html += `<div style="color: #E74C3C; font-weight: bold; margin-bottom: 12px; font-size: 13px;">Active Breakpoints (${this.breakpoints.size}):</div>`

      this.breakpoints.forEach((label) => {
        html += `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 4px solid #E74C3C; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 16px;">🔴</span>
                                <span style="color: #E74C3C; font-weight: bold; font-size: 13px;">${this._escapeHtml(label)}</span>
                            </div>
                            <button onclick="window.advancedDebugger.removeBreakpoint({LABEL: '${this._escapeHtml(label)}'})" style="background: #27AE60; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Remove</button>
                        </div>
                    </div>
                `
      })

      html += "</div>"
      container.innerHTML = html
    }

    _makeDraggable(header) {
      let isDragging = false
      let currentX
      let currentY
      let initialX
      let initialY
      let xOffset = 0
      let yOffset = 0

      header.addEventListener("mousedown", (e) => {
        initialX = e.clientX - xOffset
        initialY = e.clientY - yOffset
        if (e.target === header || header.contains(e.target)) {
          isDragging = true
        }
      })

      document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          e.preventDefault()
          currentX = e.clientX - initialX
          currentY = e.clientY - initialY
          xOffset = currentX
          yOffset = currentY
          this.consoleWindow.style.transform = `translate(${currentX}px, ${currentY}px)`
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

      // Limit logs
      if (this.logs.length > this.maxLogs) {
        this.logs.shift()
      }

      // Add to display
      this._addLogToDisplay(log)
      this._updateStatusBar()

      // Auto-scroll to bottom
      const container = document.getElementById("logs-container")
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }

    _addLogToDisplay(log) {
      const container = document.getElementById("logs-container")
      if (!container) return

      const logElement = document.createElement("div")
      logElement.className = `log-entry log-${log.type}`
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
                <div class="log-header" style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            ${log.isExpandable ? `<span class="expand-icon" style="font-size: 12px; transition: transform 0.2s;">${expandIcon}</span>` : ""}
                            <span style="font-size: 14px;">${icon}</span>
                            <span style="color: ${this._getLogColor(log.type)}; font-weight: bold; font-size: 11px;">${typeText}</span>
                            <span style="color: #7F8C8D; font-size: 10px;">#${log.id}</span>
                            ${log.depth > 0 ? `<span style="color: #95A5A6; font-size: 10px;">depth:${log.depth}</span>` : ""}
                            ${log.isExpandable ? `<span style="color: #F39C12; font-size: 10px;">Click to expand</span>` : ""}
                        </div>
                        <div style="color: #ECF0F1; font-size: 13px; word-break: break-word;">
                            ${this._escapeHtml(log.message)}
                        </div>
                    </div>
                    <div style="color: #7F8C8D; font-size: 10px; white-space: nowrap;">
                        ${log.time}
                    </div>
                </div>
                ${
                  log.isExpandable && log.details
                    ? `
                    <div class="log-details" style="display: none; padding: 0 12px 12px 12px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 8px;">
                        <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 12px; margin-top: 8px;">
                            <div style="color: #F39C12; font-weight: bold; margin-bottom: 8px; font-size: 12px;">Detailed Analysis:</div>
                            ${this._formatDetails(log.details)}
                        </div>
                    </div>
                `
                    : ""
                }
            `

      // Add click handler for expandable logs
      if (log.isExpandable) {
        const header = logElement.querySelector(".log-header")
        const details = logElement.querySelector(".log-details")
        const expandIcon = logElement.querySelector(".expand-icon")

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

    _formatDetails(details) {
      if (details.blocks) {
        return this._formatBlockDetails(details)
      } else if (details.variable) {
        return `
                    <div style="font-size: 12px; color: #BDC3C7;">
                        <div><strong>Variable:</strong> ${this._escapeHtml(details.variable)}</div>
                        <div><strong>Old Value:</strong> <span style="color: #E74C3C;">${this._escapeHtml(String(details.oldValue))}</span></div>
                        <div><strong>New Value:</strong> <span style="color: #27AE60;">${this._escapeHtml(String(details.newValue))}</span></div>
                        <div><strong>Sprite:</strong> ${this._escapeHtml(details.sprite)}</div>
                    </div>
                `
      }
      return '<div style="color: #7F8C8D;">No additional details</div>'
    }

    _formatBlockDetails(details) {
      if (!details.blocks || details.blocks.length === 0) {
        return '<div style="color: #E74C3C;">No blocks found</div>'
      }

      let html = `
                <div style="margin-bottom: 12px;">
                    <span style="color: #3498DB;">Total Blocks:</span> <span style="color: #ECF0F1;">${details.blocks.length}</span><br>
                    <span style="color: #3498DB;">Target:</span> <span style="color: #ECF0F1;">${details.target}</span><br>
                    <span style="color: #3498DB;">Sprite:</span> <span style="color: #ECF0F1;">${details.sprite}</span><br>
                    <span style="color: #3498DB;">Execution Time:</span> <span style="color: #ECF0F1;">${details.executionTime}</span>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                    <div style="color: #F39C12; font-weight: bold; margin-bottom: 8px;">Block Details:</div>
            `

      details.blocks.forEach((block, index) => {
        html += `
                    <div style="background: rgba(0,0,0,0.2); border-radius: 4px; padding: 8px; margin-bottom: 6px; border-left: 3px solid #3498DB;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: #3498DB; font-weight: bold;">Block ${index + 1}</span>
                            <span style="color: #95A5A6; font-size: 10px;">${block.opcode}</span>
                        </div>
                        <div style="font-size: 11px; color: #BDC3C7;">
                            <strong>Opcode:</strong> <code style="background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 2px;">${block.opcode}</code>
                        </div>
                        ${
                          Object.keys(block.inputs).length > 0
                            ? `
                            <div style="font-size: 11px; color: #BDC3C7; margin-top: 4px;">
                                <strong>Inputs:</strong>
                                <div style="margin-left: 12px; margin-top: 2px;">
                                    ${Object.entries(block.inputs)
                                      .map(
                                        ([key, value]) =>
                                          `<div>• <span style="color: #F39C12;">${key}:</span> <span style="color: #ECF0F1;">${value.value}</span> <span style="color: #95A5A6;">(${value.type})</span></div>`,
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
                            <div style="font-size: 11px; color: #BDC3C7; margin-top: 4px;">
                                <strong>Fields:</strong>
                                <div style="margin-left: 12px; margin-top: 2px;">
                                    ${Object.entries(block.fields)
                                      .map(
                                        ([key, value]) =>
                                          `<div>• <span style="color: #E67E22;">${key}:</span> <span style="color: #ECF0F1;">${value}</span></div>`,
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
        warning: "#F39C12",
        error: "#E74C3C",
        debug: "#9B59B6",
      }
      return colors[type] || "#95A5A6"
    }

    _getLogBackground(type) {
      const backgrounds = {
        info: "rgba(52, 152, 219, 0.1)",
        warning: "rgba(243, 156, 18, 0.1)",
        error: "rgba(231, 76, 60, 0.1)",
        debug: "rgba(155, 89, 182, 0.1)",
      }
      return backgrounds[type] || "rgba(149, 165, 166, 0.1)"
    }

    _getLogHoverBackground(type) {
      const backgrounds = {
        info: "rgba(52, 152, 219, 0.2)",
        warning: "rgba(243, 156, 18, 0.2)",
        error: "rgba(231, 76, 60, 0.2)",
        debug: "rgba(155, 89, 182, 0.2)",
      }
      return backgrounds[type] || "rgba(149, 165, 166, 0.2)"
    }

    _getLogIcon(type) {
      const icons = {
        info: "📘",
        warning: "⚠️",
        error: "🔴",
        debug: "🔧",
      }
      return icons[type] || "📝"
    }

    _escapeHtml(text) {
      const div = document.createElement("div")
      div.textContent = text
      return div.innerHTML
    }

    _updateStatusBar() {
      const statusBar = document.getElementById("status-bar")
      if (statusBar) {
        const totalLogs = this.logs.length
        const visibleLogs = document.querySelectorAll('.log-entry:not([style*="display: none"])').length
        const watchedVars = this.watchedVariables.size
        const stackDepth = this.callStack.length
        statusBar.textContent = `Ready • ${totalLogs} logs • ${watchedVars} watched vars • Stack depth: ${stackDepth}`
      }
    }

    _refreshLogDisplay() {
      const container = document.getElementById("logs-container")
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
      const logEntries = document.querySelectorAll(".log-entry")
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
                animation: slideIn 0.3s ease;
            `
      toast.textContent = message

      // Add animation
      const style = document.createElement("style")
      style.textContent = `
                @keyframes slideIn {
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

    watchVariable(args, util) {
      const varName = args.VAR
      const sprite = util.target.sprite.name

      if (!this.watchedVariables.has(varName)) {
        // Find current value
        const variable = Object.values(util.target.variables).find((v) => v.name === varName)
        const currentValue = variable ? variable.value : "undefined"

        this.watchedVariables.set(varName, {
          sprite: sprite,
          lastValue: currentValue,
        })

        this._addLog("info", `Started watching variable "${varName}" (current value: ${currentValue})`)
        this._showToast(`Now watching: ${varName}`)
      } else {
        this._addLog("warning", `Variable "${varName}" is already being watched`)
      }
    }

    unwatchVariable(args) {
      const varName = args.VAR

      if (this.watchedVariables.has(varName)) {
        this.watchedVariables.delete(varName)
        this._addLog("info", `Stopped watching variable "${varName}"`)
        this._showToast(`Stopped watching: ${varName}`)
        this._refreshVariablesDisplay()
      } else {
        this._addLog("warning", `Variable "${varName}" is not being watched`)
      }
    }

    getVariableHistory(args) {
      const varName = args.VAR
      const history = this.variableHistory.get(varName)

      if (!history || history.length === 0) {
        return "No history"
      }

      return history.map((h) => `${h.time}: ${h.value}`).join(", ")
    }

    async setBreakpoint(args, util) {
      const label = args.LABEL
      this.breakpoints.add(label)

      this._addLog(
        "warning",
        `Breakpoint hit: "${label}"`,
        {
          label: label,
          sprite: util.target.sprite.name,
          callStack: [...this.callStack],
        },
        true,
      )

      // Show pause indicator
      const pauseIndicator = document.getElementById("pause-indicator")
      if (pauseIndicator) {
        pauseIndicator.style.display = "flex"
      }

      this.isPaused = true
      this._showToast(`Execution paused at: ${label}`)

      // Wait for continue
      await new Promise((resolve) => {
        this.pauseResolve = resolve
      })
    }

    removeBreakpoint(args) {
      const label = args.LABEL

      if (this.breakpoints.has(label)) {
        this.breakpoints.delete(label)
        this._addLog("info", `Removed breakpoint: "${label}"`)
        this._showToast(`Breakpoint removed: ${label}`)
        this._refreshBreakpointsDisplay()
      } else {
        this._addLog("warning", `Breakpoint "${label}" does not exist`)
      }
    }

    continueExecution() {
      if (this.isPaused && this.pauseResolve) {
        this.isPaused = false
        this.pauseResolve()
        this.pauseResolve = null

        // Hide pause indicator
        const pauseIndicator = document.getElementById("pause-indicator")
        if (pauseIndicator) {
          pauseIndicator.style.display = "none"
        }

        this._addLog("info", "Execution resumed")
        this._showToast("Execution resumed")
      }
    }

    isPaused() {
      return this.isPaused
    }

    pushCallStack(args, util) {
      const functionName = args.NAME
      const timestamp = new Date()

      const callInfo = {
        blockName: functionName,
        opcode: "custom_function",
        timestamp: timestamp,
        time: timestamp.toLocaleTimeString(),
        sprite: util.target.sprite.name,
      }

      this.callStack.push(callInfo)

      // Limit stack size
      if (this.callStack.length > this.maxCallStackSize) {
        this.callStack.shift()
      }

      this._addLog("debug", `Entered function: ${functionName}`)
      this._updateStatusBar()

      // Refresh call stack display if tab is active
      const callStackTab = document.querySelector('.console-tab[data-tab="callstack"]')
      if (callStackTab && callStackTab.classList.contains("active")) {
        this._refreshCallStackDisplay()
      }
    }

    popCallStack() {
      if (this.callStack.length > 0) {
        const callInfo = this.callStack.pop()
        this._addLog("debug", `Exited function: ${callInfo.blockName}`)
        this._updateStatusBar()

        // Refresh call stack display if tab is active
        const callStackTab = document.querySelector('.console-tab[data-tab="callstack"]')
        if (callStackTab && callStackTab.classList.contains("active")) {
          this._refreshCallStackDisplay()
        }
      } else {
        this._addLog("warning", "Call stack is empty, cannot pop")
      }
    }

    getCallStackDepth() {
      return this.callStack.length
    }

    getCurrentFunction() {
      if (this.callStack.length > 0) {
        return this.callStack[this.callStack.length - 1].blockName
      }
      return "none"
    }

    // Public methods for blocks
    logInfo(args) {
      this._addLog("info", args.MESSAGE)
    }

    logWarning(args) {
      this._addLog("warning", args.MESSAGE)
    }

    logError(args) {
      this._addLog("error", args.MESSAGE)
    }

    logDebug(args) {
      this._addLog("debug", args.MESSAGE)
    }

    executeAndLog(args, util) {
      const startTime = Date.now()

      // Analyze the blocks in the substack
      const analyzedBlocks = this._analyzeSubstackBlocks(util, "SUBSTACK")
      const endTime = Date.now()
      const executionTime = `${endTime - startTime}ms`

      // Create summary message
      const blockTypes = analyzedBlocks.map((block) => block.opcode)
      const uniqueTypes = [...new Set(blockTypes)]

      let summaryMessage = ""
      if (analyzedBlocks.length === 0) {
        summaryMessage = "Executed empty block group"
      } else if (analyzedBlocks.length === 1) {
        summaryMessage = `Executed 1 block: ${analyzedBlocks[0].opcode}`
      } else {
        summaryMessage = `Executed ${analyzedBlocks.length} blocks (${uniqueTypes.length} types): ${uniqueTypes.slice(0, 3).join(", ")}${uniqueTypes.length > 3 ? "..." : ""}`
      }

      // Create detailed information
      const detailedInfo = {
        blocks: analyzedBlocks,
        target: util.target.getName(),
        sprite: util.target.sprite.name,
        executionTime: executionTime,
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

    openConsole() {
      this.consoleWindow.style.display = "flex"
      this.isConsoleOpen = true
    }

    closeConsole() {
      this.consoleWindow.style.display = "none"
      this.isConsoleOpen = false
    }

    clearLogs() {
      this.logs = []
      this.logId = 0
      const container = document.getElementById("logs-container")
      if (container) {
        container.innerHTML = ""
      }
      this._updateStatusBar()
      this._addLog("info", "Logs cleared")
    }

    getLogCount() {
      return this.logs.length
    }

    getLastLog() {
      return this.logs.length > 0 ? this.logs[this.logs.length - 1].message : "No logs"
    }

    exportLogs() {
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
      link.download = `scratch-logs-${new Date().toISOString().split("T")[0]}.json`
      link.click()

      URL.revokeObjectURL(url)
      this._addLog("info", `Exported ${this.logs.length} logs to file`)
    }
  }

  const extension = new AdvancedDebuggerExtension()
  window.advancedDebugger = extension
  Scratch.extensions.register(extension)
})(window.Scratch)
