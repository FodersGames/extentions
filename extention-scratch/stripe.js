// Extension Scratch Stripe avec Backend - Version Finale
;((Scratch) => {
    class StripeBackendExtension {
      constructor() {
        this.apiBaseUrl = window.location.origin
        this.paymentStatus = "none"
        this.failReason = ""
        this.lastPaymentLink = ""
        this.isPolling = false
      }
  
      getInfo() {
        return {
          id: "stripeBackend",
          name: "Stripe Backend",
          color1: "#6772E5",
          color2: "#5469D4",
          blocks: [
            {
              opcode: "openPayment",
              blockType: Scratch.BlockType.COMMAND,
              text: "open payment [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "whenPaymentSuccess",
              blockType: Scratch.BlockType.HAT,
              text: "when payment succeeded for [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "whenPaymentFailed",
              blockType: Scratch.BlockType.HAT,
              text: "when payment failed for [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "getFailReason",
              blockType: Scratch.BlockType.REPORTER,
              text: "payment fail reason",
            },
            {
              opcode: "simulatePayment",
              blockType: Scratch.BlockType.COMMAND,
              text: "simulate payment [TYPE] for [PAYMENT_LINK]",
              arguments: {
                TYPE: {
                  type: Scratch.ArgumentType.STRING,
                  menu: "simulateMenu",
                  defaultValue: "success",
                },
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
          ],
          menus: {
            simulateMenu: {
              acceptReporters: false,
              items: ["success", "cancelled", "failed"],
            },
          },
        }
      }
  
      async openPayment(args) {
        const { PAYMENT_LINK } = args
        this.lastPaymentLink = PAYMENT_LINK
        this.paymentStatus = "pending"
        this.failReason = ""
  
        const sessionId = this.generateSessionId()
        const userId = "player1"
  
        // Créer les URLs de retour
        const baseUrl = window.location.origin + window.location.pathname
        const successUrl = `${baseUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&payment_link=${encodeURIComponent(PAYMENT_LINK)}`
        const cancelUrl = `${baseUrl}?payment_cancelled=true&session_id={CHECKOUT_SESSION_ID}&payment_link=${encodeURIComponent(PAYMENT_LINK)}`
  
        // Ajouter les paramètres au lien Stripe
        const separator = PAYMENT_LINK.includes("?") ? "&" : "?"
        const fullUrl = `${PAYMENT_LINK}${separator}success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&client_reference_id=${sessionId}_${userId}`
  
        // Ouvrir le paiement
        window.open(fullUrl, "stripe_payment", "width=800,height=600")
  
        // Commencer à vérifier le statut
        this.startPolling()
  
        console.log(`Payment opened: ${PAYMENT_LINK}`)
      }
  
      startPolling() {
        if (this.isPolling) return
        this.isPolling = true
  
        const checkPayment = async () => {
          // Vérifier les paramètres d'URL
          const urlParams = new URLSearchParams(window.location.search)
          const paymentSuccess = urlParams.get("payment_success")
          const paymentCancelled = urlParams.get("payment_cancelled")
          const sessionId = urlParams.get("session_id")
          const paymentLink = urlParams.get("payment_link")
  
          if (paymentSuccess === "true" && sessionId && paymentLink) {
            await this.verifyPayment(sessionId, decodeURIComponent(paymentLink))
            this.cleanUrl()
            this.isPolling = false
            return
          }
  
          if (paymentCancelled === "true" && paymentLink) {
            this.handlePaymentFailed(decodeURIComponent(paymentLink), "cancelled")
            this.cleanUrl()
            this.isPolling = false
            return
          }
  
          // Continuer à vérifier
          if (this.paymentStatus === "pending") {
            setTimeout(checkPayment, 2000)
          } else {
            this.isPolling = false
          }
        }
  
        checkPayment()
      }
  
      async verifyPayment(sessionId, paymentLink) {
        try {
          const response = await fetch(`${this.apiBaseUrl}/api/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: sessionId,
              userId: "player1",
              paymentLink: paymentLink,
            }),
          })
  
          const result = await response.json()
  
          if (result.success) {
            this.handlePaymentSuccess(paymentLink)
          } else {
            this.handlePaymentFailed(paymentLink, result.error || "verification_failed")
          }
        } catch (error) {
          console.error("Verification error:", error)
          this.handlePaymentFailed(paymentLink, "network_error")
        }
      }
  
      handlePaymentSuccess(paymentLink) {
        this.paymentStatus = "success"
        this.lastPaymentLink = paymentLink
        this.failReason = ""
  
        console.log(`✅ Payment verified: ${paymentLink}`)
  
        // Déclencher l'événement
        this.runtime.startHats("stripeBackend_whenPaymentSuccess", {
          PAYMENT_LINK: paymentLink,
        })
      }
  
      handlePaymentFailed(paymentLink, reason) {
        this.paymentStatus = "failed"
        this.lastPaymentLink = paymentLink
        this.failReason = reason
  
        console.log(`❌ Payment failed: ${paymentLink}, reason: ${reason}`)
  
        // Déclencher l'événement
        this.runtime.startHats("stripeBackend_whenPaymentFailed", {
          PAYMENT_LINK: paymentLink,
        })
      }
  
      whenPaymentSuccess(args) {
        const { PAYMENT_LINK } = args
        return this.paymentStatus === "success" && this.lastPaymentLink === PAYMENT_LINK
      }
  
      whenPaymentFailed(args) {
        const { PAYMENT_LINK } = args
        return this.paymentStatus === "failed" && this.lastPaymentLink === PAYMENT_LINK
      }
  
      getFailReason() {
        return this.failReason
      }
  
      async simulatePayment(args) {
        const { TYPE, PAYMENT_LINK } = args
  
        console.log(`🧪 Simulating ${TYPE} payment for: ${PAYMENT_LINK}`)
  
        // Simuler un délai
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        if (TYPE === "success") {
          this.handlePaymentSuccess(PAYMENT_LINK)
        } else {
          this.handlePaymentFailed(PAYMENT_LINK, TYPE)
        }
      }
  
      generateSessionId() {
        return "sim_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
      }
  
      cleanUrl() {
        const url = new URL(window.location)
        url.searchParams.delete("payment_success")
        url.searchParams.delete("payment_cancelled")
        url.searchParams.delete("session_id")
        url.searchParams.delete("payment_link")
        window.history.replaceState({}, document.title, url.toString())
      }
    }
  
    Scratch.extensions.register(new StripeBackendExtension())
  })(Scratch)
  