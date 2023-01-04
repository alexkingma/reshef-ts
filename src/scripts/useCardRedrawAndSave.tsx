import cardBottomBorder from "@/assets/images/card-bottom-border.png";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useEffect } from "react";
import cards from "../assets/cards";
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
    let mainFlag = false;
    let borderFlag = false;
    const canvas = document.createElement("canvas");
    canvas.width = 108;
    canvas.height = 147;
    const ctx = canvas.getContext("2d")!;

    return new Promise((resolve) => {
      const mainImg = new Image();
      mainImg.onload = () => {
        ctx.drawImage(mainImg, -2, -17);
        ctx.drawImage(mainImg, 2, 20, 108, 1, 0, 143, 108, 1);
        mainFlag = true;
        if (borderFlag) {
          ret();
        }
      };
      mainImg.src = getImage(cardName);

      const bottomBorderImg = new Image();
      bottomBorderImg.onload = () => {
        ctx.drawImage(bottomBorderImg, 0, 143);
        borderFlag = true;
        if (mainFlag) {
          ret();
        }
      };
      bottomBorderImg.src = cardBottomBorder;

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
