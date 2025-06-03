;((Scratch) => {
    class SecureStripePurchaseExtension {
      constructor() {
        this.serverURL = "https://v0-scratch-extension-issue.vercel.app/api" // Remplace par ton URL Vercel
        this.purchasedItems = new Set()
        this.userId = this._generateUserId()
        this.checkIntervals = new Map()
  
        // Charger les achats précédents
        this._loadPurchasesFromServer()
      }
  
      getInfo() {
        return {
          id: "secureStripePurchase",
          name: "🔒 Secure Stripe Purchase",
          color1: "#635BFF",
          color2: "#4F46E5",
          blocks: [
            {
              opcode: "purchaseItem",
              blockType: Scratch.BlockType.COMMAND,
              text: "💳 Purchase [ITEM_NAME]",
              arguments: {
                ITEM_NAME: {
                  type: Scratch.ArgumentType.STRING,
                  menu: "ITEMS",
                },
              },
            },
            {
              opcode: "hasPurchased",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "Has purchased [ITEM_NAME]?",
              arguments: {
                ITEM_NAME: {
                  type: Scratch.ArgumentType.STRING,
                  menu: "ITEMS",
                },
              },
            },
            {
              opcode: "refreshPurchases",
              blockType: Scratch.BlockType.COMMAND,
              text: "🔄 Refresh purchases from server",
            },
            {
              opcode: "getPurchasedItems",
              blockType: Scratch.BlockType.REPORTER,
              text: "All purchased items",
            },
            {
              opcode: "getUserId",
              blockType: Scratch.BlockType.REPORTER,
              text: "User ID",
            },
            {
              opcode: "showPurchaseStatus",
              blockType: Scratch.BlockType.COMMAND,
              text: "📊 Show purchase status",
            },
          ],
          menus: {
            ITEMS: {
              acceptReporters: false,
              items: ["Premium Skin", "VIP Access", "Power Pack"],
            },
          },
        }
      }
  
      _generateUserId() {
        let userId = localStorage.getItem("secureStripeUserId")
        if (!userId) {
          userId = "user_" + Math.random().toString(36).substr(2, 12) + "_" + Date.now()
          localStorage.setItem("secureStripeUserId", userId)
        }
        return userId
      }
  
      async _loadPurchasesFromServer() {
        try {
          const response = await fetch(`${this.serverURL}/check-purchase?userId=${this.userId}`)
          if (response.ok) {
            const { purchases } = await response.json()
            this.purchasedItems = new Set(purchases)
            console.log("✅ Purchases loaded from server:", purchases)
          }
        } catch (error) {
          console.error("❌ Failed to load purchases from server:", error)
        }
      }
  
      async purchaseItem(args) {
        const itemName = args.ITEM_NAME
  
        if (this.purchasedItems.has(itemName)) {
          this._showNotification(`✅ ${itemName} already purchased!`, "info")
          return
        }
  
        try {
          // Créer une session de checkout sécurisée
          const response = await fetch(`${this.serverURL}/create-checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: this.userId,
              itemName: itemName,
              successUrl: `${window.location.origin}/success`,
              cancelUrl: `${window.location.origin}/cancel`,
            }),
          })
  
          if (!response.ok) {
            throw new Error("Failed to create checkout session")
          }
  
          const { sessionId, url } = await response.json()
  
          // Afficher la fenêtre de confirmation
          this._showCheckoutConfirmation(itemName, url, sessionId)
        } catch (error) {
          console.error("❌ Purchase failed:", error)
          this._showNotification("❌ Failed to start purchase", "error")
        }
      }
  
      _showCheckoutConfirmation(itemName, checkoutUrl, sessionId) {
        const overlay = document.createElement("div")
        overlay.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.8);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 999999;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `
  
        const modal = document.createElement("div")
        modal.style.cssText = `
                  background: white;
                  border-radius: 12px;
                  padding: 24px;
                  width: 420px;
                  max-width: 90vw;
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                  text-align: center;
              `
  
        // Définir les prix pour l'affichage
        const prices = {
          "Premium Skin": "€2.99",
          "VIP Access": "€4.99",
          "Power Pack": "€9.99",
        }
  
        modal.innerHTML = `
                  <div style="margin-bottom: 20px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #635BFF, #4F46E5); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 24px;">🔒</span>
                      </div>
                      <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Secure Purchase</h2>
                      <p style="margin: 0; color: #666; font-size: 14px;">Purchase "${itemName}" for ${prices[itemName] || "€?.??"}</p>
                  </div>
  
                  <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                          <span style="font-size: 16px;">🛡️</span>
                          <span style="color: #28a745; font-weight: 600; font-size: 14px;">Secured by Stripe</span>
                      </div>
                      <p style="margin: 0; color: #666; font-size: 12px;">
                          Your purchase will be automatically verified by our secure backend
                      </p>
                  </div>
  
                  <div style="display: flex; gap: 12px; margin-top: 24px;">
                      <button id="cancel-secure-purchase" style="
                          flex: 1;
                          padding: 12px 24px;
                          border: 2px solid #e1e5e9;
                          background: white;
                          color: #666;
                          border-radius: 8px;
                          font-size: 14px;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s;
                      ">Cancel</button>
                      <button id="proceed-secure-purchase" style="
                          flex: 2;
                          padding: 12px 24px;
                          border: none;
                          background: linear-gradient(135deg, #635BFF, #4F46E5);
                          color: white;
                          border-radius: 8px;
                          font-size: 14px;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s;
                      ">Continue to Stripe</button>
                  </div>
  
                  <p style="margin: 16px 0 0 0; color: #999; font-size: 11px;">
                      Session ID: ${sessionId.substring(0, 20)}...
                  </p>
              `
  
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
  
        // Event listeners
        modal.querySelector("#cancel-secure-purchase").addEventListener("click", () => {
          overlay.remove()
        })
  
        modal.querySelector("#proceed-secure-purchase").addEventListener("click", () => {
          // Ouvrir Stripe Checkout
          const checkoutWindow = window.open(
            checkoutUrl,
            "stripe-checkout",
            "width=800,height=600,scrollbars=yes,resizable=yes",
          )
          overlay.remove()
  
          // Commencer la vérification automatique
          this._startSecurePurchaseCheck(itemName, sessionId, checkoutWindow)
        })
  
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.remove()
          }
        })
      }
  
      _startSecurePurchaseCheck(itemName, sessionId, checkoutWindow) {
        this._showNotification(`🔄 Processing payment for ${itemName}...`, "info")
  
        let checkCount = 0
        const maxChecks = 180 // 6 minutes max
  
        const checkInterval = setInterval(async () => {
          checkCount++
  
          try {
            // Vérifier sur le serveur si l'achat est complété
            const response = await fetch(`${this.serverURL}/check-purchase`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: this.userId,
                itemName: itemName,
              }),
            })
  
            if (response.ok) {
              const { purchased } = await response.json()
  
              if (purchased) {
                // Achat confirmé par le serveur !
                this.purchasedItems.add(itemName)
                this._showNotification(`✅ ${itemName} purchased and verified!`, "success")
  
                // Fermer la fenêtre de checkout si elle est encore ouverte
                if (!checkoutWindow.closed) {
                  checkoutWindow.close()
                }
  
                clearInterval(checkInterval)
                this.checkIntervals.delete(itemName)
                return
              }
            }
          } catch (error) {
            console.error("Purchase verification error:", error)
          }
  
          // Vérifier si la fenêtre est fermée
          if (checkoutWindow.closed) {
            // Faire une dernière vérification
            setTimeout(() => {
              this._verifyPurchaseOnReturn(itemName)
            }, 2000)
  
            clearInterval(checkInterval)
            this.checkIntervals.delete(itemName)
            return
          }
  
          // Timeout
          if (checkCount >= maxChecks) {
            this._showNotification("⏰ Purchase verification timeout", "warning")
            clearInterval(checkInterval)
            this.checkIntervals.delete(itemName)
          }
        }, 2000) // Vérifier toutes les 2 secondes
  
        this.checkIntervals.set(itemName, checkInterval)
      }
  
      async _verifyPurchaseOnReturn(itemName) {
        try {
          const response = await fetch(`${this.serverURL}/check-purchase`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: this.userId,
              itemName: itemName,
            }),
          })
  
          if (response.ok) {
            const { purchased } = await response.json()
  
            if (purchased) {
              this.purchasedItems.add(itemName)
              this._showNotification(`✅ ${itemName} verified and unlocked!`, "success")
            } else {
              this._showNotification(`ℹ️ Purchase not detected for ${itemName}`, "info")
            }
          }
        } catch (error) {
          console.error("Final verification error:", error)
        }
      }
  
      async hasPurchased(args) {
        const itemName = args.ITEM_NAME
  
        // Vérifier d'abord localement
        if (this.purchasedItems.has(itemName)) {
          return true
        }
  
        // Vérifier sur le serveur
        try {
          const response = await fetch(`${this.serverURL}/check-purchase`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: this.userId,
              itemName: itemName,
            }),
          })
  
          if (response.ok) {
            const { purchased } = await response.json()
            if (purchased) {
              this.purchasedItems.add(itemName)
              return true
            }
          }
        } catch (error) {
          console.error("Purchase check error:", error)
        }
  
        return false
      }
  
      async refreshPurchases() {
        this._showNotification("🔄 Refreshing purchases...", "info")
        await this._loadPurchasesFromServer()
        this._showNotification("✅ Purchases refreshed", "success")
      }
  
      getPurchasedItems() {
        return JSON.stringify([...this.purchasedItems])
      }
  
      getUserId() {
        return this.userId
      }
  
      showPurchaseStatus() {
        this._createStatusWindow()
      }
  
      _createStatusWindow() {
        const overlay = document.createElement("div")
        overlay.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.8);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 999999;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `
  
        const modal = document.createElement("div")
        modal.style.cssText = `
                  background: white;
                  border-radius: 12px;
                  padding: 24px;
                  width: 450px;
                  max-width: 90vw;
                  max-height: 80vh;
                  overflow-y: auto;
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
              `
  
        const purchasedList = [...this.purchasedItems]
  
        modal.innerHTML = `
                  <div style="text-align: center; margin-bottom: 24px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #635BFF, #4F46E5); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 24px;">🔒</span>
                      </div>
                      <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Secure Purchase Status</h2>
                      <p style="margin: 0; color: #666; font-size: 14px;">User ID: ${this.userId}</p>
                  </div>
  
                  <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                          <span style="font-size: 16px;">📊</span>
                          <span style="font-weight: 600; color: #1a1a1a;">Statistics</span>
                      </div>
                      <div style="font-size: 14px; color: #666;">
                          Total verified purchases: <strong style="color: #28a745;">${purchasedList.length}</strong>
                      </div>
                  </div>
  
                  <div style="margin-bottom: 20px;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                          <span style="font-size: 16px;">🛍️</span>
                          <span style="font-weight: 600; color: #1a1a1a;">Verified Purchases</span>
                      </div>
                      ${
                        purchasedList.length === 0
                          ? '<div style="text-align: center; padding: 20px; color: #666; font-style: italic;">No verified purchases yet</div>'
                          : purchasedList
                              .map(
                                (item) => `
                              <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #e8f5e8; border-radius: 6px; margin-bottom: 6px;">
                                  <span style="color: #28a745;">🔒</span>
                                  <span style="color: #1a1a1a; font-weight: 500;">${item}</span>
                                  <span style="color: #28a745; font-size: 12px; margin-left: auto;">Verified</span>
                              </div>
                          `,
                              )
                              .join("")
                      }
                  </div>
  
                  <div style="display: flex; gap: 12px;">
                      <button id="refresh-purchases" style="
                          flex: 1;
                          padding: 12px;
                          border: 2px solid #635BFF;
                          background: white;
                          color: #635BFF;
                          border-radius: 8px;
                          font-size: 14px;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s;
                      ">🔄 Refresh</button>
                      <button id="close-status" style="
                          flex: 1;
                          padding: 12px;
                          border: none;
                          background: linear-gradient(135deg, #635BFF, #4F46E5);
                          color: white;
                          border-radius: 8px;
                          font-size: 14px;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s;
                      ">Close</button>
                  </div>
              `
  
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
  
        // Event listeners
        modal.querySelector("#refresh-purchases").addEventListener("click", async () => {
          await this.refreshPurchases()
          overlay.remove()
          setTimeout(() => this.showPurchaseStatus(), 500)
        })
  
        modal.querySelector("#close-status").addEventListener("click", () => {
          overlay.remove()
        })
  
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.remove()
          }
        })
      }
  
      _showNotification(message, type) {
        const colors = {
          success: "#28a745",
          error: "#dc3545",
          warning: "#ffc107",
          info: "#17a2b8",
        }
  
        const notification = document.createElement("div")
        notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: ${colors[type] || colors.info};
                  color: white;
                  padding: 12px 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                  z-index: 1000000;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 14px;
                  font-weight: 500;
                  max-width: 300px;
                  animation: slideIn 0.3s ease;
              `
  
        notification.textContent = message
  
        document.body.appendChild(notification)
  
        setTimeout(() => {
          notification.remove()
        }, 4000)
      }
    }
  
    Scratch.extensions.register(new SecureStripePurchaseExtension())
  })(window.Scratch)
  