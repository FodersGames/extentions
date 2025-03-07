(function(Scratch) {
    'use strict';
  
    class TextEngine {
      constructor() {
        this.fonts = ['Arial', 'Verdana', 'Courier', 'Times New Roman', 'Comic Sans MS'];
        this.sprites = [];
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
              text: 'Changer police de [SPRITE] à [FONT]',
              arguments: {
                SPRITE: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'spriteMenu'
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
              text: 'Définir taille de texte de [SPRITE] à [SIZE]',
              arguments: {
                SPRITE: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'spriteMenu'
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
              text: 'Changer couleur de texte de [SPRITE] à [COLOR]',
              arguments: {
                SPRITE: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'spriteMenu'
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
              text: 'Supprimer le texte [SPRITE]',
              arguments: {
                SPRITE: {
                  type: Scratch.ArgumentType.STRING,
                  menu: 'spriteMenu'
                }
              }
            }
          ],
          menus: {
            fontMenu: {
              acceptReporters: true,
              items: this.fonts
            },
            spriteMenu: this._getSpriteMenu()
          }
        };
      }
  
      createText(args, util) {
        const text = args.TEXT;
        const font = args.FONT;
        const size = args.SIZE;
        const color = args.COLOR;
  
        // Crée un nouvel élément de texte (par exemple, un élément DOM)
        const textElement = document.createElement('div');
        textElement.innerText = text;
        textElement.style.fontFamily = font;
        textElement.style.fontSize = `${size}px`;
        textElement.style.color = color;
        textElement.style.position = 'absolute';
        textElement.style.top = '0';
        textElement.style.left = '0';
  
        // Ajoute l'élément de texte au conteneur Scratch (ou à un conteneur spécifique)
        const stage = util.runtime.stageElement;
        stage.appendChild(textElement);
  
        // Enregistre l'élément de texte pour une manipulation ultérieure
        const spriteName = `text-${this.sprites.length}`;
        this.sprites.push({
          name: spriteName, // Nom unique pour identifier le sprite
          element: textElement,
          font: font,
          size: size,
          color: color
        });
  
         return spriteName;
      }
  
      changeFont(args) {
        const spriteName = args.SPRITE;
        const font = args.FONT;
  
        const sprite = this.sprites.find(s => s.name === spriteName);
        if (sprite) {
          sprite.element.style.fontFamily = font;
          sprite.font = font;
        }
      }
  
      setTextSize(args) {
        const spriteName = args.SPRITE;
        const size = args.SIZE;
  
        const sprite = this.sprites.find(s => s.name === spriteName);
        if (sprite) {
          sprite.element.style.fontSize = `${size}px`;
          sprite.size = size;
        }
      }
  
      changeTextColor(args) {
        const spriteName = args.SPRITE;
        const color = args.COLOR;
  
        const sprite = this.sprites.find(s => s.name === spriteName);
        if (sprite) {
          sprite.element.style.color = color;
          sprite.color = color;
        }
      }
  
      clearText(args) {
        const spriteName = args.SPRITE;
  
        const spriteIndex = this.sprites.findIndex(s => s.name === spriteName);
        if (spriteIndex !== -1) {
          const sprite = this.sprites[spriteIndex];
          sprite.element.remove(); // Supprime l'élément du DOM
          this.sprites.splice(spriteIndex, 1); // Supprime le sprite du tableau
        }
      }
  
      _getSpriteMenu() {
        return this.sprites.map(sprite => sprite.name);
      }
    }
  
    Scratch.extensions.register(new TextEngine());
  })(Scratch);
  