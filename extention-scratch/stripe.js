// Extension Stripe SIMPLE - Vérification directe
;((Scratch) => {
    class StripeExtensionSimple {
      constructor(runtime) {
        this.runtime = runtime
        this.paymentStatus = "none"
        this.currentPaymentLink = ""
        this.sessionId = ""
  
        console.log("🚀 Stripe Extension SIMPLE - Vérification directe")
      }
  
      getInfo() {
        return {
          id: "stripeSimple",
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
          this.showNotification("❌ Lien Stripe invalide", "error")
          return
        }
  
        console.log("💳 Ouverture du paiement:", paymentLink)
  
        // Reset du statut
        this.paymentStatus = "pending"
        this.currentPaymentLink = paymentLink
        this.sessionId = this.generateSessionId()
  
        // Ouvrir directement la fenêtre Stripe
        this.openStripeWindow(paymentLink)
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
  
      // === MÉTHODES INTERNES ===
  
      generateSessionId() {
        return "scratch_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
      }
  
      openStripeWindow(paymentLink) {
        console.log("🔗 Ouverture de la fenêtre Stripe")
  
        // Construire l'URL avec notre session ID comme client_reference_id
        const separator = paymentLink.includes("?") ? "&" : "?"
        const fullUrl = `${paymentLink}${separator}client_reference_id=${this.sessionId}`
  
        console.log("🌐 URL Stripe avec session:", fullUrl)
  
        const stripeWindow = window.open(fullUrl, "stripe_payment", "width=800,height=700,scrollbars=yes,resizable=yes")
  
        if (!stripeWindow) {
          this.showNotification("❌ Veuillez autoriser les popups", "error")
          this.handlePaymentFailed()
          return
        }
  
        this.showNotification("🔄 Fenêtre Stripe ouverte...", "info")
  
        // Surveiller la fermeture de la fenêtre
        this.monitorStripeWindow(stripeWindow)
      }
  
      monitorStripeWindow(stripeWindow) {
        console.log("👀 Surveillance de la fenêtre Stripe...")
  
        const checkClosed = setInterval(() => {
          if (stripeWindow.closed) {
            clearInterval(checkClosed)
            console.log("🔄 Fenêtre Stripe fermée, vérification...")
  
            // Vérifier le paiement directement avec l'API Image
            this.verifyPaymentWithImage()
          }
        }, 1000)
  
        // Timeout après 10 minutes
        setTimeout(() => {
          if (!stripeWindow.closed) {
            clearInterval(checkClosed)
            stripeWindow.close()
            this.handlePaymentFailed("Timeout - Paiement trop long")
          }
        }, 600000)
      }
  
      verifyPaymentWithImage() {
        // Utiliser une image pour contourner CORS
        // L'API renvoie une image 1x1 verte pour succès, rouge pour échec
        this.showNotification("🔍 Vérification du paiement...", "info")
  
        const img = new Image()
        img.crossOrigin = "anonymous" // Important pour éviter les erreurs CORS
  
        // Timestamp pour éviter le cache
        const timestamp = new Date().getTime()
  
        // URL de l'API qui renvoie une image selon le statut du paiement
        img.src = `https://v0-scratch-extension-issue.vercel.app/api/verify-image?sessionId=${this.sessionId}&t=${timestamp}`
  
        // Timeout après 10 secondes
        const timeout = setTimeout(() => {
          console.log("⏰ Timeout de vérification")
          this.handlePaymentFailed("Timeout de vérification")
        }, 10000)
  
        // Succès - Image verte chargée
        img.onload = () => {
          clearTimeout(timeout)
  
          // Vérifier la couleur de l'image (vert = succès)
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0)
  
          // Obtenir la couleur du pixel central
          const pixel = ctx.getImageData(0, 0, 1, 1).data
  
          // Si le pixel est vert (R<G et B<G), c'est un succès
          if (pixel[1] > pixel[0] && pixel[1] > pixel[2]) {
            console.log("✅ Paiement vérifié (image verte)")
            this.handlePaymentSuccess()
          } else {
            console.log("❌ Paiement non confirmé (image rouge)")
            this.handlePaymentFailed("Paiement non confirmé")
          }
        }
  
        // Erreur - Image non chargée
        img.onerror = () => {
          clearTimeout(timeout)
          console.log("❌ Erreur de vérification (image)")
          this.handlePaymentFailed("Erreur de vérification")
        }
      }
  
      handlePaymentSuccess() {
        this.paymentStatus = "success"
        console.log("🎉 Paiement confirmé!")
  
        this.showNotification("✅ Paiement confirmé!", "success")
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      handlePaymentFailed(reason = "Paiement non confirmé") {
        this.paymentStatus = "failed"
        console.log(`❌ Paiement échoué: ${reason}`)
  
        this.showNotification(`❌ ${reason}`, "error")
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      triggerHatBlocks() {
        if (!this.runtime) {
          console.warn("❌ Runtime Scratch non disponible")
          return
        }
  
        console.log(`🎯 Déclenchement des blocs HAT - Status: ${this.paymentStatus}`)
  
        try {
          if (this.paymentStatus === "success") {
            this.runtime.startHats("stripeSimple_whenPaymentSuccess")
          } else if (this.paymentStatus === "failed") {
            this.runtime.startHats("stripeSimple_whenPaymentFailed")
          }
        } catch (error) {
          console.error("❌ Erreur lors du déclenchement des HAT:", error)
        }
      }
  
      showNotification(message, type) {
        const colors = {
          success: "#28a745",
          error: "#dc3545",
          warning: "#ffc107",
          info: "#17a2b8",
        }
  
        const notification = document.createElement("div")
        notification.style.cssText = `
          position: fixed; top: 24px; right: 24px;
          background: ${colors[type] || colors.info}; color: white;
          padding: 16px 24px; border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          z-index: 1000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px; font-weight: 600; max-width: 400px;
        `
  
        notification.textContent = message
        document.body.appendChild(notification)
  
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove()
          }
        }, 5000)
      }
    }
  
    // Enregistrer l'extension
    Scratch.extensions.register(new StripeExtensionSimple())
  })(Scratch)
  