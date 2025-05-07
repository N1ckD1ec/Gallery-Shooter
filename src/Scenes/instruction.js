class InstructionScene extends Phaser.Scene {
    constructor() {
      super("instructionScene");
    }
  
    create() {
      const { width } = this.sys.game.config;
  
      // Heading
      this.add.text(width/2, 80, "How to Play", {
        fontSize: "40px",
        fill: "#ffffff",
        fontFamily: "Arial",
        fontStyle: "bold"
      }).setOrigin(0.5);
  
      // Instruction text (multiline)
      const instructions = [
        "Controls:",
        "  • A / D → Move Left / Right",
        "  • SPACE → Fire Laser",
        "",
        "Enemies:",
        "  • Wave 1: Beige ships move side-to-side and shoot MONKEYS.",
        "  • Wave 2: Blue ships zig-zag and shoot ELEPHANTS.",
        "  • Wave 3: Yellow mothership (BOSS) fires both monkeys & elephants; takes 3 hits.",
        "",
        "Scoring & Health:",
        "  • +2 points per monkey-ship destroyed",
        "  • +3 points per elephant-ship destroyed",
        "  • −1 point if you get hit",
        "  • 10 HP to start (icons at upper-left)",
        "  • 2-kill streak → +2 HP, 3-kill streak → +3 HP (max 15)",
        "",
        "Click anywhere to begin!"
      ];
  
      this.add.text(60, 140, instructions, {
        fontSize: "18px",
        fill: "#ffcc00",
        fontFamily: "Arial",
        lineSpacing: 6
      });
  
      // Make the whole screen clickable
      this.input.once("pointerup", () => {
        this.scene.start("mainGame");
      });
    }
  }
  