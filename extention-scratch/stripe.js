// Extension Stripe PRODUCTION - Vérification Backend Automatique
;((Scratch) => {
    class StripeExtensionFinal {
      constructor(runtime) {
        this.runtime = runtime
        this.paymentStatus = "none"
        this.currentPaymentLink = ""
        this.sessionId = ""
        this.isChecking = false
        this.pollInterval = null
  
        console.log("🚀 Stripe Extension PRODUCTION - Vérification Backend")
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
          this.showNotification("❌ Lien Stripe invalide", "error")
          return
        }
  
        console.log("💳 Ouverture du paiement:", paymentLink)
  
        // Reset du statut
        this.paymentStatus = "pending"
        this.currentPaymentLink = paymentLink
        this.sessionId = this.generateSessionId()
  
        // Enregistrer la session côté serveur
        this.registerSession()
  
        // Afficher l'interface de redirection
        this.showRedirectInterface(paymentLink)
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
  
      async registerSession() {
        try {
          console.log("📝 Enregistrement de la session:", this.sessionId)
  
          const response = await fetch("https://v0-scratch-extension-issue.vercel.app/api/register-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: this.sessionId,
              paymentLink: this.currentPaymentLink,
              timestamp: Date.now(),
            }),
          })
  
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
  
          const result = await response.json()
          console.log("✅ Session enregistrée:", result)
        } catch (error) {
          console.error("❌ Erreur enregistrement session:", error)
        }
      }
  
      showRedirectInterface(paymentLink) {
        const overlay = document.createElement("div")
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center;
          align-items: center; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          backdrop-filter: blur(8px);
        `
  
        const modal = document.createElement("div")
        modal.style.cssText = `
          background: white; border-radius: 20px; padding: 40px; width: 480px;
          max-width: 90vw; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        `
  
        modal.innerHTML = `
          <div style="margin-bottom: 32px;">
            <div style="width: 88px; height: 88px; background: linear-gradient(135deg, #6772E5, #4F46E5); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(103, 114, 229, 0.3);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Paiement sécurisé</h2>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 18px; font-weight: 500;">Redirection vers Stripe</p>
            <p style="margin: 0; color: #999; font-size: 14px; font-family: 'SF Mono', Monaco, monospace;">ID: ${this.sessionId.slice(-8)}</p>
          </div>
  
          <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid #e1e5e9;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span style="color: #28a745; font-weight: 700; font-size: 18px;">Vérification automatique</span>
            </div>
            <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.5;">
              Le paiement sera <strong>vérifié automatiquement</strong> par notre serveur.<br>
              Fermez simplement la fenêtre après votre paiement.
            </p>
          </div>
  
          <div style="display: flex; gap: 16px; margin-top: 40px;">
            <button id="cancel-payment" style="
              flex: 1; padding: 18px 24px; border: 2px solid #e1e5e9;
              background: white; color: #6c757d; border-radius: 12px;
              font-size: 16px; font-weight: 600; cursor: pointer;
              transition: all 0.2s ease; font-family: inherit;
            " onmouseover="this.style.borderColor='#adb5bd'; this.style.color='#495057'" onmouseout="this.style.borderColor='#e1e5e9'; this.style.color='#6c757d'">Annuler</button>
            <button id="continue-payment" style="
              flex: 2; padding: 18px 32px; border: none;
              background: linear-gradient(135deg, #6772E5, #4F46E5);
              color: white; border-radius: 12px; font-size: 16px;
              font-weight: 600; cursor: pointer; transition: all 0.2s ease;
              box-shadow: 0 4px 16px rgba(103, 114, 229, 0.3); font-family: inherit;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(103, 114, 229, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(103, 114, 229, 0.3)'">Continuer vers Stripe</button>
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
  
        // Construire l'URL avec notre session ID comme client_reference_id
        const separator = paymentLink.includes("?") ? "&" : "?"
        const fullUrl = `${paymentLink}${separator}client_reference_id=${this.sessionId}`
  
        console.log("🌐 URL Stripe avec session:", fullUrl)
  
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
            console.log("🔄 Fenêtre Stripe fermée, vérification automatique...")
  
            // Commencer la vérification automatique
            this.startAutomaticVerification()
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
  
      startAutomaticVerification() {
        this.showNotification("🔍 Vérification automatique en cours...", "info")
  
        let attempts = 0
        const maxAttempts = 30 // 30 secondes max
  
        this.pollInterval = setInterval(async () => {
          attempts++
          console.log(`🔍 Tentative ${attempts}/${maxAttempts}`)
  
          try {
            const response = await fetch("https://v0-scratch-extension-issue.vercel.app/api/check-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId: this.sessionId,
              }),
            })
  
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }
  
            const result = await response.json()
            console.log("📡 Résultat vérification:", result)
  
            if (result.status === "paid") {
              clearInterval(this.pollInterval)
              this.handlePaymentSuccess(result.payment)
              return
            }
  
            if (result.status === "failed") {
              clearInterval(this.pollInterval)
              this.handlePaymentError("Paiement échoué selon le serveur")
              return
            }
  
            // Continue à vérifier...
            console.log("⏳ Paiement en attente, nouvelle vérification dans 1s...")
          } catch (error) {
            console.error("❌ Erreur vérification:", error)
          }
  
          // Timeout après 30 tentatives
          if (attempts >= maxAttempts) {
            clearInterval(this.pollInterval)
            this.handlePaymentError("Timeout - Aucune confirmation reçue")
          }
        }, 1000) // Vérifier toutes les secondes
      }
  
      handlePaymentSuccess(paymentData) {
        this.paymentStatus = "success"
        console.log("🎉 Paiement vérifié automatiquement par le serveur!")
  
        // Afficher popup de succès
        this.showSuccessPopup(paymentData)
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      handlePaymentError(error) {
        this.paymentStatus = "failed"
        console.log("❌ Paiement échoué:", error)
  
        // Afficher notification d'erreur
        this.showNotification(`❌ ${error}`, "error")
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      handlePaymentCancelled() {
        this.paymentStatus = "failed"
        console.log("❌ Paiement annulé")
  
        // Arrêter la vérification si en cours
        if (this.pollInterval) {
          clearInterval(this.pollInterval)
        }
  
        this.showNotification("❌ Paiement annulé", "warning")
  
        // Déclencher l'événement HAT
        this.triggerHatBlocks()
      }
  
      handlePaymentTimeout() {
        this.paymentStatus = "failed"
        console.log("⏰ Timeout du paiement")
  
        // Arrêter la vérification si en cours
        if (this.pollInterval) {
          clearInterval(this.pollInterval)
        }
  
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
  
        try {
          if (this.paymentStatus === "success") {
            this.runtime.startHats("stripeFinal_whenPaymentSuccess")
          } else if (this.paymentStatus === "failed") {
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
          background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center;
          align-items: center; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          backdrop-filter: blur(8px);
        `
  
        const modal = document.createElement("div")
        modal.style.cssText = `
          background: white; border-radius: 20px; padding: 40px; width: 480px;
          max-width: 90vw; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        `
  
        modal.innerHTML = `
          <div style="margin-bottom: 32px;">
            <div style="width: 88px; height: 88px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(40, 167, 69, 0.3);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Paiement confirmé !</h2>
            <p style="margin: 0 0 8px 0; color: #28a745; font-size: 18px; font-weight: 600;">Vérifié automatiquement</p>
          </div>
  
          <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 16px; padding: 24px; margin: 32px 0; text-align: left; border: 1px solid #e1e5e9;">
            <div style="margin-bottom: 16px;">
              <strong style="color: #495057;">ID de session :</strong><br>
              <code style="background: #e9ecef; padding: 8px 12px; border-radius: 8px; font-size: 14px; color: #6c757d; font-family: 'SF Mono', Monaco, monospace;">${this.sessionId}</code>
            </div>
            ${
              paymentData
                ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
              <div>
                <strong style="color: #495057;">Montant :</strong><br>
                <span style="color: #28a745; font-weight: 600;">${paymentData.amount || "Confirmé"}</span>
              </div>
              <div>
                <strong style="color: #495057;">Email :</strong><br>
                <span style="color: #6c757d;">${paymentData.email || "Vérifié"}</span>
              </div>
            </div>
            `
                : ""
            }
          </div>
  
          <button id="close-success" style="
            width: 100%; padding: 18px 32px; border: none;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white; border-radius: 12px; font-size: 16px;
            font-weight: 600; cursor: pointer; transition: all 0.2s ease;
            box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3); font-family: inherit;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(40, 167, 69, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(40, 167, 69, 0.3)'">Continuer</button>
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
          position: fixed; top: 24px; right: 24px;
          background: ${colors[type] || colors.info}; color: white;
          padding: 16px 24px; border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          z-index: 1000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px; font-weight: 600; max-width: 400px;
          backdrop-filter: blur(8px);
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
    Scratch.extensions.register(new StripeExtensionFinal())
  })(Scratch)
  