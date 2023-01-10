import cards from "@/assets/cards";
import frame_effectMonster from "@/assets/images/blueprints/card-frame/effect-monster.png";
import frame_monster from "@/assets/images/blueprints/card-frame/monster.png";
import frame_obelisk from "@/assets/images/blueprints/card-frame/obelisk.png";
import frame_ra from "@/assets/images/blueprints/card-frame/ra.png";
import frame_ritual from "@/assets/images/blueprints/card-frame/ritual.png";
import frame_slifer from "@/assets/images/blueprints/card-frame/slifer.png";
import frame_spell from "@/assets/images/blueprints/card-frame/spell.png";
import frame_trap from "@/assets/images/blueprints/card-frame/trap.png";
import { Monster } from "@/duel/common";
import { getCard } from "@/duel/util/cardUtil";
import saveAs from "file-saver";
import JSZip from "jszip";
import { useEffect } from "react";
import { cardNameToFilename, getImage } from "../common/image";

// Redraw all card images on a canvas with a bottom border
// (the originals don't come with this for some reason),
// then zip all images into a folder and offer a download.

// Note that this hook expects the existing images to be of the
// "dual-panel" type that are visible in the Detail view,
// NOT card-only images (no description/title, etc.).
const useCardRedrawAndSave = () => {
  const zip = new JSZip();

  const generateImgData = async (cardName: CardName): Promise<string> => {
    let frameFlag = false;
    let cardFlag = false;
    const canvas = document.createElement("canvas");
    canvas.width = 108;
    canvas.height = 147;
    const ctx = canvas.getContext("2d")!;

    return new Promise((resolve) => {
      const frameImg = new Image();
      frameImg.onload = () => {
        ctx.drawImage(frameImg, 0, 0);
        frameFlag = true;
        if (cardFlag) {
          ret();
        }
      };

      const card = getCard(cardName);
      let frameImport;
      if (card.category === "Magic") {
        frameImport = frame_spell;
      } else if (card.category === "Trap") {
        frameImport = frame_trap;
      } else if (
        card.category === "Ritual" ||
        [
          Monster.BlackLusterSoldier,
          Monster.MagicianOfBlackChaos,
          Monster.Relinquished,
        ].includes(card.name as Monster)
      ) {
        frameImport = frame_ritual;
      } else if (card.name === Monster.ObeliskTheTormentor) {
        frameImport = frame_obelisk;
      } else if (card.name === Monster.SliferTheSkyDragon) {
        frameImport = frame_slifer;
      } else if (card.name.includes("The Winged Dragon of Ra")) {
        frameImport = frame_ra;
      } else if (card.category === "Monster" && card.effect) {
        frameImport = frame_effectMonster;
      } else if (card.category === "Monster") {
        frameImport = frame_monster;
      }
      frameImg.src = frameImport;

      const cardImg = new Image();
      cardImg.onload = () => {
        ctx.drawImage(cardImg, 14, 37, 80, 80, 14, 12, 80, 80);
        cardFlag = true;
        if (frameFlag) {
          ret();
        }
      };
      cardImg.src = getImage(cardName);

      const ret = () => {
        resolve(canvas.toDataURL().split(";base64,")[1]);
      };
    });
  };

  useEffect(() => {
    (async () => {
      await Promise.all(
        cards.map(async ({ name }) => {
          const imgData = await generateImgData(name);
          zip.file(`${cardNameToFilename(name)}.png`, imgData, {
            base64: true,
          });
        })
      );

      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "cards.zip");
      });
    })();
  }, []);
};

export default useCardRedrawAndSave;
