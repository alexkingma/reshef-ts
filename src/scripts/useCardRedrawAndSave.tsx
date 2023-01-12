import frame_effectMonster from "@/assets/images/blueprints/effect.png";
import frame_monster from "@/assets/images/blueprints/normal.png";
import frame_obelisk from "@/assets/images/blueprints/obelisk.png";
import frame_ra from "@/assets/images/blueprints/ra.png";
import frame_ritual from "@/assets/images/blueprints/ritual.png";
import frame_slifer from "@/assets/images/blueprints/slifer.png";
import frame_spell from "@/assets/images/blueprints/spell.png";
import frame_trap from "@/assets/images/blueprints/trap.png";
import levelImgSrc from "@/assets/images/level.png";
import spellImgSrc from "@/assets/images/spell.png";
import trapImgSrc from "@/assets/images/trap.png";
import { Monster } from "@/duel/common";
import { getCard } from "@/duel/util/cardUtil";
import JSZip from "jszip";
import React, { useState } from "react";
import {
  getAlignmentImage,
  getOverrideImage,
  getReferenceAnimeImage,
} from "../common/image";

const getCardBaseImgSrc = (card: Card) => {
  let img;
  if (card.category === "Magic") {
    img = frame_spell;
  } else if (card.category === "Trap") {
    img = frame_trap;
  } else if (
    card.category === "Ritual" ||
    [
      Monster.BlackLusterSoldier,
      Monster.MagicianOfBlackChaos,
      Monster.Relinquished,
    ].includes(card.name as Monster)
  ) {
    img = frame_ritual;
  } else if (card.name === Monster.ObeliskTheTormentor) {
    img = frame_obelisk;
  } else if (card.name === Monster.SliferTheSkyDragon) {
    img = frame_slifer;
  } else if (card.name.includes("The Winged Dragon of Ra")) {
    img = frame_ra;
  } else if (
    (card.category === "Monster" && card.effect) ||
    [
      Monster.ExodiaTheForbiddenOne,
      Monster.LeftArmOfTheForbiddenOne,
      Monster.LeftLegOfTheForbiddenOne,
      Monster.RightArmOfTheForbiddenOne,
      Monster.RightLegOfTheForbiddenOne,
    ].includes(card.name as Monster)
  ) {
    img = frame_effectMonster;
  } else {
    img = frame_monster;
  }
  return img;
};

// Redraw all card images on a canvas with a bottom border
// (the originals don't come with this for some reason),
// then zip all images into a folder and offer a download.

// Note that this hook expects the existing images to be of the
// "dual-panel" type that are visible in the Detail view,
// NOT card-only images (no description/title, etc.).
const useCardRedrawAndSave = () => {
  const zip = new JSZip();
  const [data, setData] = useState([""]);

  const loadImage = async (imgSrc: string): Promise<HTMLImageElement> => {
    const img = new Image();
    img.src = imgSrc;
    return new Promise((resolve) => {
      img.onload = async () => {
        resolve(img);
      };
    });
  };

  const generateImgData = async (cardName: CardName): Promise<string> => {
    const canvas = document.createElement("canvas");
    canvas.width = 421;
    canvas.height = 574;
    const ctx = canvas.getContext("2d")!;

    const card = getCard(cardName);
    const cardBase = await loadImage(getCardBaseImgSrc(card));
    let cardPortrait: HTMLImageElement;
    let overridePortrait: HTMLImageElement;
    try {
      cardPortrait = await loadImage(
        getReferenceAnimeImage(getCard(cardName).code)
      );
    } catch {}
    try {
      overridePortrait = await loadImage(getOverrideImage(card.name));
    } catch {}
    let alignmentIcon: HTMLImageElement;
    if (card.category === "Monster") {
      alignmentIcon = await loadImage(getAlignmentImage(card.alignment));
    }
    const levelIcon = await loadImage(levelImgSrc);
    const trapIcon = await loadImage(trapImgSrc);
    const spellIcon = await loadImage(spellImgSrc);

    return new Promise((resolve) => {
      ctx.drawImage(cardBase, 0, 0);
      if (overridePortrait) {
        ctx.drawImage(overridePortrait, 12, 12, 397, 397);
      } else if (cardPortrait) {
        ctx.drawImage(cardPortrait, 8, 8, 305, 308, 12, 12, 397, 397);
      }
      if (card.category === "Monster") {
        ctx.drawImage(alignmentIcon, 342, 436, 42, 42);

        let { level } = card as MonsterCard;
        const starSpacing = level === 12 ? 27 : 28;
        const offset = level >= 6 ? (level / 12) * 38 : 0;
        for (let i = 0; i < level; i++) {
          ctx.beginPath();
          ctx.arc(
            66 - offset + 26 * ((12 - level) / 2) + i * starSpacing,
            459,
            13,
            0,
            Math.PI * 2
          );
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
          ctx.stroke();
        }

        for (let i = 0; i < level; i++) {
          ctx.drawImage(
            levelIcon,
            53 - offset + 26 * ((12 - level) / 2) + i * starSpacing,
            446,
            26,
            26
          );
        }
      } else {
        ctx.drawImage(
          card.category === "Trap" ? trapIcon : spellIcon,
          190,
          475,
          42,
          42
        );
      }

      resolve(canvas.toDataURL().split(";base64,")[1]);
    });
  };

  // useEffect(() => {
  //   (async () => {
  //     await Promise.all(
  //       cards.map(async ({ name }) => {
  //         const imgData = await generateImgData(name);
  //         zip.file(`${cardNameToFilename(name)}.png`, imgData, {
  //           base64: true,
  //         });
  //       })
  //     );

  //     zip.generateAsync({ type: "blob" }).then((content) => {
  //       saveAs(content, "cards.zip");
  //     });
  //   })();
  // }, []);

  (async () => {
    setData([
      await generateImgData(Monster.Kuriboh),
      await generateImgData(Monster.TimeWizard),
      await generateImgData(Monster.GiantSoldierOfStone),
      await generateImgData(Monster.DarkElf),
      await generateImgData(Monster.CurseOfDragon),
      await generateImgData(Monster.DarkFlareKnight),
      await generateImgData(Monster.Kazejin),
      await generateImgData(Monster.DarkNecrofear),
      await generateImgData(Monster.BSkullDragon),
      await generateImgData(Monster.GateGuardian),
      await generateImgData(Monster.SliferTheSkyDragon),
      await generateImgData(Monster.ObeliskTheTormentor),
      await generateImgData(Monster.TheWingedDragonOfRaBattleMode),
    ]);
  })();

  return (
    <>
      {data.map((imageData, i) => (
        <img key={i} src={"data:image/png;base64," + imageData} />
      ))}
    </>
  );
};

export default useCardRedrawAndSave;
