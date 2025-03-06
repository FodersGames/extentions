// Déclaration des variables pour les publicités
let interstitialAd = null;

// Fonction pour charger une publicité
function loadAd() {
    // Créer une instance de la publicité (interstitielle)
    interstitialAd = new google.ads.interactiveMedia.ads.InterstitialAd();
    interstitialAd.load('YOUR_ADMOB_AD_UNIT_ID'); // Remplace par ton ID de publicité AdMob

    // Écouteur d'événement pour la réussite du chargement
    interstitialAd.on('loaded', function() {
        console.log('Publicité chargée avec succès');
        callScratchBlock('onAdCompleted');
    });

    // Écouteur d'événement pour l'échec du chargement
    interstitialAd.on('failed', function(error) {
        console.error('Erreur de publicité : ', error);
        callScratchBlock('onAdFailed', error.message); // Renvoie l'erreur à Scratch
    });
}

// Fonction pour afficher la publicité
function showAd() {
    if (interstitialAd) {
        interstitialAd.show();
    } else {
        console.log('La publicité n\'a pas été chargée');
        callScratchBlock('onAdFailed', 'La publicité n\'a pas été chargée');
    }
}

// Fonction pour appeler un bloc Scratch
function callScratchBlock(blockName, errorMsg) {
    // Remplacer par la logique spécifique pour Scratch
    if (blockName === 'onAdCompleted') {
        console.log('La publicité est terminée.');
        // Ici tu peux appeler ton bloc Scratch "pubTerminee" ou autre action
    } else if (blockName === 'onAdFailed') {
        console.log('Erreur de publicité:', errorMsg);
        // Appeler ton bloc Scratch "pubEchouee" et passer le message d'erreur
        // Par exemple, tu peux déclencher un bloc qui affiche l'erreur à l'utilisateur
    }
}

// Utilisation des fonctions
loadAd();  // Charger la publicité dès le début
showAd();  // Afficher la publicité si elle est chargée
