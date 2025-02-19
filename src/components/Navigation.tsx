/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { IconLibraryPhoto, IconCameraRotate } from "@tabler/icons-react";
import DecoSelect from "./DecoSelect";

interface NavigationProps {
  readonly videoRef: React.RefObject<HTMLVideoElement>;
  readonly toggleCamera: () => void;
  readonly canSwitchCamera: boolean;
  readonly filterImageArray: string[] | null;
  readonly setFilterImageArray: React.Dispatch<React.SetStateAction<string[]>>;
  readonly filterImageIndex: number;
  readonly setFilterImageIndex: (index: number) => void;
}

export default function Navigation({ videoRef, toggleCamera, canSwitchCamera, filterImageArray, setFilterImageArray, filterImageIndex, setFilterImageIndex }: NavigationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shutterButtonRef = useRef<HTMLButtonElement>(null);
  const [isDecoSelectOpen, setIsDecoSelectOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleIsDecoSelectOpen = () => {
    setIsDecoSelectOpen(true);
  };

  const handleIsDecoSelectClose = () => {
    setIsDecoSelectOpen(false);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !shutterButtonRef.current) return;
    // activeを付与し、200ms後に削除
    // なぜかtailwindのだと反応しない
    shutterButtonRef.current.classList.add("opacity-50");
    setTimeout(() => {
      if (shutterButtonRef.current) {
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

    // filterImageURLがあれば重ねる
    if (filterImageArray && filterImageArray.length > 0 && filterImageIndex >= 0) {
      const filterImage = new Image();
      filterImage.src = filterImageArray[filterImageIndex];
      await new Promise((resolve) => {
        filterImage.onload = () => {
          context.drawImage(filterImage, 0, 0, canvasWidth, canvasHeight);
          resolve(null);
        };
      });
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "photo.png", { type: "image/png" });
      navigator.share({
        // text: decodeURI(text),
        files: [file],
      }).catch((error) => {
        console.log("Sharing failed", error);
      });
    });
  };

  useEffect(() => {
    setIsTutorialOpen(false);
    setTimeout(() => {
      setIsTutorialOpen(true);
    }, 750);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute left-0 bottom-0 w-full h-[120px] flex justify-between items-center px-8 z-20">
        <div
          className="relative w-14 h-14 flex justify-center items-center"
        >
          {filterImageArray && filterImageArray.length === 0 &&
            <img
              src="/tutorial1.png"
              alt="tutorial"
              style={{
                transform: "scale(4)",
              }}
              className={`absolute top-[-80px] left-[70px] z-20 transition-opacity duration-1000 opacity-0 ${isTutorialOpen ? "opacity-100" : ""}`}
            />
          }
          <button
            type="button"
            onClick={handleIsDecoSelectOpen}
          >
            <IconLibraryPhoto size={28} className="text-white drop-shadow-[0_0_0.5rem_black]" />
          </button>
        </div>
        <button
          ref={shutterButtonRef}
          type="button"
          className="w-20 h-20 flex justify-center items-center rounded-full border-4 border-white bg-transparent"
          onClick={handleCapture}
        >
          <div className="w-[4.5rem] h-[4.5rem] flex justify-center items-center rounded-full">
            <div className="w-[4rem] h-[4rem] bg-white rounded-full drop-shadow-[0rem_0_0.5rem_black]" />
          </div>
        </button>
        {canSwitchCamera ? (
          <button
            type="button"
            className="w-14 h-14 flex justify-center items-center"
            onClick={toggleCamera}
          >
            <IconCameraRotate size={28} className="text-white drop-shadow-[0_0_0.5rem_black]" />
          </button>
        ) : (
          <div className="w-14 h-14" />
        )}
      </div>
      <DecoSelect
        isDecoSelectOpen={isDecoSelectOpen}
        handleIsDecoSelectClose={handleIsDecoSelectClose}
        filterImageArray={filterImageArray}
        setFilterImageArray={setFilterImageArray}
        filterImageIndex={filterImageIndex}
        setFilterImageIndex={setFilterImageIndex}
      />
    </>
  );
}
