import { useRef } from "react";
import { IconLibraryPhoto, IconCameraRotate } from "@tabler/icons-react";

interface NavigationProps {
  readonly videoRef: React.RefObject<HTMLVideoElement>;
  readonly toggleCamera: () => void;
  readonly canSwitchCamera: boolean;
}

export default function Navigation({ videoRef, toggleCamera, canSwitchCamera }: NavigationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shutterButtonRef = useRef<HTMLButtonElement>(null);

  const handleCapture = async () => {
    console.log("handleCapture");
    if (!videoRef.current || !canvasRef.current || !shutterButtonRef.current) return;
    // activeを付与し、200ms後に削除
    // なぜかtailwindのだと反応しない
    console.log("add opacity-50");
    shutterButtonRef.current.classList.add("opacity-50");
    setTimeout(() => {
      if (shutterButtonRef.current) {
        console.log("remove opacity-50");
        shutterButtonRef.current.classList.remove("opacity-50");
      }
    }, 200);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
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
    context.drawImage(videoRef.current, sx, sy, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const text: string = "画像です。";
      const file = new File([blob], "photo.png", { type: "image/png" });
      navigator.share({
        text: decodeURI(text),
        files: [file],
      }).catch((error) => {
        console.log("Sharing failed", error);
      });
    });
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute bottom-0 w-full h-[120px] bg-black/20 flex justify-between items-center px-8">
        <button type="button" className="w-14 h-14 flex justify-center items-center">
          <IconLibraryPhoto size={28} className="text-white" />
        </button>

        <button
          ref={shutterButtonRef}
          type="button"
          className="w-20 h-20 flex justify-center items-center rounded-full border-4 border-black bg-transparent"
          onClick={handleCapture}
        >
          <div className="w-[4.5rem] h-[4.5rem] flex justify-center items-center rounded-full">
            <div className="w-[4rem] h-[4rem] bg-white rounded-full" />
          </div>
        </button>


        {canSwitchCamera ? (
          <button
            type="button"
            className="w-14 h-14 flex justify-center items-center"
            onClick={toggleCamera}
          >
            <IconCameraRotate size={28} className="text-white" />
          </button>
        ) : (
          <div className="w-14 h-14" />
        )}
      </div>
    </>
  );
}
