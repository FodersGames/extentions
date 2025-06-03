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
            this._debugMode = true;
            
            // System to ensure single trigger per event
            this._adJustFinished = {}; // Tracks ads that just finished (edge detection)
            this._adJustFailed = {};   // Tracks ads that just failed (edge detection)
        }

        getInfo() {
            return {
                id: 'adRewards',
                name: 'Ad Rewards',
                color1: '#3A86FF',
                color2: '#0066CC',
                blocks: [
                    {
                        opcode: 'showAd',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Show ad with ID [AD_ID] for [TIME] seconds via [URL]',
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
                        text: 'When ad with ID [AD_ID] finishes successfully',
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
                        text: 'When ad with ID [AD_ID] fails',
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
                        text: 'Ad with ID [AD_ID] finished?',
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
                        text: 'Ad with ID [AD_ID] failed?',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'resetAdStatus',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Reset status for ad ID [AD_ID]',
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
                        text: 'Last error for ad ID [AD_ID]',
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
                        text: 'All errors for ad ID [AD_ID]',
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
                        text: 'Debug mode [STATE]',
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
                        text: 'Close current ad'
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
            
            this._log(adId, `Starting ad load - Duration: ${duration}s, URL: ${baseUrl}`);
            
            // Reset ALL states for this ad
            this._adSuccess[adId] = false;
            this._adFailed[adId] = false;
            this._adJustFinished[adId] = false;
            this._adJustFailed[adId] = false;
            this._adErrors[adId] = [];
            this._currentAdId = adId;

            this.closeAd();

            try {
                this._log(adId, 'Creating overlay...');
                
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

                this._iframe = document.createElement('iframe');
                this._iframe.style.cssText = `
                    width: 90vw;
                    height: 80vh;
                    max-width: 800px;
                    max-height: 600px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 4px;
                    background: white;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                `;
                
                const adUrl = baseUrl.includes('?') 
                    ? `${baseUrl}&id=${adId}` 
                    : `${baseUrl}?id=${adId}`;
                
                this._log(adId, `Final URL: ${adUrl}`);

                const counterDiv = document.createElement('div');
                counterDiv.id = 'adCounter';
                counterDiv.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    font-weight: normal;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    min-width: 80px;
                    text-align: center;
                `;

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

                this._overlay.appendChild(this._iframe);
                this._overlay.appendChild(counterDiv);
                this._overlay.appendChild(debugDiv);
                document.body.appendChild(this._overlay);

                this._log(adId, 'Overlay created and added to DOM');

                this._iframe.onload = () => {
                    this._log(adId, 'Iframe loaded successfully');
                    debugDiv.innerHTML += '<br>✅ Iframe loaded';
                };

                this._iframe.onerror = (error) => {
                    this._log(adId, `Iframe loading error: ${error}`, 'error');
                    debugDiv.innerHTML += '<br>❌ Iframe error';
                    this._finishAd(adId, false, 'Iframe loading error');
                };

                this._iframe.src = adUrl;
                this._log(adId, 'Iframe source set');

                let remainingTime = duration;
                let debugMessages = [`Starting AD-${adId}`, `Duration: ${duration}s`, `URL: ${adUrl}`];
                
                const updateDisplay = () => {
                    counterDiv.innerHTML = `${remainingTime}s`;
                    
                    if (this._debugMode) {
                        debugDiv.innerHTML = debugMessages.join('<br>');
                        debugDiv.scrollTop = debugDiv.scrollHeight;
                    }
                };

                updateDisplay();

                this._counter = setInterval(() => {
                    remainingTime--;
                    debugMessages.push(`T-${remainingTime}s`);
                    
                    this._log(adId, `Time remaining: ${remainingTime}s`);
                    
                    if (remainingTime > 0) {
                        updateDisplay();

                        try {
                            if (this._iframe && this._iframe.contentWindow) {
                                debugMessages.push(`Frame OK`);
                            }
                        } catch (e) {
                            debugMessages.push(`Frame access error: ${e.message}`);
                            this._log(adId, `Iframe access error: ${e.message}`, 'warn');
                        }
                        
                    } else {
                        this._log(adId, 'Ad finished successfully (time elapsed)');
                        this._finishAd(adId, true, 'Time elapsed normally');
                    }
                }, 1000);

                setTimeout(() => {
                    if (this._iframe && this._iframe.src) {
                        try {
                            const testImg = new Image();
                            testImg.onload = () => {
                                this._log(adId, 'Connectivity test successful');
                                debugMessages.push('✅ Connectivity OK');
                            };
                            testImg.onerror = () => {
                                this._log(adId, 'Connectivity test failed', 'warn');
                                debugMessages.push('⚠️ Connectivity issue');
                            };
                            testImg.src = baseUrl.split('?')[0] + '/favicon.ico';
                        } catch (e) {
                            this._log(adId, `Connectivity test error: ${e.message}`, 'error');
                        }
                    }
                }, 3000);

            } catch (error) {
                this._log(adId, `Critical error: ${error.message}`, 'error');
                this._finishAd(adId, false, `Critical error: ${error.message}`);
            }
        }

        _finishAd(adId, success, reason = '') {
            this._log(adId, `Ad finished - Success: ${success}, Reason: ${reason}`);
            
            // Prevent multiple calls to _finishAd for the same ad
            if (success && this._adSuccess[adId]) {
                this._log(adId, 'Ad already marked as successful, ignoring duplicate', 'warn');
                return;
            }
            if (!success && this._adFailed[adId]) {
                this._log(adId, 'Ad already marked as failed, ignoring duplicate', 'warn');
                return;
            }
            
            // Clean up timers
            if (this._counter) {
                clearInterval(this._counter);
                this._counter = null;
            }

            this.closeAd();

            // Update states - CRITICAL: Set the "just finished" flag for edge detection
            if (success) {
                this._adSuccess[adId] = true;
                this._adFailed[adId] = false;
                this._adJustFinished[adId] = true; // This triggers the HAT block ONCE
                this._log(adId, 'Setting adJustFinished to true');
            } else {
                this._adSuccess[adId] = false;
                this._adFailed[adId] = true;
                this._adJustFailed[adId] = true; // This triggers the HAT block ONCE
                this._log(adId, 'Setting adJustFailed to true');
                if (reason) {
                    this._log(adId, `Failure: ${reason}`, 'error');
                }
            }

            this._currentAdId = null;
            
            // NO manual startHats call - let Scratch detect the state change naturally
            this._log(adId, 'Ad finish process completed, waiting for HAT block detection');
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

        // FIXED: Edge detection - only triggers ONCE when state changes from false to true
        onAdFinished(args) {
            const adId = String(args.AD_ID);
            
            // Check if ad just finished (edge detection)
            if (this._adJustFinished[adId] === true) {
                this._log(adId, 'HAT block onAdFinished triggered ONCE - consuming event');
                // Immediately consume the event so it doesn't trigger again
                this._adJustFinished[adId] = false;
                return true;
            }
            
            return false;
        }

        onAdFailed(args) {
            const adId = String(args.AD_ID);
            
            // Check if ad just failed (edge detection)
            if (this._adJustFailed[adId] === true) {
                this._log(adId, 'HAT block onAdFailed triggered ONCE - consuming event');
                // Immediately consume the event so it doesn't trigger again
                this._adJustFailed[adId] = false;
                return true;
            }
            
            return false;
        }

        isAdFinished(args) {
            const adId = String(args.AD_ID);
            return this._adSuccess[adId] === true;
        }

        isAdFailed(args) {
            const adId = String(args.AD_ID);
            return this._adFailed[adId] === true;
        }
        
        resetAdStatus(args) {
            const adId = String(args.AD_ID);
            this._adSuccess[adId] = false;
            this._adFailed[adId] = false;
            this._adJustFinished[adId] = false;
            this._adJustFailed[adId] = false;
            this._log(adId, 'Ad status completely reset', 'info');
        }

        getLastError(args) {
            const adId = String(args.AD_ID);
            const errors = this._adErrors[adId];
            if (errors && errors.length > 0) {
                return errors[errors.length - 1];
            }
            return 'No errors';
        }

        getAllErrors(args) {
            const adId = String(args.AD_ID);
            const errors = this._adErrors[adId];
            if (errors && errors.length > 0) {
                return errors.join(' | ');
            }
            return 'No errors';
        }

        toggleDebug(args) {
            this._debugMode = args.STATE === 'ON';
            console.log(`Debug mode ${this._debugMode ? 'enabled' : 'disabled'}`);
        }
    }

    Scratch.extensions.register(new AdRewards());

})(window.Scratch);