(function(Scratch) {
    'use strict';

    class AdRewards {
        constructor() {
            this._iframe = null;
            this._adSuccess = {};
            this._adFailed = {};
            this._adTimers = {};
        }

        getInfo() {
            return {
                id: 'adRewards',
                name: 'Ad Rewards',
                blocks: [
                    {
                        opcode: 'loadAds',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Afficher la pub avec l\'ID [AD_ID] pendant [TIME] secondes',
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
                        text: 'Quand la pub avec l\'ID [AD_ID] est terminée avec succès',
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
                        text: 'Quand la pub avec l\'ID [AD_ID] échoue',
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
            // Réinitialiser l'ID avant de charger une nouvelle pub
            this._adSuccess[args.AD_ID] = false;
            this._adFailed[args.AD_ID] = false;

            // Si un iframe existe déjà, on le détruit pour en créer un nouveau
            if (this._iframe) {
                document.body.removeChild(this._iframe);
                this._iframe = null;
            }

            // Crée un iframe pour afficher la page du lien
            this._iframe = document.createElement('iframe');
            this._iframe.style.position = 'absolute';
            this._iframe.style.top = '0';
            this._iframe.style.left = '0';
            this._iframe.style.width = '100%';
            this._iframe.style.height = '100%';
            this._iframe.style.border = 'none';
            this._iframe.src = `https://www.effectiveratecpm.com/d19zh5qmfa?key=224c484e085aa1381c3a4c560b9a661e&id=${args.AD_ID}`;

            // Ajouter l'iframe au corps du document
            document.body.appendChild(this._iframe);

            // Démarre un timer pour la publicité et réinitialiser l'état de la pub
            this._adTimers[args.AD_ID] = setTimeout(() => {
                // Après le temps défini, on cache l'iframe
                this._iframe.style.display = 'none';

                // La publicité a réussi si elle n'a pas échoué
                if (!this._adFailed[args.AD_ID]) {
                    this._adSuccess[args.AD_ID] = true;
                }

                // Exécuter les blocs associés si la publicité a fini
                Scratch.extensions.triggerEvent('onAdSuccess', { AD_ID: args.AD_ID });
            }, args.TIME * 1000);  // Multiplie le temps par 1000 pour obtenir des millisecondes
        }

        onAdSuccess(args) {
            return this._adSuccess[args.AD_ID] || false;
        }

        onAdFail(args) {
            return this._adFailed[args.AD_ID] || false;
        }
    }

    // Enregistre l'extension dans Scratch
    Scratch.extensions.register(new AdRewards());

})(Scratch);
