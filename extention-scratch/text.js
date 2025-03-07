(function(Scratch) {
    'use strict';
  
    class TextEngine {
      constructor() {
        this.fonts = ['Arial', 'Verdana', 'Courier', 'Times New Roman', 'Comic Sans MS'];
        this.texts = {}; // Stocker les informations des textes créés
        this.nextId = 0; // ID pour identifier chaque texte
      }
  
      getInfo() {
        return {
          id: 'textengine',
          name: 'Text Engine',
          blocks: [
            {
              opcode: 'createText',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Créer texte [TEXT] avec police [FONT] taille [SIZE] couleur [COLOR]',
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
  
        const textElement = document.createElement('div');
        textElement.innerText = text;
        textElement.style.fontFamily = font;
        textElement.style.fontSize = `${size}px`;
        textElement.style.color = color;
        textElement.style.position = 'absolute';
        textElement.style.top = '0';
        textElement.style.left = '0';
  
        const stage = util.runtime.stageElement;
        stage.appendChild(textElement);
  
        const id = `text-${this.nextId++}`;
        this.texts[id] = {
          element: textElement,
          font: font,
          size: size,
          color: color
        };
  
        return id; // Retourne l'ID du texte créé
      }
  
      changeFont(args) {
        const textId = args.TEXT_ID;
        const font = args.FONT;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          textInfo.element.style.fontFamily = font;
          textInfo.font = font;
        }
      }
  
      setTextSize(args) {
        const textId = args.TEXT_ID;
        const size = args.SIZE;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          textInfo.element.style.fontSize = `${size}px`;
          textInfo.size = size;
        }
      }
  
      changeTextColor(args) {
        const textId = args.TEXT_ID;
        const color = args.COLOR;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          textInfo.element.style.color = color;
          textInfo.color = color;
        }
      }
  
      clearText(args) {
        const textId = args.TEXT_ID;
  
        const textInfo = this.texts[textId];
        if (textInfo) {
          textInfo.element.remove(); // Supprime l'élément du DOM
          delete this.texts[textId]; // Supprime l'entrée du dictionnaire
        }
      }
    }
  
    Scratch.extensions.register(new TextEngine());
  })(Scratch);
  