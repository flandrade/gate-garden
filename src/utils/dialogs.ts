import { TEXT_STYLES } from "./textConfig";

const createButtonDialog = (
  scene: Phaser.Scene,
  text: string,
  callback: () => void,
  container: Phaser.GameObjects.Container,
  yMargin: number
) => {
  const buttonStyle = TEXT_STYLES.mediumButton;

  const button = scene.add.text(0, yMargin, text, buttonStyle);
  button.setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback)
      .on('pointerover', () => {
          button.setStyle({ backgroundColor: buttonStyle.hoverBackgroundColor, color: buttonStyle.textHoverColor });
      })
      .on('pointerout', () => {
          button.setStyle({ backgroundColor: buttonStyle.backgroundColor, color: buttonStyle.color});
      });

  // add ability to include children in the create dialogto container if provided, otherwise add to scene
  if (container) {
    container.add(button);
  } else {
    scene.add.existing(button);
  }

  return button;
}

export const createDialogContainer = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  buttons?: {
    text: string,
    callback: () => void
  }[],
  textStyle?: Phaser.Types.GameObjects.Text.TextStyle
) => {
  // Create the dialog container
  const dialogContainer = scene.add.container(x, y);
  dialogContainer.setDepth(300);

  // Background
  const bg = scene.add.rectangle(0, 0, width, height, 0x2F1B14, 0.95);
  bg.setStrokeStyle(3, 0xFFD700);
  dialogContainer.add(bg);

  // Main text - position text dynamically based on text length
  const style = { ...(textStyle || TEXT_STYLES.dialogue), wordWrap: { width: width - width * 0.1 } };
  const dialogText = scene.add.text(0, 0, text, style);
  dialogText.setOrigin(0.5);
  dialogContainer.add(dialogText);

  // Calculate dynamic position based on text height
  const textHeight = dialogText.displayHeight;
  const containerHeight = height;
  const maxTextHeight = containerHeight * 0.6; // Max 60% of container for text

  // Position text closer to top for short text, more centered for long text
  let textY: number;
  if (textHeight < maxTextHeight * 0.3) {
    // Short text: position closer to top (25% down from top)
    textY = -height * 0.25;
  } else if (textHeight < maxTextHeight * 0.6) {
    // Medium text: position in upper-middle (35% down from top)
    textY = -height * 0.15;
  } else {
    // Long text: position more centered (45% down from top)
    textY = -height * 0.05;
  }

  dialogText.y = textY;

  // Calculate button positions below text with dynamic spacing based on text size
  if (buttons && buttons.length > 0) {
    const textBottom = dialogText.y + (dialogText.displayHeight / 2);
    const maxTextHeight = containerHeight * 0.6;

    // Dynamic margin based on text size using exact pixel values
    let margin: number;
    if (textHeight < maxTextHeight * 0.3) {
      // Short text: 40px margin
      margin = 80;
    } else {
      margin = 60;
    }

    buttons.forEach((button, index) => {
      const buttonY = textBottom + margin + (index * 70);
      createButtonDialog(scene, button.text, button.callback, dialogContainer, buttonY);
    });
  }

  // Fade in effect
  dialogContainer.setAlpha(0);
  scene.tweens.add({
    targets: dialogContainer,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });

  return dialogContainer;
}