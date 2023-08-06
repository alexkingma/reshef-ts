import React, { useCallback, useEffect, useRef, useState } from "react";

enum Scene {
  Overworld = "OVERWORLD", // Kaiba's duel room
  Menu = "MENU", // precursor for trunk
  Trunk = "TRUNK",
  LoadingState = "LOADING_STATE",
  SavingState = "SAVING_STATE",
  Ante = "ANTE",
  AnteConfirm = "ANTE_CONFIRM",
  DuelOtherDialogue = "DUEL_OTHER_DIALOGUE",
  DuelOwnDialogue = "DUEL_OWN_DIALOGUE",
  DuelPending = "DUEL_PENDING",
}

const SCENE_LIST = [
  {
    scene: Scene.Overworld,
    coords: [398, 509],
    rgba: [240, 233, 152, 255],
  },
  {
    scene: Scene.Menu,
    coords: [177, 242],
    rgba: [170, 82, 204, 255],
  },
  {
    scene: Scene.Trunk,
    coords: [47, 112],
    rgba: [24, 65, 245, 255],
  },
];

const useScreenshot = () => {
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

const getPixelRGBA = (bitmap: ImageBitmap, x: number, y: number) => {
  const offscreenCanvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const offscreenCtx = offscreenCanvas.getContext("2d")!;
  offscreenCtx.drawImage(bitmap, 0, 0);
  const rgba = offscreenCtx.getImageData(
    x,
    y,
    bitmap.width,
    bitmap.height
  ).data;
  console.log(x, y, `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`);

  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
};

const isSceneMatch = (ctx: CanvasRenderingContext2D) => {
  // check all coord/rgba combos to find out which scene we're in
  const isRgbaMatch = (rgba1: number[], rgba2: number[]) => {
    const [r1, g1, b1, a1] = rgba1;
    const [r2, g2, b2, a2] = rgba2;
    return r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2;
  };

  for (const { coords, rgba, scene } of SCENE_LIST) {
    const [x, y] = coords;
    const isMatch = isRgbaMatch([...ctx.getImageData(x, y, 1, 1).data], rgba);
    if (isMatch) {
      console.log(isMatch, scene);
    }
  }
};

const useBot = () => {
  const { takeScreenshot } = useScreenshot();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap>();
  const [rgba, setRgba] = useState("");
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);

  const sendDataToServer = async () => {
    await fetch("http://127.0.0.1:8080/keypress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "1" }),
    })
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    // take screenshot every X seconds
    const intervalId = setInterval(async () => {
      setBitmap(await takeScreenshot());
    }, 500);

    return () => clearInterval(intervalId);
  }, [takeScreenshot]);

  useEffect(() => {
    // update canvas every time a new screenshot comes in
    if (bitmap && canvasRef.current) {
      setRgba(getPixelRGBA(bitmap, x, y));

      const canvas = canvasRef.current;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);

      // TODO:
      isSceneMatch(ctx);

      // draw red box around selected pixel, for visual assistance
      const boxSize = 50;
      ctx.strokeStyle = "red";
      ctx.strokeRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);
    }
  }, [canvasRef, bitmap, x, y]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setX(Math.floor(mouseX));
    setY(Math.floor(mouseY));
  };

  return (
    <>
      {bitmap && (
        <>
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} />
          <div
            style={{
              backgroundColor: rgba,
              width: 600,
              height: 100,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {x},{y}
            <br />
            {rgba}
          </div>
        </>
      )}
    </>
  );
};

export default useBot;
