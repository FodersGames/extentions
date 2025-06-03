// Extension Stripe FINAL - Version CORS-proof
;((Scratch) => {
    class StripeExtensionFinal {
      constructor(runtime) {
        this.runtime = runtime
        this.paymentStatus = "none"
        this.currentPaymentLink = ""
        this.sessionId = ""
        this.checkAttempts = 0
        this.maxAttempts = 30
  
        console.log("🚀 Stripe Extension FINAL - Version CORS-proof")
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
        this.checkAttempts = 0
  
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
  
            // Attendre un peu pour laisser le temps au paiement d'être traité
            setTimeout(() => {
              this.startPaymentCheck()
            }, 2000)
          }
        }, 1000)
      }
  
      // Démarrer la vérification du paiement
      startPaymentCheck() {
        console.log("🔄 Démarrage de la vérification...")
        this.checkPaymentStatus()
      }
  
      // Vérifier le statut du paiement
      checkPaymentStatus() {
        this.checkAttempts++
        console.log(`🔍 Tentative ${this.checkAttempts}/${this.maxAttempts}`)
  
        // Utiliser une image pour contourner CORS
        const img = new Image()
  
        // Timestamp pour éviter le cache
        const timestamp = Date.now()
  
        // URL de l'API qui renvoie une image selon le statut du paiement
        img.src = `https://v0-scratch-extension-issue.vercel.app/api/verify-image?sessionId=${this.sessionId}&t=${timestamp}`
  
        // Succès - Image chargée
        img.onload = () => {
          // Vérifier la couleur de l'image (vert = succès, rouge = échec)
          try {
            const canvas = document.createElement("canvas")
            canvas.width = 1
            canvas.height = 1
            const ctx = canvas.getContext("2d")
            ctx.drawImage(img, 0, 0)
  
            // Obtenir la couleur du pixel
            const pixel = ctx.getImageData(0, 0, 1, 1).data
  
            // Vert = succès (R<G et B<G)
            if (pixel[1] > pixel[0] && pixel[1] > pixel[2]) {
              console.log("✅ Paiement vérifié (image verte)")
              this.paymentStatus = "success"
              this.triggerHatBlocks()
            }
            // Rouge = échec (R>G et R>B)
            else if (pixel[0] > pixel[1] && pixel[0] > pixel[2]) {
              console.log("❌ Paiement échoué (image rouge)")
              this.paymentStatus = "failed"
              this.triggerHatBlocks()
            }
            // Autre couleur = continuer à vérifier
            else {
              this.continueChecking()
            }
          } catch (error) {
            console.error("❌ Erreur analyse image:", error)
            this.continueChecking()
          }
        }
  
        // Erreur - Image non chargée
        img.onerror = () => {
          console.log("❌ Erreur chargement image")
          this.continueChecking()
        }
      }
  
      // Continuer à vérifier ou abandonner
      continueChecking() {
        if (this.checkAttempts < this.maxAttempts) {
          // Attendre 1 seconde avant la prochaine tentative
          setTimeout(() => {
            this.checkPaymentStatus()
          }, 1000)
        } else {
          console.log("⏰ Timeout après " + this.maxAttempts + " tentatives")
          this.paymentStatus = "failed"
          this.triggerHatBlocks()
        }
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
  