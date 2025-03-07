(function(Scratch) {
    'use strict';
  
    class TextEngine {
      constructor(runtime) {
        this.runtime = runtime;
        this.fonts = ['Arial', 'Verdana', 'Courier', 'Times New Roman', 'Comic Sans MS'];
        this.texts = {};
        this.nextId = 0;
      }
  
      getInfo() {
        return {
          id: 'textengine',
          name: 'Text Engine',
          blocks: [
            {
              opcode: 'createText',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Créer texte [TEXT] avec police [FONT] taille [SIZE] couleur [COLOR] x: [X] y: [Y]',
              arguments: {
                TEXT: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'Hello World'
                },
                FONT: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'fontMenu'
                },
                SIZE: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 24
                },
                COLOR: {
                  type: Scratch.ArgumentType.COLOR,
                  defaultValue: '#000000'
                },
                X: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 0
                },
                Y: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 0
                }
              }
            },
            {
              opcode: 'changeFont',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Changer police du texte [TEXT_ID] à [FONT]',
              arguments: {
                TEXT_ID: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'textMenu'
                },
                FONT: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'fontMenu'
                }
              }
            },
            {
              opcode: 'setTextSize',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Définir taille du texte [TEXT_ID] à [SIZE]',
              arguments: {
                TEXT_ID: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'textMenu'
                },
                SIZE: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 24
                }
              }
            },
            {
              opcode: 'changeTextColor',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Changer couleur du texte [TEXT_ID] à [COLOR]',
              arguments: {
                TEXT_ID: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'textMenu'
                },
                COLOR: {
                  type: Scratch.ArgumentType.COLOR,
                  defaultValue: '#000000'
                }
              }
            },
             {
              opcode: 'setPosition',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Définir la position du texte [TEXT_ID] x: [X] y: [Y]',
              arguments: {
                TEXT_ID: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'textMenu'
                },
                X: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 0
                },
                Y: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 0
                }
              }
            },
            {
              opcode: 'clearText',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Supprimer le texte [TEXT_ID]',
              arguments: {
                TEXT_ID: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'textMenu'
                }
              }
            }
          ],
          menus: {
            fontMenu: {
              acceptReporters: true,
              items: this.fonts
            },
            textMenu: () => {
              return Object.keys(this.texts);
            }
          }
        };
      }
  
      createText(args, util) {
          const text = args.TEXT;
          const font = args.FONT;
          const size = args.SIZE;
          const color = args.COLOR;
          const x = args.X;
          const y = args.Y;
  
          // Créer un canvas pour dessiner le texte
          const canvas = document.createElement('canvas');
          canvas.width = 480; // Largeur du canvas (modifiable)
          canvas.height = 360; // Hauteur du canvas (modifiable)
          canvas.style.position = 'absolute';
          canvas.style.left = '0px';
          canvas.style.top = '0px';
          canvas.style.pointerEvents = 'none'; // Empêcher l'interaction avec le canvas
  
          // Définir le style du texte
          const ctx = canvas.getContext('2d');
          ctx.font = `${size}px ${font}`;
          ctx.fillStyle = color;
          ctx.textAlign = 'center'; // Alignement horizontal au centre
          ctx.textBaseline = 'middle'; // Alignement vertical au milieu
  
          // Dessiner le texte au centre du canvas
          ctx.fillText(text, x, y);
  
          // Ajouter le canvas au stage
          const stage = util.runtime.stageElement;
          stage.appendChild(canvas);
  
          const id = `text-${this.nextId++}`;
          this.texts[id] = {
              element: canvas,
              font: font,
              size: size,
              color: color,
              x: x,
              y: y
          };
  
          return id; // Retourne l'ID du texte créé
      }
  
  
      changeFont(args) {
        const textId = args.TEXT_ID;
        const font = args.FONT;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          const canvas = textInfo.element;
          const ctx = canvas.getContext('2d');
          ctx.font = `${textInfo.size}px ${font}`;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = textInfo.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, textInfo.x, textInfo.y);
  
          textInfo.font = font;
        }
      }
  
      setTextSize(args) {
        const textId = args.TEXT_ID;
        const size = args.SIZE;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          const canvas = textInfo.element;
          const ctx = canvas.getContext('2d');
          ctx.font = `${size}px ${textInfo.font}`;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = textInfo.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, textInfo.x, textInfo.y);
  
          textInfo.size = size;
        }
      }
  
      changeTextColor(args) {
        const textId = args.TEXT_ID;
        const color = args.COLOR;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          const canvas = textInfo.element;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = color;
          ctx.font = `${textInfo.size}px ${textInfo.font}`;
           ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, textInfo.x, textInfo.y);
  
          textInfo.color = color;
        }
      }
  
      setPosition(args) {
        const textId = args.TEXT_ID;
        const x = args.X;
        const y = args.Y;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          const canvas = textInfo.element;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = textInfo.color;
          ctx.font = `${textInfo.size}px ${textInfo.font}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, x, y);
  
          textInfo.x = x;
          textInfo.y = y;
        }
      }
  
      clearText(args) {
        const textId = args.TEXT_ID;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          const canvas = textInfo.element;
          canvas.remove(); // Supprime le canvas du DOM
          delete this.texts[textId]; // Supprime l'entrée du dictionnaire
        }
      }
    }
  
    Scratch.extensions.register(new TextEngine());
  })(Scratch);
  