import { useCallback, useEffect, useState } from "react";
import Tesseract from "tesseract.js";

export const useScreenshot = () => {
  const [loading, setLoading] = useState(false);
  const [capture, setCapture] = useState<ImageCapture>();

  useEffect(() => {
    if (!capture && !loading) {
      setLoading(true);
      navigator.mediaDevices.getDisplayMedia().then((stream) => {
        const [track] = stream.getVideoTracks();
        setCapture(new ImageCapture(track));
      });
    }
  }, [capture, loading]);

  const takeScreenshot = useCallback(async () => {
    if (!capture) return;
    const bitmap = await capture.grabFrame();
    return bitmap;
  }, [capture]);

  return { takeScreenshot };
};

export async function ocr(dataUrl: string) {
  try {
    const result = await Tesseract.recognize(dataUrl, "eng");
    console.log("OCR Result:", result.data.text);
    return result.data.text;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
}

export const getPixelRGBA = (bitmap: ImageBitmap, x: number, y: number) => {
  const offscreenCanvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const offscreenCtx = offscreenCanvas.getContext("2d")!;
  offscreenCtx.drawImage(bitmap, 0, 0);
  const [r, g, b, a] = offscreenCtx.getImageData(
    x,
    y,
    bitmap.width,
    bitmap.height
  ).data;
  console.log(x, y, `rgba(${r}, ${g}, ${b}, ${a})`);

  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};
