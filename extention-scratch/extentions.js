(function(Scratch) {
    'use strict';

    class AdRewards {
        constructor() {
            this._iframe = null;
        }

        getInfo() {
            return {
                id: 'adRewards',
                name: 'Ad Rewards',
                blocks: [
                    {
                        opcode: 'loadAds',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Afficher la page de publicité pendant 5 secondes'
                    }
                ]
            };
        }

        loadAds() {
            // Crée un iframe pour afficher la page du lien
            if (!this._iframe) {
                this._iframe = document.createElement('iframe');
                this._iframe.style.position = 'absolute';
                this._iframe.style.top = '0';
                this._iframe.style.left = '0';
                this._iframe.style.width = '100%';
                this._iframe.style.height = '100%';
                this._iframe.style.border = 'none';
                this._iframe.src = 'https://www.effectiveratecpm.com/d19zh5qmfa?key=224c484e085aa1381c3a4c560b9a661e';

                // Ajouter l'iframe au corps du document
                document.body.appendChild(this._iframe);
            }

            // Cache l'iframe après 5 secondes
            setTimeout(() => {
                this._iframe.style.display = 'none';  // Cache l'iframe
            }, 5000);
        }
    }

    // Enregistre l'extension dans Scratch
    Scratch.extensions.register(new AdRewards());

})(Scratch);
