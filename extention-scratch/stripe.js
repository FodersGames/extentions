// Extension Stripe FINALE - Version SANS BACKEND (pour éviter CORS)
;((Scratch) => {
    class StripeExtensionFinal {
      constructor(runtime) {
        this.runtime = runtime
        this.paymentStatus = "none"
        this.currentPaymentLink = ""
        this.sessionId = ""
        this.isChecking = false
  
        console.log("🚀 Stripe Extension FINALE chargée (Mode Sans Backend)")
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
  
        this.currentPaymentLink = paymentLink
        this.paymentStatus = "pending"
        this.sessionId = this.generateSessionId()
  
        // Afficher l'interface de redirection
        this.showRedirectInterface(paymentLink)
      }
  
      // === ÉVÉNEMENTS HAT ===
      whenPaymentSuccess(args) {
        const link = args.PAYMENT_LINK
        return this.paymentStatus === "success" && this.currentPaymentLink === link
      }
  
      whenPaymentFailed(args) {
        const link = args.PAYMENT_LINK
        return this.paymentStatus === "failed" && this.currentPaymentLink === link
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
  
        // Ouvrir Stripe directement (sans URLs de retour pour éviter CORS)
        const stripeWindow = window.open(
          paymentLink,
          "stripe_payment",
          "width=800,height=700,scrollbars=yes,resizable=yes",
        )
  
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
        const checkClosed = setInterval(() => {
          if (stripeWindow.closed) {
            clearInterval(checkClosed)
            console.log("🔄 Fenêtre Stripe fermée, demande de confirmation...")
  
            // Attendre un peu puis demander confirmation
            setTimeout(() => {
              this.askPaymentConfirmation()
            }, 1000)
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
  
      askPaymentConfirmation() {
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
              <span style="font-size: 32px; color: white;">❓</span>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">Confirmation de Paiement</h2>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 16px;">Avez-vous effectué le paiement avec succès ?</p>
            <p style="margin: 0; color: #999; font-size: 14px;">Session ID: ${this.sessionId}</p>
          </div>
  
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Si vous avez payé avec succès, cliquez sur "Paiement Réussi".<br>
              Sinon, cliquez sur "Paiement Échoué".
            </p>
          </div>
  
          <div style="display: flex; gap: 16px; margin-top: 32px;">
            <button id="payment-failed" style="
              flex: 1; padding: 16px 24px; border: 2px solid #dc3545;
              background: white; color: #dc3545; border-radius: 12px;
              font-size: 16px; font-weight: 600; cursor: pointer;
            ">Paiement Échoué</button>
            <button id="payment-success" style="
              flex: 1; padding: 16px 24px; border: none;
              background: linear-gradient(135deg, #28a745, #20c997);
              color: white; border-radius: 12px; font-size: 16px;
              font-weight: 600; cursor: pointer;
            ">Paiement Réussi</button>
          </div>
        `
  
        overlay.appendChild(modal)
        document.body.appendChild(overlay)
  
        // Event listeners
        modal.querySelector("#payment-failed").onclick = () => {
          overlay.remove()
          this.handlePaymentError("Paiement non confirmé par l'utilisateur")
        }
  
        modal.querySelector("#payment-success").onclick = () => {
          overlay.remove()
          this.handlePaymentSuccess({
            sessionId: this.sessionId,
            amount: "Montant non vérifié",
            email: "Email non vérifié",
            status: "confirmed_by_user",
            timestamp: new Date().toISOString(),
          })
        }
  
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            overlay.remove()
            this.handlePaymentError("Confirmation annulée")
          }
        }
      }
  
      handlePaymentSuccess(paymentData) {
        this.paymentStatus = "success"
        console.log("🎉 Paiement réussi!")
  
        // Afficher popup de succès
        this.showSuccessPopup(paymentData)
  
        // Déclencher l'événement HAT
        if (this.runtime) {
          this.runtime.startHats("stripeFinal_whenPaymentSuccess", {
            PAYMENT_LINK: this.currentPaymentLink,
          })
        }
      }
  
      handlePaymentError(error) {
        this.paymentStatus = "failed"
        console.log("❌ Paiement échoué:", error)
  
        // Afficher notification d'erreur
        this.showNotification(`❌ Erreur: ${error}`, "error")
  
        // Déclencher l'événement HAT
        if (this.runtime) {
          this.runtime.startHats("stripeFinal_whenPaymentFailed", {
            PAYMENT_LINK: this.currentPaymentLink,
          })
        }
      }
  
      handlePaymentCancelled() {
        this.paymentStatus = "failed"
        console.log("❌ Paiement annulé")
  
        this.showNotification("❌ Paiement annulé", "warning")
  
        // Déclencher l'événement HAT
        if (this.runtime) {
          this.runtime.startHats("stripeFinal_whenPaymentFailed", {
            PAYMENT_LINK: this.currentPaymentLink,
          })
        }
      }
  
      handlePaymentTimeout() {
        this.paymentStatus = "failed"
        console.log("⏰ Timeout du paiement")
  
        this.showNotification("⏰ Timeout - Paiement trop long", "warning")
  
        // Déclencher l'événement HAT
        if (this.runtime) {
          this.runtime.startHats("stripeFinal_whenPaymentFailed", {
            PAYMENT_LINK: this.currentPaymentLink,
          })
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
            <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">Achat Effectué !</h2>
            <p style="margin: 0 0 8px 0; color: #28a745; font-size: 16px; font-weight: 600;">Paiement confirmé</p>
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
    }
  
    // Enregistrer l'extension
    Scratch.extensions.register(new StripeExtensionFinal())
  })(Scratch)
  