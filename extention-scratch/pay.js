;((Scratch) => {
    class SecureStripePurchaseExtension {
      constructor() {
        this.serverURL = "https://v0-scratch-extension-issue.vercel.app/api"
        this.purchasedItems = new Map() // ✅ Changé en Map pour compter les achats
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
              opcode: "getPurchaseCount",
              blockType: Scratch.BlockType.REPORTER,
              text: "Purchase count for [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            // ✅ BLOC ÉVÉNEMENT
            {
              opcode: "whenPurchaseCompleted",
              blockType: Scratch.BlockType.EVENT,
              text: "🎉 When purchase completed [PAYMENT_LINK]",
              isEdgeActivated: false,
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            // ✅ BLOC DE TEST TEMPORAIRE
            {
              opcode: "simulatePurchase",
              blockType: Scratch.BlockType.COMMAND,
              text: "🧪 TEST: Simulate purchase [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "getLastPurchasedItem",
              blockType: Scratch.BlockType.REPORTER,
              text: "Last purchased item",
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
  
      // ✅ NOUVELLE FONCTION POUR AJOUTER UN ACHAT (permet les multiples)
      _addPurchase(productId) {
        if (this.purchasedItems.has(productId)) {
          this.purchasedItems.set(productId, this.purchasedItems.get(productId) + 1)
        } else {
          this.purchasedItems.set(productId, 1)
        }
      }
  
      // ✅ FONCTION POUR OBTENIR LE NOMBRE D'ACHATS
      getPurchaseCount(args) {
        const paymentLink = args.PAYMENT_LINK.trim()
        if (!paymentLink || !paymentLink.includes("buy.stripe.com")) {
          return 0
        }
        const productId = this._extractProductIdFromLink(paymentLink)
        return this.purchasedItems.get(productId) || 0
      }
  
      // ✅ BLOC DE TEST POUR SIMULER UN ACHAT
      simulatePurchase(args) {
        const paymentLink = args.PAYMENT_LINK.trim()
  
        if (!paymentLink || !paymentLink.includes("buy.stripe.com")) {
          this._showNotification("❌ Invalid Stripe Payment Link", "error")
          return
        }
  
        const productId = this._extractProductIdFromLink(paymentLink)
  
        // ✅ PLUS DE LIMITATION - Toujours permettre l'achat
        this._addPurchase(productId)
        const count = this.purchasedItems.get(productId)
        this._showNotification(`🧪 TEST: Purchase #${count} simulated for ${productId}`, "info")
  
        // Déclencher l'événement
        this._triggerPurchaseEvent(productId, paymentLink)
      }
  
      // ✅ FONCTION POUR DÉCLENCHER L'ÉVÉNEMENT
      _triggerPurchaseEvent(productId, paymentLink) {
        this.lastPurchasedItem = productId
        this.lastPurchasedLink = paymentLink
  
        console.log("🎉 Triggering purchase event for:", productId)
  
        // Déclencher l'événement pour tous les blocs "When purchase completed"
        if (typeof Scratch !== "undefined" && Scratch.vm) {
          const targets = Scratch.vm.runtime.targets
          targets.forEach((target) => {
            const blocks = target.blocks._blocks
            Object.values(blocks).forEach((block) => {
              if (block.opcode === "secureStripePurchase_whenPurchaseCompleted") {
                const blockPaymentLink = block.inputs.PAYMENT_LINK?.block
                  ? blocks[block.inputs.PAYMENT_LINK.block]?.fields?.TEXT?.value || ""
                  : block.inputs.PAYMENT_LINK?.shadow
                    ? blocks[block.inputs.PAYMENT_LINK.shadow]?.fields?.TEXT?.value || ""
                    : ""
  
                const blockProductId = this._extractProductIdFromLink(blockPaymentLink)
  
                console.log("Checking event block:", { blockPaymentLink, blockProductId, currentProductId: productId })
  
                // Si le Payment Link correspond ou si c'est vide (pour tous les achats)
                if (!blockPaymentLink || blockProductId === productId || blockPaymentLink === paymentLink) {
                  console.log("✅ Triggering event for block:", block.id)
  
                  // Démarrer les blocs connectés à cet événement
                  Scratch.vm.runtime.startHats("secureStripePurchase_whenPurchaseCompleted", {
                    PAYMENT_LINK: blockPaymentLink,
                  })
                }
              }
            })
          })
        }
      }
  
      // Bloc événement (ne fait rien, c'est juste un déclencheur)
      whenPurchaseCompleted(args) {
        // Ce bloc ne s'exécute pas directement, il est déclenché par _triggerPurchaseEvent
        return true
      }
  
      getLastPurchasedItem() {
        return this.lastPurchasedItem || ""
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
            // ✅ Convertir le tableau en Map avec compteurs
            this.purchasedItems = new Map()
            purchases.forEach((productId) => {
              this._addPurchase(productId)
            })
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
  
        // ✅ PLUS DE VÉRIFICATION - Toujours permettre l'achat
        const currentCount = this.purchasedItems.get(productId) || 0
        this._showNotification(`🔄 Processing purchase #${currentCount + 1}...`, "info")
  
        try {
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
          this._showCheckoutConfirmation(productName || "Item", url, sessionId, productId, paymentLink)
        } catch (error) {
          console.error("❌ Purchase failed:", error)
          this._showNotification(`❌ Failed to start purchase: ${error.message}`, "error")
        }
      }
  
      _showCheckoutConfirmation(itemName, checkoutUrl, sessionId, productId, paymentLink) {
        const currentCount = this.purchasedItems.get(productId) || 0
  
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
                      <p style="margin: 0; color: #666; font-size: 14px;">Purchase "${itemName}" ${currentCount > 0 ? `(#${currentCount + 1})` : ""}</p>
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
  
                  ${
                    currentCount > 0
                      ? `<div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 12px; margin: 16px 0;">
                      <p style="margin: 0; color: #1976d2; font-size: 12px;">
                          <strong>Note:</strong> You already own ${currentCount} of this item. This will be purchase #${currentCount + 1}.
                      </p>
                  </div>`
                      : `<div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin: 16px 0;">
                      <p style="margin: 0; color: #856404; font-size: 12px;">
                          <strong>Note:</strong> After payment, return to your game to verify the purchase.
                      </p>
                  </div>`
                  }
  
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
          this._startSecurePurchaseCheck(itemName, productId, checkoutWindow, paymentLink)
        })
  
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.remove()
          }
        })
      }
  
      _startSecurePurchaseCheck(itemName, productId, checkoutWindow, paymentLink) {
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
                this._addPurchase(productId)
                const newCount = this.purchasedItems.get(productId)
                this._showNotification(`✅ ${itemName} purchased! (Total: ${newCount})`, "success")
  
                // ✅ DÉCLENCHER L'ÉVÉNEMENT D'ACHAT
                this._triggerPurchaseEvent(productId, paymentLink)
  
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
              this._verifyPurchaseOnReturn(productId, paymentLink)
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
  
      async _verifyPurchaseOnReturn(productId, paymentLink) {
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
              this._addPurchase(productId)
              const newCount = this.purchasedItems.get(productId)
              this._showNotification(`✅ Item verified! (Total: ${newCount})`, "success")
  
              // ✅ DÉCLENCHER L'ÉVÉNEMENT D'ACHAT
              this._triggerPurchaseEvent(productId, paymentLink)
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
  
        // ✅ Vérifier si l'utilisateur a au moins un achat de ce produit
        return this.purchasedItems.has(productId) && this.purchasedItems.get(productId) > 0
      }
  
      async refreshPurchases() {
        this._showNotification("🔄 Refreshing purchases...", "info")
        await this._loadPurchasesFromServer()
        this._showNotification("✅ Purchases refreshed", "success")
      }
  
      getPurchasedItems() {
        const items = []
        for (const [productId, count] of this.purchasedItems) {
          items.push(`${productId} (x${count})`)
        }
        return JSON.stringify(items)
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
  
        const purchasedList = Array.from(this.purchasedItems.entries())
        const totalPurchases = Array.from(this.purchasedItems.values()).reduce((sum, count) => sum + count, 0)
  
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
                          Total purchases: <strong style="color: #28a745;">${totalPurchases}</strong><br>
                          Unique items: <strong style="color: #2196f3;">${purchasedList.length}</strong>
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
                                ([productId, count]) => `
                              <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #e8f5e8; border-radius: 6px; margin-bottom: 6px;">
                                  <span style="color: #28a745;">🔒</span>
                                  <span style="color: #1a1a1a; font-weight: 500; font-family: monospace; font-size: 12px;">${productId}</span>
                                  <span style="color: #2196f3; font-size: 12px; margin-left: auto; background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">x${count}</span>
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
  