;((Scratch) => {
  class NumberTranslator {
    constructor() {
      this.name = "Number Translator"
    }

    getInfo() {
      return {
        id: "numbertranslator",
        name: "Number Translator",
        color1: "#FF6680",
        color2: "#FF4D6A",
        color3: "#FF3355",
        blocks: [
          {
            opcode: "translateNumber",
            blockType: Scratch.BlockType.REPORTER,
            text: "traduire [NUMBER] en format court",
            arguments: {
              NUMBER: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1251,
              },
            },
          },
          {
            opcode: "translateToK",
            blockType: Scratch.BlockType.REPORTER,
            text: "traduire [NUMBER] en milliers (K)",
            arguments: {
              NUMBER: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1251,
              },
            },
          },
          {
            opcode: "translateToM",
            blockType: Scratch.BlockType.REPORTER,
            text: "traduire [NUMBER] en millions (M)",
            arguments: {
              NUMBER: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2530000,
              },
            },
          },
          {
            opcode: "isThousands",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "[NUMBER] est >= 1000?",
            arguments: {
              NUMBER: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1000,
              },
            },
          },
          {
            opcode: "isMillions",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "[NUMBER] est >= 1 million?",
            arguments: {
              NUMBER: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1000000,
              },
            },
          },
        ],
      }
    }

    translateNumber(args) {
      const num = Number.parseFloat(args.NUMBER)

      if (isNaN(num)) {
        return "0"
      }

      const absNum = Math.abs(num)
      const sign = num < 0 ? "-" : ""

      // Millions
      if (absNum >= 1000000) {
        const millions = (absNum / 1000000).toFixed(2)
        return sign + millions.replace(".", ",") + "M"
      }

      // Milliers
      if (absNum >= 1000) {
        const thousands = (absNum / 1000).toFixed(1)
        return sign + thousands.replace(".", ",") + "K"
      }

      // Nombre normal
      return num.toString()
    }

    translateToK(args) {
      const num = Number.parseFloat(args.NUMBER)

      if (isNaN(num)) {
        return "0K"
      }

      const absNum = Math.abs(num)
      const sign = num < 0 ? "-" : ""
      const thousands = (absNum / 1000).toFixed(1)

      return sign + thousands.replace(".", ",") + "K"
    }

    translateToM(args) {
      const num = Number.parseFloat(args.NUMBER)

      if (isNaN(num)) {
        return "0M"
      }

      const absNum = Math.abs(num)
      const sign = num < 0 ? "-" : ""
      const millions = (absNum / 1000000).toFixed(2)

      return sign + millions.replace(".", ",") + "M"
    }

    isThousands(args) {
      const num = Number.parseFloat(args.NUMBER)
      return !isNaN(num) && Math.abs(num) >= 1000
    }

    isMillions(args) {
      const num = Number.parseFloat(args.NUMBER)
      return !isNaN(num) && Math.abs(num) >= 1000000
    }
  }

  Scratch.extensions.register(new NumberTranslator())
})(window.Scratch)
