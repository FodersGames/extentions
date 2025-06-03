(function(Scratch) {
    'use strict';

    class AdRewards {
        constructor() {
            this._iframe = null;
            this._overlay = null;
            this._counter = null;
            this._adSuccess = {};
            this._adFailed = {};
            this._adTimers = {};
            this._currentAdId = null;
        }

        getInfo() {
            return {
                id: 'adRewards',
                name: 'Ad Rewards',
                color1: '#FF6B6B',
                color2: '#FF5252',
                blocks: [
                    {
                        opcode: 'showAd',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Diffuser annonce ID [AD_ID] pendant [TIME] secondes via [URL]',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            },
                            TIME: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 30
                            },
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://www.effectiveratecpm.com/d19zh5qmfa?key=224c484e085aa1381c3a4c560b9a661e'
                            }
                        }
                    },
                    {
                        opcode: 'onAdFinished',
                        blockType: Scratch.BlockType.HAT,
                        text: 'Quand annonce ID [AD_ID] terminée avec succès',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'onAdFailed',
                        blockType: Scratch.BlockType.HAT,
                        text: 'Quand annonce ID [AD_ID] a échoué',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'isAdFinished',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'Annonce ID [AD_ID] terminée ?',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'isAdFailed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'Annonce ID [AD_ID] échouée ?',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'closeAd',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Fermer annonce en cours'
                    }
                ]
            };
        }

        showAd(args) {
            const adId = String(args.AD_ID);
            const duration = Math.max(1, Number(args.TIME));
            const baseUrl = String(args.URL);
            
            // Réinitialiser les états pour cette annonce
            this._adSuccess[adId] = false;
            this._adFailed[adId] = false;
            this._currentAdId = adId;

            // Fermer toute annonce en cours
            this.closeAd();

            try {
                // Créer l'overlay principal
                this._overlay = document.createElement('div');
                this._overlay.id = 'adOverlay';
                this._overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 999999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                `;

                // Créer l'iframe pour l'annonce
                this._iframe = document.createElement('iframe');
                this._iframe.style.cssText = `
                    width: 90vw;
                    height: 80vh;
                    max-width: 800px;
                    max-height: 600px;
                    border: 2px solid #fff;
                    border-radius: 10px;
                    background: white;
                `;
                
                // Construire l'URL avec l'ID
                const adUrl = baseUrl.includes('?') 
                    ? `${baseUrl}&id=${adId}` 
                    : `${baseUrl}?id=${adId}`;
                
                this._iframe.src = adUrl;

                // Créer le compteur visuel
                const counterDiv = document.createElement('div');
                counterDiv.id = 'adCounter';
                counterDiv.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, #FF6B6B, #FF5252);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 25px;
                    font-family: Arial, sans-serif;
                    font-size: 18px;
                    font-weight: bold;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    border: 2px solid white;
                    min-width: 200px;
                    text-align: center;
                `;

                // Créer le bouton de fermeture (optionnel, apparaît après quelques secondes)
                const closeButton = document.createElement('button');
                closeButton.innerHTML = '✕';
                closeButton.style.cssText = `
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid white;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                    cursor: pointer;
                    display: none;
                    align-items: center;
                    justify-content: center;
                `;

                // Ajouter les éléments à l'overlay
                this._overlay.appendChild(this._iframe);
                this._overlay.appendChild(counterDiv);
                this._overlay.appendChild(closeButton);
                document.body.appendChild(this._overlay);

                let remainingTime = duration;
                counterDiv.innerHTML = `
                    <div>Annonce ID: ${adId}</div>
                    <div>${remainingTime}s restantes</div>
                `;

                // Démarrer le compteur
                this._counter = setInterval(() => {
                    remainingTime--;
                    
                    if (remainingTime > 0) {
                        counterDiv.innerHTML = `
                            <div>Annonce ID: ${adId}</div>
                            <div>${remainingTime}s restantes</div>
                        `;
                        
                        // Afficher le bouton de fermeture après 5 secondes
                        if (duration - remainingTime >= 5) {
                            closeButton.style.display = 'flex';
                        }
                    } else {
                        // Temps écoulé - annonce terminée avec succès
                        this._finishAd(adId, true);
                    }
                }, 1000);

                // Gestion des erreurs de chargement de l'iframe
                this._iframe.onerror = () => {
                    this._finishAd(adId, false);
                };

                // Gestion du clic sur le bouton de fermeture
                closeButton.onclick = () => {
                    this._finishAd(adId, false);
                };

                // Gestion des erreurs de chargement
                setTimeout(() => {
                    if (this._iframe && !this._iframe.contentDocument) {
                        // Si l'iframe ne s'est pas chargée après 5 secondes
                        this._finishAd(adId, false);
                    }
                }, 5000);

            } catch (error) {
                console.error('Erreur lors du chargement de l\'annonce:', error);
                this._finishAd(adId, false);
            }
        }

        _finishAd(adId, success) {
            // Nettoyer les timers
            if (this._counter) {
                clearInterval(this._counter);
                this._counter = null;
            }

            // Fermer l'overlay
            this.closeAd();

            // Mettre à jour les états
            if (success) {
                this._adSuccess[adId] = true;
                this._adFailed[adId] = false;
            } else {
                this._adSuccess[adId] = false;
                this._adFailed[adId] = true;
            }

            this._currentAdId = null;

            // Déclencher les événements après un court délai
            setTimeout(() => {
                if (success) {
                    Scratch.vm.runtime.startHats('adRewards_onAdFinished', { AD_ID: adId });
                } else {
                    Scratch.vm.runtime.startHats('adRewards_onAdFailed', { AD_ID: adId });
                }
            }, 100);
        }

        closeAd() {
            if (this._counter) {
                clearInterval(this._counter);
                this._counter = null;
            }

            if (this._overlay && this._overlay.parentNode) {
                this._overlay.parentNode.removeChild(this._overlay);
                this._overlay = null;
            }

            this._iframe = null;
        }

        onAdFinished(args) {
            const adId = String(args.AD_ID);
            return this._adSuccess[adId] === true;
        }

        onAdFailed(args) {
            const adId = String(args.AD_ID);
            return this._adFailed[adId] === true;
        }

        isAdFinished(args) {
            const adId = String(args.AD_ID);
            return this._adSuccess[adId] === true;
        }

        isAdFailed(args) {
            const adId = String(args.AD_ID);
            return this._adFailed[adId] === true;
        }
    }

    // Enregistrer l'extension
    Scratch.extensions.register(new AdRewards());

})(Scratch);