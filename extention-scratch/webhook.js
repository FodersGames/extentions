class DiscordWebhook {
    getInfo() {
      return {
        id: 'discordwebhook',
        name: 'Discord Webhook',
        blocks: [
          {
            opcode: 'sendMessage',
            blockType: 'command',
            text: 'Envoyer message [MESSAGE] au webhook [URL]',
            arguments: {
              MESSAGE: {
                type: 'string',
                defaultValue: 'Hello Discord!'
              },
              URL: {
                type: 'string',
                defaultValue: 'https://discord.com/api/webhooks/...'
              }
            }
          }
        ]
      };
    }
  
    sendMessage(args) {
      const message = args.MESSAGE;
      const url = args.URL;
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      
      return fetch(proxyUrl + url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi du message');
        }
        return 'Message envoyé avec succès';
      })
      .catch(error => {
        return 'Erreur : ' + error.message;
      });
    }
  }
  
  Scratch.extensions.register(new DiscordWebhook());
  