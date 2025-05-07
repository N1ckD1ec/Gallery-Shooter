class TitleScene extends Phaser.Scene {
    constructor() {
      super("titleScene");
    }
  
    preload() {
      // If you have a title graphic, load it here.
      // e.g. this.load.image("titleBG", "title_background.png");
    }
  
    create() {
      // Optional background:
      // this.add.image(400, 300, "titleBG");
  
      // Game title
      this.add.text(400, 200, "Gallery Shooter", {
        fontSize: "48px",
        fill: "#ffffff",
        fontFamily: "Arial",
        fontStyle: "bold",
      }).setOrigin(0.5);
  
      // “Click to Start”
      const startText = this.add.text(400, 300, "Click to Start", {
        fontSize: "24px",
        fill: "#ffff00",
        fontFamily: "Arial",
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
  
      // on first click, launch the main game
      startText.once("pointerup", () => {
        this.scene.start("instructionScene");
      });
    }
  }
  