import type React from "react";
import { useRef } from "react";

interface NavigationProps {
  readonly videoRef: React.RefObject<HTMLVideoElement>;
  readonly toggleCamera: () => void;
}

export default function Navigation({ videoRef, toggleCamera }: NavigationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const aspectRatio = 9 / 16;
    const canvasWidth = videoHeight * aspectRatio;
    const canvasHeight = videoHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const sx = (videoWidth - canvasWidth) / 2;
    const sy = 0;
    context.drawImage(
      videoRef.current,
      sx,
      sy,
      canvasWidth,
      canvasHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const text: string = "画像です。"
      const file = new File([blob], "jimaku.png", { type: "image/png" });
      navigator.share({
        text: decodeURI(text),
        files: [file]
      }).then(() => {
        console.log("Share was successful.");
      }).catch((error) => {
        console.log("Sharing failed", error);
      });
    });
  };
  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div className="w-full h-[200px] bg-slate-600 opacity-50 fixed bottom-0">
        <div className="flex justify-center items-center h-full">
          <button type="button" className="w-32 h-32 bg-white p-2 rounded-full" onClick={handleCapture}>
          </button>
          <button type="button" className="w-16 h-16 bg-white p-2 rounded-full" onClick={toggleCamera}>
          </button>
        </div>
      </div>
    </>
  )
}