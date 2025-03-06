(function(Scratch) {
    'use strict';

    class AdRewards {
        constructor() {
            this._iframe = null;
            this._adSuccess = {};
            this._adFailed = {};
            this._adTimers = {};
            this._counter = null;
        }

        getInfo() {
            return {
                id: 'adRewards',
                name: 'Ad Rewards',
                blocks: [
                    {
                        opcode: 'loadAds',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Show ad with ID [AD_ID] for [TIME] seconds',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            },
                            TIME: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5
                            }
                        }
                    },
                    {
                        opcode: 'onAdSuccess',
                        blockType: Scratch.BlockType.HAT,
                        text: 'When the ad with ID [AD_ID] finishes successfully',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'onAdFail',
                        blockType: Scratch.BlockType.HAT,
                        text: 'When the ad with ID [AD_ID] fails',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1'
                            }
                        }
                    }
                ]
            };
        }

        loadAds(args) {
            // Reset ID before loading a new ad
            this._adSuccess[args.AD_ID] = false;
            this._adFailed[args.AD_ID] = false;

            // If iframe already exists, remove it
            if (this._iframe) {
                document.body.removeChild(this._iframe);
                this._iframe = null;
            }

            // Create a new iframe for the ad
            this._iframe = document.createElement('iframe');
            this._iframe.style.position = 'absolute';
            this._iframe.style.top = '0';  // Fullscreen, top aligned
            this._iframe.style.left = '0'; // Fullscreen, left aligned
            this._iframe.style.width = '100%';  // Take the full width of the screen
            this._iframe.style.height = '100%'; // Take the full height of the screen
            this._iframe.style.border = 'none'; // No border
            this._iframe.src = `https://www.effectiveratecpm.com/d19zh5qmfa?key=224c484e085aa1381c3a4c560b9a661e&id=${args.AD_ID}`;

            // Add iframe to document body
            document.body.appendChild(this._iframe);

            // Add a counter inside the iframe (dynamic)
            const counterDiv = document.createElement('div');
            counterDiv.id = 'adCounter';
            counterDiv.style.position = 'absolute';
            counterDiv.style.top = '10px'; // 10px from the top
            counterDiv.style.right = '10px'; // 10px from the right
            counterDiv.style.fontSize = '30px';
            counterDiv.style.color = 'white';
            counterDiv.style.background = 'rgba(0, 0, 0, 0.7)';
            counterDiv.style.padding = '10px';
            counterDiv.style.borderRadius = '5px';
            counterDiv.innerText = `${args.TIME} seconds remaining`;

            // Add the counter inside the iframe
            this._iframe.contentWindow.document.body.appendChild(counterDiv);

            let remainingTime = args.TIME;

            // Start a timer to countdown
            this._counter = setInterval(() => {
                remainingTime--;
                counterDiv.innerText = `${remainingTime} seconds remaining`;

                if (remainingTime <= 0) {
                    clearInterval(this._counter);
                    // Hide the iframe after time is up
                    this._iframe.style.display = 'none';

                    // Mark ad as successful if it wasn't failed
                    if (!this._adFailed[args.AD_ID]) {
                        this._adSuccess[args.AD_ID] = true;
                    }

                    // Trigger the success block if ad finished
                    Scratch.extensions.triggerEvent('onAdSuccess', { AD_ID: args.AD_ID });
                }
            }, 1000);  // Update every second
        }

        onAdSuccess(args) {
            return this._adSuccess[args.AD_ID] || false;
        }

        onAdFail(args) {
            return this._adFailed[args.AD_ID] || false;
        }
    }

    // Register the extension in Scratch
    Scratch.extensions.register(new AdRewards());

})(Scratch);
