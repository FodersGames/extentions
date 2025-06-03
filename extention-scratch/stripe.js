// Extension Scratch pour Stripe avec backend sécurisé
// Fichier: scratch-extension-with-backend.js

;((Scratch) => {
    class StripePaymentExtension {
      constructor() {
        this.apiBaseUrl = window.location.origin // URL de votre backend
        this.paymentStatus = "none"
        this.currentSession = null
        this.lastPurchase = null
        this.isPolling = false
      }
  
      getInfo() {
        return {
          id: "stripePayment",
          name: "Stripe Payment",
          color1: "#6772E5",
          color2: "#5469D4",
          blocks: [
            {
              opcode: "openPaymentLink",
              blockType: Scratch.BlockType.COMMAND,
              text: "open payment [PAYMENT_LINK] for user [USER_ID]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/...",
                },
                USER_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "player1",
                },
              },
            },
            {
              opcode: "verifyPayment",
              blockType: Scratch.BlockType.COMMAND,
              text: "verify payment with session [SESSION_ID] for user [USER_ID]",
              arguments: {
                SESSION_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "",
                },
                USER_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "player1",
                },
              },
            },
            {
              opcode: "checkPaymentStatus",
              blockType: Scratch.BlockType.COMMAND,
              text: "check payment status for session [SESSION_ID]",
              arguments: {
                SESSION_ID: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "",
                },
              },
            },
            {
              opcode: "waitForPaymentVerification",
              blockType: Scratch.BlockType.COMMAND,
              text: "wait for payment verification (check every [INTERVAL] seconds, timeout [TIMEOUT] seconds)",
              arguments: {
                INTERVAL: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 5,
                },
                TIMEOUT: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 300,
                },
              },
            },
            {
              opcode: "whenPaymentVerified",
              blockType: Scratch.BlockType.HAT,
              text: "when payment verified for [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/...",
                },
              },
            },
            {
              opcode: "getPaymentStatus",
              blockType: Scratch.BlockType.REPORTER,
              text: "payment status",
            },
            {
              opcode: "getLastPurchaseInfo",
              blockType: Scratch.BlockType.REPORTER,
              text: "last purchase [INFO]",
              arguments: {
                INFO: {
                  type: Scratch.ArgumentType.STRING,
                  menu: "infoMenu",
                  defaultValue: "amount",
                },
              },
            },
            {
              opcode: "isPaymentValid",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "is payment valid?",
            },
            {
              opcode: "getCurrentSessionId",
              blockType: Scratch.BlockType.REPORTER,
              text: "current session ID",
            },
          ],
          menus: {
            infoMenu: {
              acceptReporters: true,
              items: ["amount", "email", "sessionId", "timestamp"],
            },
          },
        }
      }
  
      openPaymentLink(args) {
        const { PAYMENT_LINK, USER_ID } = args
        const sessionId = this.generateSessionId()
  
        // Créer une session locale
        this.currentSession = {
          sessionId,
          userId: USER_ID,
          paymentLink: PAYMENT_LINK,
          timestamp: Date.now(),
          status: "initiated",
        }
  
        this.paymentStatus = "pending"
  
        // Créer l'URL avec les paramètres de session
        const returnUrl = window.location.href
        const successUrl = `${returnUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&user_id=${USER_ID}`
        const cancelUrl = `${returnUrl}?payment_cancelled=true&session_id={CHECKOUT_SESSION_ID}&user_id=${USER_ID}`
  
        // Ajouter les URLs au lien Stripe
        const separator = PAYMENT_LINK.includes("?") ? "&" : "?"
        const fullUrl = `${PAYMENT_LINK}${separator}success_url=${encodeURIComponent(
          successUrl,
        )}&cancel_url=${encodeURIComponent(cancelUrl)}&client_reference_id=${sessionId}_${USER_ID}`
  
        // Ouvrir le paiement
        window.open(fullUrl, "stripe_payment", "width=800,height=600")
  
        console.log(`Payment initiated for user ${USER_ID} with session ${sessionId}`)
      }
  
      async verifyPayment(args) {
        const { SESSION_ID, USER_ID } = args
  
        if (!SESSION_ID || !USER_ID) {
          this.paymentStatus = "error"
          return
        }
  
        try {
          const response = await fetch(`${this.apiBaseUrl}/api/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: SESSION_ID,
              userId: USER_ID,
              paymentLink: this.currentSession?.paymentLink,
            }),
          })
  
          const result = await response.json()
  
          if (result.success) {
            this.paymentStatus = "completed"
            this.lastPurchase = result.payment
  
            // Déclencher l'événement
            this.runtime.startHats("stripePayment_whenPaymentVerified", {
              PAYMENT_LINK: this.currentSession?.paymentLink || "",
            })
  
            console.log("Payment verified successfully!")
          } else {
            this.paymentStatus = "failed"
            console.error("Payment verification failed:", result.error)
          }
        } catch (error) {
          this.paymentStatus = "error"
          console.error("Error verifying payment:", error)
        }
      }
  
      async checkPaymentStatus(args) {
        const { SESSION_ID } = args
  
        if (!SESSION_ID) {
          return
        }
  
        try {
          const response = await fetch(
            `${this.apiBaseUrl}/api/payment/status?sessionId=${SESSION_ID}&userId=${this.currentSession?.userId || ""}`,
          )
  
          const result = await response.json()
          this.paymentStatus = result.status
  
          if (result.status === "completed" && result.details) {
            this.lastPurchase = {
              sessionId: SESSION_ID,
              amount: result.details.amount / 100, // Convertir de centimes
              email: result.details.email,
              timestamp: result.timestamp,
              valid: true,
            }
          }
  
          console.log("Payment status:", result.status)
        } catch (error) {
          console.error("Error checking payment status:", error)
          this.paymentStatus = "error"
        }
      }
  
      async waitForPaymentVerification(args) {
        const { INTERVAL, TIMEOUT } = args
        const intervalMs = INTERVAL * 1000
        const timeoutMs = TIMEOUT * 1000
        const startTime = Date.now()
  
        if (this.isPolling) {
          console.log("Already polling for payment")
          return
        }
  
        this.isPolling = true
  
        return new Promise((resolve) => {
          const checkPayment = async () => {
            // Vérifier les paramètres d'URL pour le retour de Stripe
            const urlParams = new URLSearchParams(window.location.search)
            const stripeSessionId = urlParams.get("session_id")
            const userId = urlParams.get("user_id")
  
            if (stripeSessionId && userId) {
              await this.verifyPayment({
                SESSION_ID: stripeSessionId,
                USER_ID: userId,
              })
              this.cleanUrl()
            }
  
            if (this.paymentStatus === "completed") {
              this.isPolling = false
              resolve()
            } else if (Date.now() - startTime > timeoutMs) {
              this.paymentStatus = "timeout"
              this.isPolling = false
              resolve()
            } else {
              setTimeout(checkPayment, intervalMs)
            }
          }
  
          checkPayment()
        })
      }
  
      whenPaymentVerified(args) {
        return true
      }
  
      getPaymentStatus() {
        return this.paymentStatus
      }
  
      getLastPurchaseInfo(args) {
        const { INFO } = args
        if (!this.lastPurchase) return ""
  
        switch (INFO) {
          case "amount":
            return this.lastPurchase.amount || 0
          case "email":
            return this.lastPurchase.email || ""
          case "sessionId":
            return this.lastPurchase.sessionId || ""
          case "timestamp":
            return this.lastPurchase.timestamp || ""
          default:
            return ""
        }
      }
  
      isPaymentValid() {
        if (!this.lastPurchase) return false
  
        // Vérifier que l'achat est récent (moins de 5 minutes)
        const fiveMinutes = 5 * 60 * 1000
        const purchaseTime = new Date(this.lastPurchase.timestamp).getTime()
        return Date.now() - purchaseTime < fiveMinutes
      }
  
      getCurrentSessionId() {
        return this.currentSession?.sessionId || ""
      }
  
      generateSessionId() {
        return "scratch_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
      }
  
      cleanUrl() {
        const url = new URL(window.location)
        url.searchParams.delete("payment_success")
        url.searchParams.delete("payment_cancelled")
        url.searchParams.delete("session_id")
        url.searchParams.delete("user_id")
        window.history.replaceState({}, document.title, url.toString())
      }
    }
  
    Scratch.extensions.register(new StripePaymentExtension())
  })(Scratch)
  