;((Scratch) => {
    class AdminDashboardExtension {
      constructor() {
        this.playerID = this._generatePlayerID()
        this.playerName = ""
        this.serverURL = "https://v0-scratch-extension-issue.vercel.app/api" // ✅ URL correcte
        this.variables = {}
        this.syncInterval = null
        this.lastSyncTime = 0
        this.isConnected = false
        this.variableChangeEvents = {}
      }
  
      getInfo() {
        return {
          id: "adminDashboard",
          name: "Admin Dashboard",
          color1: "#4CAF50",
          color2: "#388E3C",
          blocks: [
            {
              opcode: "connect",
              blockType: Scratch.BlockType.COMMAND,
              text: "Connect to dashboard with name [NAME]",
              arguments: {
                NAME: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "Player",
                },
              },
            },
            {
              opcode: "disconnect",
              blockType: Scratch.BlockType.COMMAND,
              text: "Disconnect from dashboard",
            },
            {
              opcode: "registerVariable",
              blockType: Scratch.BlockType.COMMAND,
              text: "Register variable [VAR_NAME] with value [VALUE]",
              arguments: {
                VAR_NAME: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "score",
                },
                VALUE: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "0",
                },
              },
            },
            {
              opcode: "updateVariable",
              blockType: Scratch.BlockType.COMMAND,
              text: "Update variable [VAR_NAME] with value [VALUE]",
              arguments: {
                VAR_NAME: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "score",
                },
                VALUE: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "0",
                },
              },
            },
            {
              opcode: "getVariable",
              blockType: Scratch.BlockType.REPORTER,
              text: "Get variable [VAR_NAME] from dashboard",
              arguments: {
                VAR_NAME: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "score",
                },
              },
            },
            {
              opcode: "isConnected",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "Is connected to dashboard?",
            },
            {
              opcode: "onVariableChanged",
              blockType: Scratch.BlockType.HAT,
              text: "When variable [VAR_NAME] changed by admin",
              arguments: {
                VAR_NAME: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "score",
                },
              },
            },
            {
              opcode: "getPlayerID",
              blockType: Scratch.BlockType.REPORTER,
              text: "Player ID",
            },
            {
              opcode: "getAllVariables",
              blockType: Scratch.BlockType.REPORTER,
              text: "All variables as JSON",
            },
          ],
        }
      }
  
      _generatePlayerID() {
        const storedID = localStorage.getItem("scratchAdminDashboardPlayerID")
        if (storedID) return storedID
  
        const newID = "player_" + Math.random().toString(36).substr(2, 9)
        localStorage.setItem("scratchAdminDashboardPlayerID", newID)
        return newID
      }
  
      _startSync() {
        if (this.syncInterval) clearInterval(this.syncInterval)
  
        this.syncInterval = setInterval(() => {
          this._syncWithServer()
        }, 3000) // Sync every 3 seconds
  
        this._syncWithServer()
      }
  
      _stopSync() {
        if (this.syncInterval) {
          clearInterval(this.syncInterval)
          this.syncInterval = null
        }
        this.isConnected = false
      }
  
      async _syncWithServer() {
        try {
          const response = await fetch(`${this.serverURL}/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              playerID: this.playerID,
              playerName: this.playerName,
              variables: this.variables,
              timestamp: Date.now(),
            }),
          })
  
          if (!response.ok) throw new Error("Server sync failed")
  
          const data = await response.json()
  
          // Check for admin updates and trigger events
          for (const [varName, value] of Object.entries(data.variables || {})) {
            if (this.variables[varName] !== value) {
              console.log(`Variable ${varName} changed from ${this.variables[varName]} to ${value} by admin`)
  
              // Update the variable
              this.variables[varName] = value
  
              // Mark for HAT block triggering
              this.variableChangeEvents[varName] = true
  
              // Trigger hat block
              setTimeout(() => {
                Scratch.vm.runtime.startHats("adminDashboard_onVariableChanged", { VAR_NAME: varName })
              }, 100)
            }
          }
  
          this.lastSyncTime = Date.now()
          this.isConnected = true
        } catch (error) {
          console.error("Dashboard sync error:", error)
          this.isConnected = false
        }
      }
  
      connect(args) {
        this.playerName = args.NAME || "Player"
        this._startSync()
        console.log(`Connected to dashboard as ${this.playerName} (ID: ${this.playerID})`)
        return `Connected as ${this.playerName}`
      }
  
      disconnect() {
        this._stopSync()
        console.log("Disconnected from dashboard")
        return "Disconnected"
      }
  
      registerVariable(args) {
        const varName = args.VAR_NAME
        const value = args.VALUE
  
        this.variables[varName] = value
        console.log(`Registered variable: ${varName} = ${value}`)
        return `Registered ${varName}`
      }
  
      updateVariable(args) {
        const varName = args.VAR_NAME
        const value = args.VALUE
  
        if (this.variables.hasOwnProperty(varName)) {
          this.variables[varName] = value
          console.log(`Updated variable: ${varName} = ${value}`)
          return `Updated ${varName}`
        }
        return "Variable not found"
      }
  
      getVariable(args) {
        const varName = args.VAR_NAME
        return this.variables[varName] || "0"
      }
  
      isConnected() {
        return this.isConnected
      }
  
      onVariableChanged(args) {
        const varName = args.VAR_NAME
  
        // Check if this variable was changed by admin
        if (this.variableChangeEvents[varName]) {
          // Reset the flag so it only triggers once
          this.variableChangeEvents[varName] = false
          return true
        }
  
        return false
      }
  
      getPlayerID() {
        return this.playerID
      }
  
      getAllVariables() {
        return JSON.stringify(this.variables)
      }
    }
  
    Scratch.extensions.register(new AdminDashboardExtension())
  })(window.Scratch)