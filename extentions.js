(function(Scratch) {
    'use strict';

    class AdRewards {
        constructor() {
            this._rewarded = false;
            this._adFailed = false;
        }

        getInfo() {
            return {
                id: 'adRewards',
                name: 'Ad Rewards',
                blocks: [
                    {
                        opcode: 'showAd',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Afficher une publicité avec ID [AD_ID]',
                        arguments: {
                            AD_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'ca-app-pub-xxxxxxxxxxxxxxxx'
                            }
                        }
                    },
                    {
                        opcode: 'onAdSuccess',
                        blockType: Scratch.BlockType.HAT,
                        text: 'Quand la pub est terminée'
                    },
                    {
                        opcode: 'onAdFail',
                        blockType: Scratch.BlockType.HAT,
                        text: 'Quand la pub échoue'
                    }
                ]
            };
        }

        showAd(args) {
            const adUnitId = args.AD_ID;

            if (!window.admob) {
                console.error("AdMob SDK non chargé !");
                this._adFailed = true;
                return;
            }

            window.admob.rewardedAd.load(adUnitId)
                .then(() => window.admob.rewardedAd.show())
                .then(() => {
                    this._rewarded = true;
                })
                .catch(err => {
                    console.error("Erreur avec AdMob :", err);
                    this._adFailed = true;
                });
        }

        onAdSuccess() {
            return this._rewarded;
        }

        onAdFail() {
            return this._adFailed;
        }
    }

    Scratch.extensions.register(new AdRewards());
})(Scratch);
