// Extension Stripe COMPLÈTE et FONCTIONNELLE pour Scratch
;((Scratch) => {
    if (!Scratch.extensions.unsandboxed) {
      throw new Error("Cette extension doit être exécutée en mode non-sandboxé")
    }
  
    class StripePaymentExtension {
      constructor(runtime) {
        this.runtime = runtime
        this.paymentStatus = "none"
        this.failReason = ""
        this.lastPaymentLink = ""
        this.currentSessionId = ""
        this.isMonitoring = false
        this.apiBaseUrl = window.location.origin
  
        // Initialisation
        this.init()
  
        console.log("🚀 Stripe Payment Extension loaded successfully!")
      }
  
      init() {
        // Écouter les changements d'URL
        this.setupUrlListener()
  
        // Écouter les messages entre fenêtres
        this.setupMessageListener()
  
        // Nettoyer l'URL au démarrage
        this.cleanUrl()
      }
  
      getInfo() {
        return {
          id: "stripePaymentExtension",
          name: "Stripe Payment",
          color1: "#6772E5",
          color2: "#5469D4",
          color3: "#4F46E5",
          docsURI: "https://stripe.com/docs",
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
              opcode: "getPaymentStatus",
              blockType: Scratch.BlockType.REPORTER,
              text: "payment status",
            },
            {
              opcode: "getFailReason",
              blockType: Scratch.BlockType.REPORTER,
              text: "payment fail reason",
            },
            {
              opcode: "getCurrentSessionId",
              blockType: Scratch.BlockType.REPORTER,
              text: "current session ID",
            },
            {
              opcode: "isPaymentPending",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "is payment pending?",
            },
            {
              opcode: "isPaymentValid",
              blockType: Scratch.BlockType.BOOLEAN,
              text: "is payment valid?",
            },
            {
              opcode: "simulatePayment",
              blockType: Scratch.BlockType.COMMAND,
              text: "TEST: simulate [TYPE] payment for [PAYMENT_LINK]",
              arguments: {
                TYPE: {
                  type: Scratch.ArgumentType.STRING,
                  menu: "simulationTypes",
                },
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "resetPaymentState",
              blockType: Scratch.BlockType.COMMAND,
              text: "reset payment state",
            },
          ],
          menus: {
            simulationTypes: {
              acceptReporters: false,
              items: [
                { text: "Success", value: "success" },
                { text: "Cancelled", value: "cancelled" },
                { text: "Failed", value: "failed" },
                { text: "Expired", value: "expired" },
              ],
            },
          },
        }
      }
  
      // === BLOCS PRINCIPAUX ===
  
      openPayment(args, util) {
        const paymentLink = this.validatePaymentLink(args.PAYMENT_LINK)
        if (!paymentLink) {
          this.setFailure("invalid_payment_link", "Invalid payment link provided")
          return
        }
  
        this.resetPaymentState()
        this.lastPaymentLink = paymentLink
        this.paymentStatus = "pending"
        this.currentSessionId = this.generateSessionId()
  
        console.log(`💳 Opening payment: ${paymentLink}`)
        console.log(`🔑 Session ID: ${this.currentSessionId}`)
  
        try {
          this.openStripePayment(paymentLink)
          this.startMonitoring()
        } catch (error) {
          console.error("❌ Error opening payment:", error)
          this.setFailure("payment_open_error", error.message)
        }
      }
  
      whenPaymentSuccess(args, util) {
        const paymentLink = args.PAYMENT_LINK
        const isMatch = this.paymentStatus === "success" && this.lastPaymentLink === paymentLink
  
        if (isMatch) {
          console.log(`✅ Payment success event triggered for: ${paymentLink}`)
        }
  
        return isMatch
      }
  
      whenPaymentFailed(args, util) {
        const paymentLink = args.PAYMENT_LINK
        const isMatch = this.paymentStatus === "failed" && this.lastPaymentLink === paymentLink
  
        if (isMatch) {
          console.log(`❌ Payment failed event triggered for: ${paymentLink}, reason: ${this.failReason}`)
        }
  
        return isMatch
      }
  
      getPaymentStatus(args, util) {
        return this.paymentStatus
      }
  
      getFailReason(args, util) {
        return this.failReason
      }
  
      getCurrentSessionId(args, util) {
        return this.currentSessionId
      }
  
      isPaymentPending(args, util) {
        return this.paymentStatus === "pending"
      }
  
      isPaymentValid(args, util) {
        return this.paymentStatus === "success" && this.lastPaymentLink !== ""
      }
  
      simulatePayment(args, util) {
        const type = args.TYPE
        const paymentLink = args.PAYMENT_LINK
  
        console.log(`🧪 Simulating ${type} payment for: ${paymentLink}`)
  
        this.lastPaymentLink = paymentLink
        this.currentSessionId = this.generateSessionId()
  
        // Simuler un délai réaliste
        setTimeout(() => {
          if (type === "success") {
            this.handlePaymentSuccess(paymentLink)
          } else {
            this.setFailure(type, `Simulated ${type} payment`)
            this.handlePaymentFailure(paymentLink, type)
          }
        }, 1000)
      }
  
      resetPaymentState(args, util) {
        this.paymentStatus = "none"
        this.failReason = ""
        this.lastPaymentLink = ""
        this.currentSessionId = ""
        this.isMonitoring = false
  
        console.log("🔄 Payment state reset")
      }
  
      // === MÉTHODES INTERNES ===
  
      validatePaymentLink(link) {
        if (!link || typeof link !== "string") {
          return null
        }
  
        // Vérifier que c'est un lien Stripe valide
        if (!link.includes("stripe.com") && !link.includes("buy.stripe.com")) {
          return null
        }
  
        return link.trim()
      }
  
      generateSessionId() {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substr(2, 9)
        return `scratch_${random}_${timestamp}`
      }
  
      openStripePayment(paymentLink) {
        // Créer les URLs de retour
        const baseUrl = this.getBaseUrl()
        const successUrl = `${baseUrl}?stripe_success=true&session_id={CHECKOUT_SESSION_ID}&payment_link=${encodeURIComponent(paymentLink)}`
        const cancelUrl = `${baseUrl}?stripe_cancelled=true&session_id={CHECKOUT_SESSION_ID}&payment_link=${encodeURIComponent(paymentLink)}`
  
        // Construire l'URL complète
        const separator = paymentLink.includes("?") ? "&" : "?"
        const fullUrl = `${paymentLink}${separator}success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&client_reference_id=${this.currentSessionId}`
  
        // Ouvrir dans une nouvelle fenêtre
        const paymentWindow = window.open(
          fullUrl,
          "stripe_payment",
          "width=800,height=600,scrollbars=yes,resizable=yes,status=yes",
        )
  
        if (!paymentWindow) {
          throw new Error("Failed to open payment window. Please allow popups.")
        }
  
        // Surveiller la fermeture de la fenêtre
        this.monitorPaymentWindow(paymentWindow)
      }
  
      monitorPaymentWindow(paymentWindow) {
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed)
            console.log("💼 Payment window closed")
  
            // Vérifier si on a reçu un résultat
            setTimeout(() => {
              if (this.paymentStatus === "pending") {
                this.setFailure("window_closed", "Payment window was closed without completion")
                this.handlePaymentFailure(this.lastPaymentLink, "window_closed")
              }
            }, 2000)
          }
        }, 1000)
      }
  
      setupUrlListener() {
        // Écouter les changements de focus (retour de la fenêtre de paiement)
        window.addEventListener("focus", () => {
          if (this.isMonitoring) {
            this.checkForPaymentReturn()
          }
        })
  
        // Écouter les changements d'URL
        window.addEventListener("popstate", () => {
          if (this.isMonitoring) {
            this.checkForPaymentReturn()
          }
        })
      }
  
      setupMessageListener() {
        window.addEventListener("message", (event) => {
          if (event.data && event.data.type === "stripe_payment_result") {
            this.handlePaymentMessage(event.data)
          }
        })
      }
  
      startMonitoring() {
        this.isMonitoring = true
  
        // Vérifier périodiquement
        const monitorInterval = setInterval(() => {
          if (!this.isMonitoring) {
            clearInterval(monitorInterval)
            return
          }
  
          this.checkForPaymentReturn()
  
          // Timeout après 10 minutes
          if (this.paymentStatus === "pending") {
            const now = Date.now()
            const sessionTime = Number.parseInt(this.currentSessionId.split("_").pop())
            if (now - sessionTime > 600000) {
              // 10 minutes
              this.setFailure("timeout", "Payment session timed out")
              this.handlePaymentFailure(this.lastPaymentLink, "timeout")
              this.isMonitoring = false
            }
          }
        }, 2000)
      }
  
      checkForPaymentReturn() {
        const urlParams = new URLSearchParams(window.location.search)
        const stripeSuccess = urlParams.get("stripe_success")
        const stripeCancelled = urlParams.get("stripe_cancelled")
        const sessionId = urlParams.get("session_id")
        const paymentLink = urlParams.get("payment_link")
  
        if (stripeSuccess === "true" && sessionId && paymentLink) {
          console.log(`✅ Payment success detected: ${sessionId}`)
          this.handlePaymentSuccess(decodeURIComponent(paymentLink), sessionId)
          this.cleanUrl()
        } else if (stripeCancelled === "true" && paymentLink) {
          console.log(`❌ Payment cancelled detected: ${sessionId}`)
          this.setFailure("cancelled", "Payment was cancelled by user")
          this.handlePaymentFailure(decodeURIComponent(paymentLink), "cancelled")
          this.cleanUrl()
        }
      }
  
      handlePaymentSuccess(paymentLink, sessionId = null) {
        this.paymentStatus = "success"
        this.lastPaymentLink = paymentLink
        this.failReason = ""
        this.isMonitoring = false
  
        if (sessionId) {
          this.currentSessionId = sessionId
        }
  
        console.log(`🎉 Payment succeeded for: ${paymentLink}`)
  
        // Déclencher l'événement HAT
        if (this.runtime) {
          this.runtime.startHats("stripePaymentExtension_whenPaymentSuccess", {
            PAYMENT_LINK: paymentLink,
          })
        }
      }
  
      handlePaymentFailure(paymentLink, reason) {
        this.paymentStatus = "failed"
        this.lastPaymentLink = paymentLink
        this.isMonitoring = false
  
        console.log(`💥 Payment failed for: ${paymentLink}, reason: ${reason}`)
  
        // Déclencher l'événement HAT
        if (this.runtime) {
          this.runtime.startHats("stripePaymentExtension_whenPaymentFailed", {
            PAYMENT_LINK: paymentLink,
          })
        }
      }
  
      setFailure(reason, message) {
        this.failReason = reason
        console.error(`❌ Payment failure: ${reason} - ${message}`)
      }
  
      getBaseUrl() {
        const url = new URL(window.location.href)
        return `${url.protocol}//${url.host}${url.pathname}`
      }
  
      cleanUrl() {
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete("stripe_success")
          url.searchParams.delete("stripe_cancelled")
          url.searchParams.delete("session_id")
          url.searchParams.delete("payment_link")
  
          if (url.href !== window.location.href) {
            window.history.replaceState({}, document.title, url.href)
          }
        } catch (error) {
          console.warn("Could not clean URL:", error)
        }
      }
  
      handlePaymentMessage(data) {
        const { success, sessionId, paymentLink, error } = data
  
        if (success) {
          this.handlePaymentSuccess(paymentLink, sessionId)
        } else {
          this.setFailure(error || "unknown", "Payment failed via message")
          this.handlePaymentFailure(paymentLink, error || "unknown")
        }
      }
    }
  
    // Enregistrer l'extension
    Scratch.extensions.register(new StripePaymentExtension())
  })(Scratch)
  