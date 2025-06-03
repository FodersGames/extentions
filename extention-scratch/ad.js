(function(Scratch) {
    'use strict';

    class AdRewards {
        constructor() {
            this._iframe = null;
            this._overlay = null;
            this._counter = null;
            this._adSuccess = {};
            this._adFailed = {};
            this._adErrors = {};
            this._adTimers = {};
            this._currentAdId = null;
            this._debugMode = true; // Mode debug activé par défaut
        }

        getInfo() {
            return {
                id: 'adRewards',
                name: 'Ad Rewards Debug',
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
                                defaultValue: 'https://www.profitableratecpm.com/d19zh5qmfa?key=224c484e085aa1381c3a4c560b9a661e'
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
                        opcode: 'getLastError',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Dernière erreur annonce ID [AD_ID]',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'getAllErrors',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Toutes les erreurs annonce ID [AD_ID]',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'toggleDebug',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Mode debug [STATE]',
                        arguments: {
                            STATE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'debugStates',
                                defaultValue: 'ON'
                            }
                        }
                    },
                    {
                        opcode: 'closeAd',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Fermer annonce en cours'
                    }
                ],
                menus: {
                    debugStates: {
                        acceptReporters: false,
                        items: ['ON', 'OFF']
                    }
                }
            };
        }

        _log(adId, message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const logMessage = `[${timestamp}] AD-${adId}: ${message}`;
            
            if (this._debugMode) {
                console.log(`%c${logMessage}`, `color: ${type === 'error' ? 'red' : type === 'warn' ? 'orange' : 'blue'}`);
            }

            // Stocker l'erreur si c'est une erreur
            if (type === 'error') {
                if (!this._adErrors[adId]) {
                    this._adErrors[adId] = [];
                }
                this._adErrors[adId].push(`${timestamp}: ${message}`);
            }
        }

        showAd(args) {
            const adId = String(args.AD_ID);
            const duration = Math.max(1, Number(args.TIME));
            const baseUrl = String(args.URL);
            
            this._log(adId, `Début du chargement - Durée: ${duration}s, URL: ${baseUrl}`);
            
            // Réinitialiser les états pour cette annonce
            this._adSuccess[adId] = false;
            this._adFailed[adId] = false;
            this._adErrors[adId] = [];
            this._currentAdId = adId;

            // Fermer toute annonce en cours
            this.closeAd();

            try {
                this._log(adId, 'Création de l\'overlay...');
                
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
                
                this._log(adId, `URL finale: ${adUrl}`);

                // Créer le compteur visuel avec debug info
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
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    border: 2px solid white;
                    min-width: 250px;
                    text-align: center;
                `;

                // Créer une zone de debug
                const debugDiv = document.createElement('div');
                debugDiv.id = 'debugInfo';
                debugDiv.style.cssText = `
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    color: #00ff00;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                    font-size: 12px;
                    max-width: 300px;
                    max-height: 200px;
                    overflow-y: auto;
                    display: ${this._debugMode ? 'block' : 'none'};
                `;

                // Créer le bouton de fermeture
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
                this._overlay.appendChild(debugDiv);
                this._overlay.appendChild(closeButton);
                document.body.appendChild(this._overlay);

                this._log(adId, 'Overlay créé et ajouté au DOM');

                // Gestion des événements de l'iframe
                this._iframe.onload = () => {
                    this._log(adId, 'Iframe chargée avec succès');
                    debugDiv.innerHTML += '<br>✅ Iframe loaded';
                };

                this._iframe.onerror = (error) => {
                    this._log(adId, `Erreur de chargement iframe: ${error}`, 'error');
                    debugDiv.innerHTML += '<br>❌ Iframe error';
                    this._finishAd(adId, false, 'Erreur de chargement de l\'iframe');
                };

                // Définir la source après avoir configuré les événements
                this._iframe.src = adUrl;
                this._log(adId, 'Source de l\'iframe définie');

                let remainingTime = duration;
                let debugMessages = [`Démarrage AD-${adId}`, `Durée: ${duration}s`, `URL: ${adUrl}`];
                
                const updateDisplay = () => {
                    counterDiv.innerHTML = `
                        <div>Annonce ID: ${adId}</div>
                        <div>${remainingTime}s restantes</div>
                        <div style="font-size: 12px; margin-top: 5px;">Status: En cours</div>
                    `;
                    
                    if (this._debugMode) {
                        debugDiv.innerHTML = debugMessages.join('<br>');
                        debugDiv.scrollTop = debugDiv.scrollHeight;
                    }
                };

                updateDisplay();

                // Démarrer le compteur
                this._counter = setInterval(() => {
                    remainingTime--;
                    debugMessages.push(`T-${remainingTime}s`);
                    
                    this._log(adId, `Temps restant: ${remainingTime}s`);
                    
                    if (remainingTime > 0) {
                        updateDisplay();
                        
                        // Afficher le bouton de fermeture après 5 secondes
                        if (duration - remainingTime >= 5) {
                            closeButton.style.display = 'flex';
                            if (debugMessages.indexOf('Close button visible') === -1) {
                                debugMessages.push('Close button visible');
                            }
                        }

                        // Vérifier si l'iframe est toujours accessible
                        try {
                            if (this._iframe && this._iframe.contentWindow) {
                                debugMessages.push(`Frame OK`);
                            }
                        } catch (e) {
                            debugMessages.push(`Frame access error: ${e.message}`);
                            this._log(adId, `Erreur d'accès iframe: ${e.message}`, 'warn');
                        }
                        
                    } else {
                        // Temps écoulé - annonce terminée avec succès
                        this._log(adId, 'Annonce terminée avec succès (temps écoulé)');
                        this._finishAd(adId, true, 'Temps écoulé normalement');
                    }
                }, 1000);

                // Vérification de chargement après 3 secondes
                setTimeout(() => {
                    if (this._iframe && this._iframe.src) {
                        try {
                            // Test de connectivité
                            const testImg = new Image();
                            testImg.onload = () => {
                                this._log(adId, 'Test de connectivité réussi');
                                debugMessages.push('✅ Connectivity OK');
                            };
                            testImg.onerror = () => {
                                this._log(adId, 'Test de connectivité échoué', 'warn');
                                debugMessages.push('⚠️ Connectivity issue');
                            };
                            testImg.src = baseUrl.split('?')[0] + '/favicon.ico';
                        } catch (e) {
                            this._log(adId, `Erreur test connectivité: ${e.message}`, 'error');
                        }
                    }
                }, 3000);

                // Timeout de sécurité plus long
                setTimeout(() => {
                    if (this._currentAdId === adId && this._iframe) {
                        this._log(adId, 'Timeout de sécurité atteint', 'warn');
                        // Ne pas fermer automatiquement, juste logger
                    }
                }, 10000);

                // Gestion du clic sur le bouton de fermeture
                closeButton.onclick = () => {
                    this._log(adId, 'Fermeture manuelle par l\'utilisateur');
                    this._finishAd(adId, false, 'Fermé manuellement par l\'utilisateur');
                };

            } catch (error) {
                this._log(adId, `Erreur critique: ${error.message}`, 'error');
                this._finishAd(adId, false, `Erreur critique: ${error.message}`);
            }
        }

        _finishAd(adId, success, reason = '') {
            this._log(adId, `Fin d'annonce - Succès: ${success}, Raison: ${reason}`);
            
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
                if (reason) {
                    this._log(adId, `Échec: ${reason}`, 'error');
                }
            }

            this._currentAdId = null;

            // Déclencher les événements après un court délai
            setTimeout(() => {
                if (success) {
                    this._log(adId, 'Déclenchement événement succès');
                    Scratch.vm.runtime.startHats('adRewards_onAdFinished', { AD_ID: adId });
                } else {
                    this._log(adId, 'Déclenchement événement échec');
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

        getLastError(args) {
            const adId = String(args.AD_ID);
            const errors = this._adErrors[adId];
            if (errors && errors.length > 0) {
                return errors[errors.length - 1];
            }
            return 'Aucune erreur';
        }

        getAllErrors(args) {
            const adId = String(args.AD_ID);
            const errors = this._adErrors[adId];
            if (errors && errors.length > 0) {
                return errors.join(' | ');
            }
            return 'Aucune erreur';
        }

        toggleDebug(args) {
            this._debugMode = args.STATE === 'ON';
            console.log(`Mode debug ${this._debugMode ? 'activé' : 'désactivé'}`);
        }
    }

    // Enregistrer l'extension
    Scratch.extensions.register(new AdRewards());

})(window.Scratch);