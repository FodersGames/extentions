// Extension Stripe PROPRE - Sans conflits
;((Scratch) => {
    if (!Scratch || !Scratch.extensions) {
      console.error("❌ Scratch not available")
      return
    }
  
    class CleanStripeExtension {
      constructor(runtime) {
        this.runtime = runtime
        this.purchasedItems = new Map()
        this.userId = this.generateUserId()
        this.lastPurchasedItem = ""
        this.serverURL = "https://v0-scratch-extension-issue.vercel.app/api"
  
        console.log("🚀 Clean Stripe Extension loaded")
        console.log("👤 User ID:", this.userId)
      }
  
      getInfo() {
        return {
          id: "cleanStripe",
          name: "🔒 Clean Stripe",
          color1: "#635BFF",
          color2: "#4F46E5",
          blocks: [
            {
              opcode: "purchaseItem",
              blockType: Scratch.BlockType.COMMAND,
              text: "💳 Purchase [ITEM_ID]",
              arguments: {
                ITEM_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "premium_coins",
                },
              },
            },
            {
              opcode: "whenPurchaseComplete",
              blockType: Scratch.BlockType.HAT,
              text: "🎉 When purchased [ITEM_ID]",
              arguments: {
                ITEM_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "premium_coins",
                },
              },
            },
            {
              opcode: "hasPurchased",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "Has purchased [ITEM_ID]?",
              arguments: {
                ITEM_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "premium_coins",
                },
              },
            },
            {
              opcode: "getPurchaseCount",
              blockType: Scratch.BlockType.REPORTER,
              text: "Purchase count [ITEM_ID]",
              arguments: {
                ITEM_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "premium_coins",
                },
              },
            },
            {
              opcode: "simulatePurchase",
              blockType: Scratch.BlockType.COMMAND,
              text: "🧪 TEST: Buy [ITEM_ID]",
              arguments: {
                ITEM_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "premium_coins",
                },
              },
            },
            {
              opcode: "getLastPurchased",
              blockType: Scratch.BlockType.REPORTER,
              text: "Last purchased item",
            },
            {
              opcode: "showStatus",
              blockType: Scratch.BlockType.COMMAND,
              text: "📊 Show purchase status",
            },
            {
              opcode: "getUserId",
              blockType: Scratch.BlockType.REPORTER,
              text: "User ID",
            },
          ],
        }
      }
  
      // === BLOCS PRINCIPAUX ===
  
      purchaseItem(args) {
        const itemId = args.ITEM_ID || "unknown"
        console.log("💳 Purchase requested:", itemId)
  
        this.showPurchaseDialog(itemId)
      }
  
      whenPurchaseComplete(args) {
        const itemId = args.ITEM_ID || ""
        return this.lastPurchasedItem === itemId
      }
  
      hasPurchased(args) {
        const itemId = args.ITEM_ID || ""
        return this.purchasedItems.has(itemId) && this.purchasedItems.get(itemId) > 0
      }
  
      getPurchaseCount(args) {
        const itemId = args.ITEM_ID || ""
        return this.purchasedItems.get(itemId) || 0
      }
  
      simulatePurchase(args) {
        const itemId = args.ITEM_ID || "test_item"
        console.log("🧪 Simulating purchase:", itemId)
  
        this.addPurchase(itemId)
        this.triggerPurchaseEvent(itemId)
        this.showNotification(`✅ TEST: Purchased ${itemId}`, "success")
      }
  
      getLastPurchased() {
        return this.lastPurchasedItem
      }
  
      showStatus() {
        this.createStatusDialog()
      }
  
      getUserId() {
        return this.userId
      }
  
      // === MÉTHODES INTERNES ===
  
      generateUserId() {
        let userId = null
        try {
          userId = localStorage.getItem("cleanStripeUserId")
          if (!userId) {
            userId = "user_" + Math.random().toString(36).substr(2, 12)
            localStorage.setItem("cleanStripeUserId", userId)
          }
        } catch (e) {
          userId = "user_" + Math.random().toString(36).substr(2, 12)
        }
        return userId
      }
  
      addPurchase(itemId) {
        const current = this.purchasedItems.get(itemId) || 0
        this.purchasedItems.set(itemId, current + 1)
      }
  
      triggerPurchaseEvent(itemId) {
        this.lastPurchasedItem = itemId
        console.log("🎉 Triggering purchase event for:", itemId)
  
        if (this.runtime) {
          this.runtime.startHats("cleanStripe_whenPurchaseComplete", {
            ITEM_ID: itemId,
          })
        }
      }
  
      showPurchaseDialog(itemId) {
        const overlay = this.createElement("div", {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "999999",
          fontFamily: "Arial, sans-serif",
        })
  
        const dialog = this.createElement("div", {
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          maxWidth: "90vw",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        })
  
        dialog.innerHTML = `
          <div style="margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background: #635BFF; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px; color: white;">🔒</span>
            </div>
            <h2 style="margin: 0 0 8px 0; color: #1a1a1a;">Purchase ${itemId}</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">Secure payment with Stripe</p>
          </div>
  
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button id="cancel-btn" style="
              flex: 1;
              padding: 12px;
              border: 2px solid #ddd;
              background: white;
              color: #666;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
            ">Cancel</button>
            <button id="purchase-btn" style="
              flex: 2;
              padding: 12px;
              border: none;
              background: #635BFF;
              color: white;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
            ">Continue to Stripe</button>
          </div>
        `
  
        overlay.appendChild(dialog)
        document.body.appendChild(overlay)
  
        // Event listeners
        dialog.querySelector("#cancel-btn").onclick = () => {
          overlay.remove()
        }
  
        dialog.querySelector("#purchase-btn").onclick = () => {
          overlay.remove()
          this.openStripePayment(itemId)
        }
  
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            overlay.remove()
          }
        }
      }
  
      openStripePayment(itemId) {
        console.log("🔗 Opening Stripe payment for:", itemId)
  
        // Simuler l'ouverture de Stripe
        const stripeUrl = `https://buy.stripe.com/test_${itemId}`
  
        try {
          const paymentWindow = window.open(stripeUrl, "stripe_payment", "width=800,height=600,scrollbars=yes")
  
          if (!paymentWindow) {
            this.showNotification("❌ Please allow popups", "error")
            return
          }
  
          this.showNotification("🔄 Payment window opened...", "info")
  
          // Simuler un retour après 5 secondes pour test
          setTimeout(() => {
            if (!paymentWindow.closed) {
              paymentWindow.close()
            }
            this.simulatePaymentReturn(itemId)
          }, 5000)
        } catch (error) {
          console.error("❌ Error opening payment:", error)
          this.showNotification("❌ Error opening payment", "error")
        }
      }
  
      simulatePaymentReturn(itemId) {
        this.addPurchase(itemId)
        this.triggerPurchaseEvent(itemId)
        this.showNotification(`✅ Payment completed for ${itemId}!`, "success")
      }
  
      createStatusDialog() {
        const overlay = this.createElement("div", {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "999999",
          fontFamily: "Arial, sans-serif",
        })
  
        const dialog = this.createElement("div", {
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "450px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        })
  
        const purchases = Array.from(this.purchasedItems.entries())
        const total = Array.from(this.purchasedItems.values()).reduce((sum, count) => sum + count, 0)
  
        dialog.innerHTML = `
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px 0; color: #1a1a1a;">Purchase Status</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">User: ${this.userId}</p>
          </div>
  
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 14px; color: #666;">
              Total purchases: <strong style="color: #28a745;">${total}</strong><br>
              Unique items: <strong style="color: #2196f3;">${purchases.length}</strong>
            </div>
          </div>
  
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">Purchased Items:</h3>
            ${
              purchases.length === 0
                ? '<p style="text-align: center; color: #666; font-style: italic;">No purchases yet</p>'
                : purchases
                    .map(
                      ([item, count]) => `
                <div style="display: flex; justify-content: space-between; padding: 8px; background: #e8f5e8; border-radius: 6px; margin-bottom: 6px;">
                  <span style="font-family: monospace;">${item}</span>
                  <span style="color: #2196f3;">x${count}</span>
                </div>
              `,
                    )
                    .join("")
            }
          </div>
  
          <button id="close-status" style="
            width: 100%;
            padding: 12px;
            border: none;
            background: #635BFF;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          ">Close</button>
        `
  
        overlay.appendChild(dialog)
        document.body.appendChild(overlay)
  
        dialog.querySelector("#close-status").onclick = () => {
          overlay.remove()
        }
  
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            overlay.remove()
          }
        }
      }
  
      createElement(tag, styles) {
        const element = document.createElement(tag)
        if (styles) {
          Object.assign(element.style, styles)
        }
        return element
      }
  
      showNotification(message, type) {
        const colors = {
          success: "#28a745",
          error: "#dc3545",
          warning: "#ffc107",
          info: "#17a2b8",
        }
  
        const notification = this.createElement("div", {
          position: "fixed",
          top: "20px",
          right: "20px",
          background: colors[type] || colors.info,
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          zIndex: "1000000",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          maxWidth: "300px",
        })
  
        notification.textContent = message
        document.body.appendChild(notification)
  
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove()
          }
        }, 4000)
      }
    }
  
    // Enregistrer l'extension
    try {
      Scratch.extensions.register(new CleanStripeExtension())
      console.log("✅ Extension registered successfully")
    } catch (error) {
      console.error("❌ Failed to register extension:", error)
    }
  })(window.Scratch)
  