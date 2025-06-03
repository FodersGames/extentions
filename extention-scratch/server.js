;((Scratch) => {
    class SimpleAdminExtension {
      constructor() {
        this.playerName = ""
        this.serverURL = "https://v0-scratch-extension-issue.vercel.app/api"
        this.syncInterval = null
        this.isConnected = false
        this.lastVariables = {}
      }
  
      getInfo() {
        return {
          id: "simpleAdmin",
          name: "Simple Admin",
          color1: "#FF6B6B",
          color2: "#FF5252",
          blocks: [
            {
              opcode: "connectPlayer",
              blockType: Scratch.BlockType.COMMAND,
              text: "Connect player [NAME] to admin dashboard",
              arguments: {
                NAME: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "Player1",
                },
              },
            },
            {
              opcode: "isConnected",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "Connected to admin?",
            },
            {
              opcode: "disconnect",
              blockType: Scratch.BlockType.COMMAND,
              text: "Disconnect from admin",
            },
          ],
        }
      }
  
      // Get all variables from Scratch project
      _getAllVariables() {
        const variables = {}
  
        try {
          // Get all variables from the Scratch runtime
          const stage = Scratch.vm.runtime.getTargetForStage()
          const sprites = Scratch.vm.runtime.targets
  
          // Get stage variables
          if (stage && stage.variables) {
            for (const [id, variable] of Object.entries(stage.variables)) {
              variables[variable.name] = variable.value
            }
          }
  
          // Get sprite variables
          sprites.forEach((target) => {
            if (target.variables) {
              for (const [id, variable] of Object.entries(target.variables)) {
                variables[variable.name] = variable.value
              }
            }
          })
  
          console.log("Extracted variables:", variables)
        } catch (error) {
          console.error("Error extracting variables:", error)
        }
  
        return variables
      }
  
      // Apply variables back to Scratch
      _applyVariables(newVariables) {
        try {
          const stage = Scratch.vm.runtime.getTargetForStage()
          const sprites = Scratch.vm.runtime.targets
  
          // Apply to stage variables
          if (stage && stage.variables) {
            for (const [id, variable] of Object.entries(stage.variables)) {
              if (newVariables.hasOwnProperty(variable.name)) {
                variable.value = newVariables[variable.name]
                console.log(`Updated ${variable.name} to ${newVariables[variable.name]}`)
              }
            }
          }
  
          // Apply to sprite variables
          sprites.forEach((target) => {
            if (target.variables) {
              for (const [id, variable] of Object.entries(target.variables)) {
                if (newVariables.hasOwnProperty(variable.name)) {
                  variable.value = newVariables[variable.name]
                  console.log(`Updated ${variable.name} to ${newVariables[variable.name]}`)
                }
              }
            }
          })
        } catch (error) {
          console.error("Error applying variables:", error)
        }
      }
  
      async _syncWithServer() {
        if (!this.isConnected) return
  
        try {
          // Get current variables
          const currentVariables = this._getAllVariables()
  
          // Send to server
          const response = await fetch(`${this.serverURL}/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              playerName: this.playerName,
              variables: currentVariables,
            }),
          })
  
          if (!response.ok) throw new Error("Server sync failed")
  
          const data = await response.json()
  
          // Apply any changes from admin
          if (data.variables) {
            this._applyVariables(data.variables)
          }
  
          this.lastVariables = currentVariables
        } catch (error) {
          console.error("Sync error:", error)
          this.isConnected = false
        }
      }
  
      connectPlayer(args) {
        this.playerName = args.NAME || "Player1"
        this.isConnected = true
  
        console.log(`Connecting ${this.playerName} to admin dashboard...`)
  
        // Start syncing every 2 seconds
        if (this.syncInterval) clearInterval(this.syncInterval)
  
        this.syncInterval = setInterval(() => {
          this._syncWithServer()
        }, 2000)
  
        // Initial sync
        this._syncWithServer()
  
        return `Connected ${this.playerName} to admin`
      }
  
      isConnected() {
        return this.isConnected
      }
  
      disconnect() {
        this.isConnected = false
  
        if (this.syncInterval) {
          clearInterval(this.syncInterval)
          this.syncInterval = null
        }
  
        console.log("Disconnected from admin dashboard")
        return "Disconnected from admin"
      }
    }
  
    Scratch.extensions.register(new SimpleAdminExtension())
  })(window.Scratch)
  