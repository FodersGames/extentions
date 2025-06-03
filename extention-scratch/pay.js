;((Scratch) => {
    class SecureStripePurchaseExtension {
      constructor() {
        this.serverURL = "https://v0-scratch-extension-issue.vercel.app/api" // ✅ URL CORRECTE
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
              opcode: "purchaseWithLink",
              blockType: Scratch.BlockType.COMMAND,
              text: "💳 Purchase with link [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "hasPurchasedLink",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "Has purchased [PAYMENT_LINK]?",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
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
            {
              opcode: "testConnection",
              blockType: Scratch.BlockType.COMMAND,
              text: "🔧 Test server connection",
            },
          ],
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
  
      _extractProductIdFromLink(paymentLink) {
        // Extraire l'ID du produit depuis le Payment Link
        const match = paymentLink.match(/buy\.stripe\.com\/(test_)?(.+)$/)
        return match ? match[2] : paymentLink
      }
  
      async testConnection() {
        try {
          this._showNotification("🔧 Testing server connection...", "info")
  
          const response = await fetch(`${this.serverURL}/check-purchase?userId=test`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
  
          if (response.ok) {
            const data = await response.json()
            this._showNotification("✅ Server connection successful!", "success")
            console.log("Server response:", data)
          } else {
            this._showNotification(`❌ Server error: ${response.status}`, "error")
          }
        } catch (error) {
          console.error("Connection test failed:", error)
          this._showNotification("❌ Connection failed - Check server URL", "error")
        }
      }
  
      async _loadPurchasesFromServer() {
        try {
          const response = await fetch(`${this.serverURL}/check-purchase?userId=${this.userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
          if (response.ok) {
            const { purchases } = await response.json()
            this.purchasedItems = new Set(purchases)
            console.log("✅ Purchases loaded from server:", purchases)
          }
        } catch (error) {
          console.error("❌ Failed to load purchases from server:", error)
        }
      }
  
      async purchaseWithLink(args) {
        const paymentLink = args.PAYMENT_LINK.trim()
  
        console.log("Purchase attempt with link:", paymentLink)
  
        if (!paymentLink || !paymentLink.includes("buy.stripe.com")) {
          this._showNotification("❌ Invalid Stripe Payment Link", "error")
          return
        }
  
        const productId = this._extractProductIdFromLink(paymentLink)
        console.log("Extracted product ID:", productId)
  
        if (this.purchasedItems.has(productId)) {
          this._showNotification(`✅ Item already purchased!`, "info")
          return
        }
  
        try {
          this._showNotification("🔄 Processing payment link...", "info")
  
          // Créer une session de checkout avec le Payment Link
          const response = await fetch(`${this.serverURL}/create-checkout-link`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: this.userId,
              paymentLink: paymentLink,
              productId: productId,
            }),
          })
  
          console.log("API Response status:", response.status)
  
          if (!response.ok) {
            const errorData = await response.json()
            console.error("API Error:", errorData)
            throw new Error(errorData.error || "Failed to process payment link")
          }
  
          const { sessionId, url, productName } = await response.json()
          console.log("API Response:", { sessionId, url, productName })
  
          // Afficher la fenêtre de confirmation
          this._showCheckoutConfirmation(productName || "Item", url, sessionId, productId)
        } catch (error) {
          console.error("❌ Purchase failed:", error)
          this._showNotification(`❌ Failed to start purchase: ${error.message}`, "error")
        }
      }
  
      _showCheckoutConfirmation(itemName, checkoutUrl, sessionId, productId) {
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
  
        modal.innerHTML = `
                  <div style="margin-bottom: 20px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #635BFF, #4F46E5); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 24px;">🔒</span>
                      </div>
                      <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Secure Purchase</h2>
                      <p style="margin: 0; color: #666; font-size: 14px;">Purchase "${itemName}"</p>
                  </div>
  
                  <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                          <span style="font-size: 16px;">🛡️</span>
                          <span style="color: #28a745; font-weight: 600; font-size: 14px;">Secured by Stripe</span>
                      </div>
                      <p style="margin: 0; color: #666; font-size: 12px;">
                          You will be redirected to Stripe's secure payment page
                      </p>
                  </div>
  
                  <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin: 16px 0;">
                      <p style="margin: 0; color: #856404; font-size: 12px;">
                          <strong>Note:</strong> After payment, return to your game to verify the purchase.
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
                      Product ID: ${productId.substring(0, 20)}...
                  </p>
              `
  
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
  
        // Event listeners
        modal.querySelector("#cancel-secure-purchase").addEventListener("click", () => {
          overlay.remove()
        })
  
        modal.querySelector("#proceed-secure-purchase").addEventListener("click", () => {
          console.log("Opening payment link:", checkoutUrl)
  
          // Ouvrir le Payment Link dans une nouvelle fenêtre
          const checkoutWindow = window.open(
            checkoutUrl,
            "stripe-checkout",
            "width=800,height=600,scrollbars=yes,resizable=yes",
          )
  
          if (!checkoutWindow) {
            this._showNotification("❌ Popup blocked! Please allow popups and try again.", "error")
            return
          }
  
          overlay.remove()
  
          // Commencer la vérification automatique
          this._startSecurePurchaseCheck(itemName, productId, checkoutWindow)
        })
  
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.remove()
          }
        })
      }
  
      _startSecurePurchaseCheck(itemName, productId, checkoutWindow) {
        this._showNotification(`🔄 Waiting for payment completion...`, "info")
  
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
                productId: productId,
              }),
            })
  
            if (response.ok) {
              const { purchased } = await response.json()
  
              if (purchased) {
                // Achat confirmé par le serveur !
                this.purchasedItems.add(productId)
                this._showNotification(`✅ ${itemName} purchased and verified!`, "success")
  
                // Fermer la fenêtre de checkout si elle est encore ouverte
                if (!checkoutWindow.closed) {
                  checkoutWindow.close()
                }
  
                clearInterval(checkInterval)
                this.checkIntervals.delete(productId)
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
              this._verifyPurchaseOnReturn(productId)
            }, 2000)
  
            clearInterval(checkInterval)
            this.checkIntervals.delete(productId)
            return
          }
  
          // Timeout
          if (checkCount >= maxChecks) {
            this._showNotification(
              "⏰ Purchase verification timeout - Use 'Refresh purchases' to check manually",
              "warning",
            )
            clearInterval(checkInterval)
            this.checkIntervals.delete(productId)
          }
        }, 2000) // Vérifier toutes les 2 secondes
  
        this.checkIntervals.set(productId, checkInterval)
      }
  
      async _verifyPurchaseOnReturn(productId) {
        try {
          const response = await fetch(`${this.serverURL}/check-purchase`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: this.userId,
              productId: productId,
            }),
          })
  
          if (response.ok) {
            const { purchased } = await response.json()
  
            if (purchased) {
              this.purchasedItems.add(productId)
              this._showNotification(`✅ Item verified and unlocked!`, "success")
            } else {
              this._showNotification(`ℹ️ Purchase not detected yet - Use 'Refresh purchases' to check again`, "info")
            }
          }
        } catch (error) {
          console.error("Final verification error:", error)
        }
      }
  
      async hasPurchasedLink(args) {
        const paymentLink = args.PAYMENT_LINK.trim()
  
        if (!paymentLink || !paymentLink.includes("buy.stripe.com")) {
          return false
        }
  
        const productId = this._extractProductIdFromLink(paymentLink)
  
        // Vérifier d'abord localement
        if (this.purchasedItems.has(productId)) {
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
              productId: productId,
            }),
          })
  
          if (response.ok) {
            const { purchased } = await response.json()
            if (purchased) {
              this.purchasedItems.add(productId)
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
                      <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Purchase Status</h2>
                      <p style="margin: 0; color: #666; font-size: 14px;">User ID: ${this.userId}</p>
                      <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">Server: ${this.serverURL}</p>
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
                                  <span style="color: #1a1a1a; font-weight: 500; font-family: monospace; font-size: 12px;">${item}</span>
                                  <span style="color: #28a745; font-size: 12px; margin-left: auto;">Verified</span>
                              </div>
                          `,
                              )
                              .join("")
                      }
                  </div>
  
                  <div style="display: flex; gap: 12px;">
                      <button id="test-connection" style="
                          flex: 1;
                          padding: 12px;
                          border: 2px solid #17a2b8;
                          background: white;
                          color: #17a2b8;
                          border-radius: 8px;
                          font-size: 14px;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s;
                      ">🔧 Test</button>
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
        modal.querySelector("#test-connection").addEventListener("click", async () => {
          await this.testConnection()
        })
  
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
  