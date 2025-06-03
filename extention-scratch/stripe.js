// Extension Stripe qui MARCHE - Version corrigée
;((Scratch) => {
    class StripeExtension {
      constructor() {
        this.paymentStatus = "none"
        this.failReason = ""
        this.lastPaymentLink = ""
        this.apiBaseUrl = window.location.origin
  
        console.log("🚀 Stripe Extension loaded successfully!")
      }
  
      getInfo() {
        return {
          id: "stripePayments",
          name: "Stripe Payments",
          color1: "#6772E5",
          color2: "#5469D4",
          blocks: [
            {
              opcode: "openPayment",
              blockType: Scratch.BlockType.COMMAND,
              text: "open payment [LINK]",
              arguments: {
                LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "whenPaymentSuccess",
              blockType: Scratch.BlockType.HAT,
              text: "when payment succeeded for [LINK]",
              arguments: {
                LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
            {
              opcode: "whenPaymentFailed",
              blockType: Scratch.BlockType.HAT,
              text: "when payment failed for [LINK]",
              arguments: {
                LINK: {
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
              opcode: "getPaymentStatus",
              blockType: Scratch.BlockType.REPORTER,
              text: "payment status",
            },
            {
              opcode: "simulatePayment",
              blockType: Scratch.BlockType.COMMAND,
              text: "TEST: simulate [TYPE] for [LINK]",
              arguments: {
                TYPE: {
                  type: Scratch.ArgumentType.STRING,
                  menu: "testTypes",
                },
                LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/test_...",
                },
              },
            },
          ],
          menus: {
            testTypes: {
              acceptReporters: false,
              items: ["success", "cancelled", "failed"],
            },
          },
        }
      }
  
      openPayment(args) {
        const link = args.LINK
        this.lastPaymentLink = link
        this.paymentStatus = "pending"
        this.failReason = ""
  
        console.log(`💳 Opening payment: ${link}`)
  
        // Créer les URLs de retour
        const baseUrl = window.location.href.split("?")[0]
        const successUrl = `${baseUrl}?stripe_success=true&link=${encodeURIComponent(link)}`
        const cancelUrl = `${baseUrl}?stripe_cancel=true&link=${encodeURIComponent(link)}`
  
        // Ajouter les URLs au lien Stripe
        const separator = link.includes("?") ? "&" : "?"
        const fullUrl = `${link}${separator}success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`
  
        // Ouvrir le paiement
        window.open(fullUrl, "stripe_payment", "width=800,height=600")
  
        // Commencer à surveiller le retour
        this.startMonitoring()
      }
  
      startMonitoring() {
        const checkReturn = () => {
          const urlParams = new URLSearchParams(window.location.search)
          const success = urlParams.get("stripe_success")
          const cancel = urlParams.get("stripe_cancel")
          const link = urlParams.get("link")
  
          if (success === "true" && link) {
            this.handleSuccess(decodeURIComponent(link))
            this.cleanUrl()
          } else if (cancel === "true" && link) {
            this.handleFailure(decodeURIComponent(link), "cancelled")
            this.cleanUrl()
          } else if (this.paymentStatus === "pending") {
            setTimeout(checkReturn, 1000)
          }
        }
  
        setTimeout(checkReturn, 1000)
      }
  
      handleSuccess(link) {
        this.paymentStatus = "success"
        this.lastPaymentLink = link
        this.failReason = ""
  
        console.log(`✅ Payment succeeded: ${link}`)
  
        // Déclencher l'événement
        if (this.runtime) {
          this.runtime.startHats("stripePayments_whenPaymentSuccess", {
            LINK: link,
          })
        }
      }
  
      handleFailure(link, reason) {
        this.paymentStatus = "failed"
        this.lastPaymentLink = link
        this.failReason = reason
  
        console.log(`❌ Payment failed: ${link}, reason: ${reason}`)
  
        // Déclencher l'événement
        if (this.runtime) {
          this.runtime.startHats("stripePayments_whenPaymentFailed", {
            LINK: link,
          })
        }
      }
  
      whenPaymentSuccess(args) {
        return this.paymentStatus === "success" && this.lastPaymentLink === args.LINK
      }
  
      whenPaymentFailed(args) {
        return this.paymentStatus === "failed" && this.lastPaymentLink === args.LINK
      }
  
      getFailReason() {
        return this.failReason
      }
  
      getPaymentStatus() {
        return this.paymentStatus
      }
  
      simulatePayment(args) {
        const type = args.TYPE
        const link = args.LINK
  
        console.log(`🧪 Simulating ${type} payment for: ${link}`)
  
        // Simuler un délai
        setTimeout(() => {
          if (type === "success") {
            this.handleSuccess(link)
          } else {
            this.handleFailure(link, type)
          }
        }, 500)
      }
  
      cleanUrl() {
        const url = new URL(window.location)
        url.searchParams.delete("stripe_success")
        url.searchParams.delete("stripe_cancel")
        url.searchParams.delete("link")
        window.history.replaceState({}, document.title, url.toString())
      }
    }
  
    Scratch.extensions.register(new StripeExtension())
  })(Scratch)
  