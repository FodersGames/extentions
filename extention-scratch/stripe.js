// Extension Stripe FINAL - Vérification backend automatique
;((Scratch) => {
    class StripeExtensionFinal {
      constructor(runtime) {
        this.runtime = runtime
        this.paymentStatus = "none"
        this.currentPaymentLink = ""
        this.sessionId = ""
  
        console.log("🚀 Stripe Extension FINAL - Vérification backend automatique")
      }
  
      getInfo() {
        return {
          id: "stripeFinal",
          name: "💳 Stripe Payments",
          color1: "#6772E5",
          color2: "#4F46E5",
          blocks: [
            {
              opcode: "openPayment",
              blockType: Scratch.BlockType.COMMAND,
              text: "💳 Open payment [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/...",
                },
              },
            },
            {
              opcode: "whenPaymentSuccess",
              blockType: Scratch.BlockType.HAT,
              text: "✅ When payment succeeded for [PAYMENT_LINK]",
              arguments: {
                PAYMENT_LINK: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: "https://buy.stripe.com/...",
                },
              },
            },
            {
              opcode: "whenPaymentFailed",
              blockType: Scratch.BlockType.HAT,
              text: "❌ When payment failed for [PAYMENT_LINK]",
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
              opcode: "getSessionId",
              blockType: Scratch.BlockType.REPORTER,
              text: "session ID",
            },
          ],
        }
      }
  
      // === BLOC PRINCIPAL ===
      openPayment(args) {
        const paymentLink = args.PAYMENT_LINK.trim()
  
        if (!paymentLink || !paymentLink.includes("stripe.com")) {
          console.error("❌ Lien Stripe invalide")
          return
        }
  
        console.log("💳 Ouverture du paiement:", paymentLink)
  
        // Reset du statut
        this.paymentStatus = "pending"
        this.currentPaymentLink = paymentLink
        this.sessionId = "scratch_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
  
        // Ouvrir la fenêtre Stripe
        const separator = paymentLink.includes("?") ? "&" : "?"
        const fullUrl = `${paymentLink}${separator}client_reference_id=${this.sessionId}`
  
        console.log("🌐 URL Stripe:", fullUrl)
  
        const stripeWindow = window.open(fullUrl, "stripe_payment", "width=800,height=700")
  
        if (!stripeWindow) {
          console.error("❌ Popup bloqué")
          this.paymentStatus = "failed"
          this.triggerHatBlocks()
          return
        }
  
        // Surveiller la fermeture de la fenêtre
        const checkClosed = setInterval(() => {
          if (stripeWindow.closed) {
            clearInterval(checkClosed)
            console.log("🔄 Fenêtre fermée, vérification backend...")
  
            // Vérifier avec le backend
            this.verifyPaymentWithBackend()
          }
        }, 1000)
      }
  
      // Vérification backend via JSONP (contourne CORS)
      verifyPaymentWithBackend() {
        console.log("🔍 Vérification backend en cours...")
  
        // Créer un callback unique
        const callbackName = "stripeCallback_" + Date.now()
  
        // Créer la promesse
        const verificationPromise = new Promise((resolve, reject) => {
          // Timeout après 10 secondes
          const timeout = setTimeout(() => {
            delete window[callbackName]
            reject(new Error("Timeout de vérification"))
          }, 10000)
  
          // Définir le callback global
          window[callbackName] = (result) => {
            clearTimeout(timeout)
            delete window[callbackName]
  
            if (result.success) {
              resolve(result)
            } else {
              reject(new Error(result.error || "Vérification échouée"))
            }
          }
        })
  
        // Créer le script JSONP
        const script = document.createElement("script")
        script.src = `https://v0-scratch-extension-issue.vercel.app/api/verify-payment?sessionId=${this.sessionId}&paymentLink=${encodeURIComponent(this.currentPaymentLink)}&callback=${callbackName}`
  
        // Ajouter le script
        document.head.appendChild(script)
  
        // Gérer la réponse
        verificationPromise
          .then((result) => {
            console.log("✅ Vérification réussie:", result)
            this.paymentStatus = "success"
            this.triggerHatBlocks()
          })
          .catch((error) => {
            console.error("❌ Vérification échouée:", error)
            this.paymentStatus = "failed"
            this.triggerHatBlocks()
          })
          .finally(() => {
            // Nettoyer le script
            if (script.parentNode) {
              script.parentNode.removeChild(script)
            }
          })
      }
  
      // === ÉVÉNEMENTS HAT ===
      whenPaymentSuccess(args) {
        const link = args.PAYMENT_LINK.trim()
        const currentLink = this.currentPaymentLink.trim()
        return this.paymentStatus === "success" && currentLink === link
      }
  
      whenPaymentFailed(args) {
        const link = args.PAYMENT_LINK.trim()
        const currentLink = this.currentPaymentLink.trim()
        return this.paymentStatus === "failed" && currentLink === link
      }
  
      // === REPORTERS ===
      getPaymentStatus() {
        return this.paymentStatus
      }
  
      getSessionId() {
        return this.sessionId
      }
  
      // Déclencher les blocs HAT
      triggerHatBlocks() {
        if (!this.runtime) {
          console.warn("❌ Runtime Scratch non disponible")
          return
        }
  
        console.log(`🎯 Déclenchement des blocs HAT - Status: ${this.paymentStatus}`)
  
        try {
          if (this.paymentStatus === "success") {
            this.runtime.startHats("stripeFinal_whenPaymentSuccess", { PAYMENT_LINK: this.currentPaymentLink })
          } else if (this.paymentStatus === "failed") {
            this.runtime.startHats("stripeFinal_whenPaymentFailed", { PAYMENT_LINK: this.currentPaymentLink })
          }
        } catch (error) {
          console.error("❌ Erreur lors du déclenchement des HAT:", error)
        }
      }
    }
  
    // Enregistrer l'extension
    Scratch.extensions.register(new StripeExtensionFinal())
  })(Scratch)
  