// Extension Stripe FINALE - Correction Payment Links 0€
;((Scratch) => {
    class StripeExtensionFinal {
      constructor(runtime) {
        this.runtime = runtime
        this.paymentStatus = "none"
        this.currentPaymentLink = ""
        this.sessionId = ""
        this.isChecking = false
  
        console.log("🚀 Stripe Extension FINALE chargée - Version Debug")
      }
  
      getInfo() {
        return {
          id: "stripeFinal",
          name: "💳 Stripe Final",
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
                  defaultValue: "https://buy.stripe.com/test_...",
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
                  defaultValue: "https://buy.stripe.com/test_...",
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
  
        console.log("📝 État après ouverture:")
        console.log("  Status:", this.paymentStatus)
        console.log("  Link:", this.currentPaymentLink)
        console.log("  Session:", this.sessionId)
  
        // Vérifier si c'est un Payment Link à 0€
        this.checkZeroAmountWarning()
  
        // Afficher l'interface de redirection
        this.showRedirectInterface(paymentLink)
      }
  
      checkZeroAmountWarning() {
        // Afficher un avertissement pour les montants à 0€
        this.showNotification("⚠️ Si votre Payment Link est à 0€, il ne fonctionnera pas correctement !", "warning")
      }
  
      // === ÉVÉNEMENTS HAT ===
      whenPaymentSuccess(args) {
        const link = args.PAYMENT_LINK.trim()
        const currentLink = this.currentPaymentLink.trim()
        const isMatch = this.paymentStatus === "success" && currentLink === link
  
        console.log(`🔍 HAT Success check:`)
        console.log(`  Status: ${this.paymentStatus} (need: success)`)
        console.log(`  Current link: "${currentLink}"`)
        console.log(`  Checking link: "${link}"`)
        console.log(`  Link match: ${currentLink === link}`)
        console.log(`  Final result: ${isMatch}`)
  
        return isMatch
      }
  
      whenPaymentFailed(args) {
        const link = args.PAYMENT_LINK.trim()
        const currentLink = this.currentPaymentLink.trim()
        const isMatch = this.paymentStatus === "failed" && currentLink === link
  
        console.log(`🔍 HAT Failed check:`)
        console.log(`  Status: ${this.paymentStatus} (need: failed)`)
        console.log(`  Current link: "${currentLink}"`)
        console.log(`  Checking link: "${link}"`)
        console.log(`  Link match: ${currentLink === link}`)
        console.log(`  Final result: ${isMatch}`)
  
        return isMatch
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
  
      showRedirectInterface(paymentLink) {
        const overlay = document.createElement("div")
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center;
          align-items: center; z-index: 999999; font-family: Arial, sans-serif;
        `
  
        const modal = document.createElement("div")
        modal.style.cssText = `
          background: white; border-radius: 16px; padding: 32px; width: 450px;
          max-width: 90vw; text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        `
  
        modal.innerHTML = `
          <div style="margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6772E5, #4F46E5); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px; color: white;">💳</span>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">Redirection Stripe</h2>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 16px;">Vous allez être redirigé vers Stripe</p>
            <p style="margin: 0; color: #999; font-size: 14px;">Session ID: ${this.sessionId}</p>
          </div>
  
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 20px;">⚠️</span>
              <span style="color: #856404; font-weight: 700; font-size: 16px;">IMPORTANT</span>
            </div>
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Les Payment Links à 0€ ne fonctionnent pas !</strong><br>
              Utilisez un montant > 0€ (ex: 1€) pour tester.
            </p>
          </div>
  
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px;">
              <span style="font-size: 20px;">🔒</span>
              <span style="color: #28a745; font-weight: 700; font-size: 16px;">Paiement sécurisé par Stripe</span>
            </div>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Une nouvelle fenêtre va s'ouvrir.<br>
              <strong>Fermez-la après votre paiement pour revenir ici.</strong>
            </p>
          </div>
  
          <div style="display: flex; gap: 16px; margin-top: 32px;">
            <button id="cancel-payment" style="
              flex: 1; padding: 16px 24px; border: 2px solid #e1e5e9;
              background: white; color: #666; border-radius: 12px;
              font-size: 16px; font-weight: 600; cursor: pointer;
            ">Annuler</button>
            <button id="continue-payment" style="
              flex: 2; padding: 16px 24px; border: none;
              background: linear-gradient(135deg, #6772E5, #4F46E5);
              color: white; border-radius: 12px; font-size: 16px;
              font-weight: 600; cursor: pointer;
            ">Continuer vers Stripe</button>
          </div>
        `
  
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
  
        // Event listeners
        modal.querySelector("#cancel-payment").onclick = () => {
          overlay.remove()
          this.handlePaymentCancelled()
        }
  
        modal.querySelector("#continue-payment").onclick = () => {
          overlay.remove()
          this.openStripeWindow(paymentLink)
        }
  
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            overlay.remove()
            this.handlePaymentCancelled()
          }
        }
      }
  
      openStripeWindow(paymentLink) {
        console.log("🔗 Ouverture de la fenêtre Stripe")
  
        // Créer les URLs de retour
        const baseUrl = window.location.origin + window.location.pathname
        const successUrl = `${baseUrl}?stripe_success=true&session_id={CHECKOUT_SESSION_ID}&payment_link=${encodeURIComponent(paymentLink)}`
        const cancelUrl = `${baseUrl}?stripe_cancelled=true&session_id={CHECKOUT_SESSION_ID}&payment_link=${encodeURIComponent(paymentLink)}`
  
        // Construire l'URL complète
        const separator = paymentLink.includes("?") ? "&" : "?"
        const fullUrl = `${paymentLink}${separator}success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&client_reference_id=${this.sessionId}`
  
        console.log("🌐 URL complète Stripe:", fullUrl)
  
        // Ouvrir Stripe
        const stripeWindow = window.open(fullUrl, "stripe_payment", "width=800,height=700,scrollbars=yes,resizable=yes")
  
        if (!stripeWindow) {
          this.showNotification("❌ Veuillez autoriser les popups", "error")
          this.handlePaymentCancelled()
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
            console.log("🔄 Fenêtre Stripe fermée, vérification automatique du paiement...")
  
            // Attendre un peu puis vérifier AUTOMATIQUEMENT
            setTimeout(() => {
              this.checkPaymentResult()
            }, 2000)
          }
        }, 1000)
  
        // Timeout après 10 minutes
        setTimeout(() => {
          if (!stripeWindow.closed) {
            clearInterval(checkClosed)
            stripeWindow.close()
            this.handlePaymentTimeout()
          }
        }, 600000)
      }
  
      async checkPaymentResult() {
        console.log("🔍 Vérification du résultat du paiement...")
  
        // Vérifier les paramètres d'URL d'abord
        const urlParams = new URLSearchParams(window.location.search)
        const stripeSuccess = urlParams.get("stripe_success")
        const stripeCancelled = urlParams.get("stripe_cancelled")
        const sessionId = urlParams.get("session_id")
        const paymentLink = urlParams.get("payment_link")
  
        console.log("📋 Paramètres URL détectés:")
        console.log("  stripe_success:", stripeSuccess)
        console.log("  stripe_cancelled:", stripeCancelled)
        console.log("  session_id:", sessionId)
        console.log("  payment_link:", paymentLink)
  
        if (stripeSuccess === "true" && sessionId) {
          console.log("✅ Succès détecté dans l'URL")
          await this.verifyPaymentWithBackend(sessionId, decodeURIComponent(paymentLink))
          this.cleanUrl()
          return
        }
  
        if (stripeCancelled === "true") {
          console.log("❌ Annulation détectée dans l'URL")
          this.handlePaymentCancelled()
          this.cleanUrl()
          return
        }
  
        // Si pas de paramètres, c'est un échec (pas de faux positifs)
        console.log("❌ Aucun paramètre de succès détecté - Paiement échoué")
        this.handlePaymentError("Aucune confirmation de paiement reçue (vérifiez que votre Payment Link n'est pas à 0€)")
      }
  
      async verifyPaymentWithBackend(sessionId, paymentLink) {
        try {
          this.showNotification("🔍 Vérification du paiement...", "info")
  
          console.log("🌐 Appel API:", "https://v0-scratch-extension-issue.vercel.app/api/verify-payment")
          console.log("📦 Données:", { sessionId, paymentLink })
  
          const response = await fetch("https://v0-scratch-extension-issue.vercel.app/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: sessionId,
              paymentLink: paymentLink,
            }),
          })
  
          console.log("📡 Réponse API:", response.status, response.statusText)
  
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
  
          const result = await response.json()
          console.log("✅ Résultat API:", result)
  
          if (result.success) {
            this.handlePaymentSuccess(result.payment)
          } else {
            this.handlePaymentError(result.error || "Vérification échouée")
          }
        } catch (error) {
          console.error("❌ Erreur de vérification:", error)
  
          // PAS DE FALLBACK AUTOMATIQUE - Échec réel
          this.handlePaymentError(`Erreur de vérification: ${error.message}`)
        }
      }
  
      handlePaymentSuccess(paymentData) {
        this.paymentStatus = "success"
        console.log("🎉 Paiement vérifié et confirmé par le backend!")
        console.log("📝 Nouveau statut:", this.paymentStatus)
  
        // Afficher popup de succès
        this.showSuccessPopup(paymentData)
  
        // Déclencher l'événement HAT avec le bon nom
        this.triggerHatBlocks()
      }
  
      handlePaymentError(error) {
        this.paymentStatus = "failed"
        console.log("❌ Paiement échoué:", error)
        console.log("📝 Nouveau statut:", this.paymentStatus)
  
        // Afficher notification d'erreur
        this.showNotification(`❌ Paiement échoué: ${error}`, "error")
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      handlePaymentCancelled() {
        this.paymentStatus = "failed"
        console.log("❌ Paiement annulé")
        console.log("📝 Nouveau statut:", this.paymentStatus)
  
        this.showNotification("❌ Paiement annulé", "warning")
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      handlePaymentTimeout() {
        this.paymentStatus = "failed"
        console.log("⏰ Timeout du paiement")
        console.log("📝 Nouveau statut:", this.paymentStatus)
  
        this.showNotification("⏰ Timeout - Paiement trop long", "warning")
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      triggerHatBlocks() {
        if (!this.runtime) {
          console.warn("❌ Runtime Scratch non disponible")
          return
        }
  
        console.log(`🎯 Déclenchement des blocs HAT - Status: ${this.paymentStatus}`)
  
        // Déclencher tous les blocs HAT pour qu'ils se réévaluent
        try {
          if (this.paymentStatus === "success") {
            console.log("🚀 Déclenchement HAT Success...")
            this.runtime.startHats("stripeFinal_whenPaymentSuccess")
          } else if (this.paymentStatus === "failed") {
            console.log("🚀 Déclenchement HAT Failed...")
            this.runtime.startHats("stripeFinal_whenPaymentFailed")
          }
        } catch (error) {
          console.error("❌ Erreur lors du déclenchement des HAT:", error)
        }
      }
  
      showSuccessPopup(paymentData) {
        const overlay = document.createElement("div")
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center;
          align-items: center; z-index: 999999; font-family: Arial, sans-serif;
        `
  
        const modal = document.createElement("div")
        modal.style.cssText = `
          background: white; border-radius: 16px; padding: 32px; width: 450px;
          max-width: 90vw; text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        `
  
        modal.innerHTML = `
          <div style="margin-bottom: 24px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px; color: white;">✅</span>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">Paiement Confirmé !</h2>
            <p style="margin: 0 0 8px 0; color: #28a745; font-size: 16px; font-weight: 600;">Vérifié par le serveur</p>
          </div>
  
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left;">
            <div style="margin-bottom: 12px;">
              <strong>Session ID:</strong><br>
              <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${this.sessionId}</code>
            </div>
            ${
              paymentData
                ? `
              <div style="margin-bottom: 12px;">
                <strong>Montant:</strong> ${paymentData.amount || "N/A"}<br>
                <strong>Email:</strong> ${paymentData.email || "N/A"}<br>
                <strong>Status:</strong> ${paymentData.status || "N/A"}
              </div>
            `
                : ""
            }
          </div>
  
          <button id="close-success" style="
            width: 100%; padding: 16px 24px; border: none;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white; border-radius: 12px; font-size: 16px;
            font-weight: 600; cursor: pointer;
          ">Continuer</button>
        `
  
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
  
        modal.querySelector("#close-success").onclick = () => {
          overlay.remove()
        }
  
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            overlay.remove()
          }
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
          position: fixed; top: 20px; right: 20px;
          background: ${colors[type] || colors.info}; color: white;
          padding: 16px 24px; border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          z-index: 1000000; font-family: Arial, sans-serif;
          font-size: 16px; font-weight: 600; max-width: 350px;
        `
  
        notification.textContent = message
        document.body.appendChild(notification)
  
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove()
          }
        }, 5000)
      }
  
      cleanUrl() {
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete("stripe_success")
          url.searchParams.delete("stripe_cancelled")
          url.searchParams.delete("session_id")
          url.searchParams.delete("payment_link")
          window.history.replaceState({}, document.title, url.href)
        } catch (error) {
          console.warn("Impossible de nettoyer l'URL:", error)
        }
      }
    }
  
    // Enregistrer l'extension
    Scratch.extensions.register(new StripeExtensionFinal())
  })(Scratch)
  