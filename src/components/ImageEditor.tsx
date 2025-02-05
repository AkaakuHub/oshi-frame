import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import { Button, Input } from "@mui/material";
import { IconDeviceFloppy } from "@tabler/icons-react";

interface UploadedImage {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

interface DraggableImageProps {
  image: UploadedImage;
  onDragMove: (id: string, x: number, y: number) => void;
  onWheel: (id: string, event: Konva.KonvaEventObject<WheelEvent>) => void;
  onBringForward: (id: string) => void;
}

const DraggableImage: React.FC<DraggableImageProps> = ({ image, onDragMove, onWheel, onBringForward }) => {
  const [img] = useImage(image.src);
  return (
    <Image
      image={img}
      alt="uploaded"
      x={image.x}
      y={image.y}
      scaleX={image.scale}
      scaleY={image.scale}
      draggable
      onDragMove={(e) => onDragMove(image.id, e.target.x(), e.target.y())}
      onWheel={(e) => onWheel(image.id, e)}
      onClick={() => onBringForward(image.id)}
    />
  );
};

interface ImageEditorProps {
  readonly onCompleteHandler: (data: string) => void;
  readonly onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onCompleteHandler, onClose }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const STAGE_WIDTH = 1080;
  const STAGE_HEIGHT = 1920;

  useEffect(() => {
    const fitStageIntoParentContainer = () => {
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const scale = Math.min(containerWidth / STAGE_WIDTH, containerHeight / STAGE_HEIGHT)
        setScale(scale);
      }
    };
    fitStageIntoParentContainer();
    window.addEventListener("resize", fitStageIntoParentContainer);
    return () => window.removeEventListener("resize", fitStageIntoParentContainer);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map((file, index) => {
      const src = URL.createObjectURL(file);
      return {
        id: `${Date.now()}-${index}`,
        src,
        x: 100 + index * 20,
        y: 100 + index * 20,
        scale: 1,
        zIndex: images.length + index,
      };
    });
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDragMove = (id: string, x: number, y: number) => {
    setImages((prev) => prev.map(img => img.id === id ? { ...img, x, y } : img));
  };

  const handleWheel = (id: string, event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    setImages((prev) => prev.map(img =>
      img.id === id ? { ...img, scale: Math.max(0.1, img.scale + event.evt.deltaY * -0.001) } : img
    ));
  };

  const bringForward = (id: string) => {
    setImages((prev) => {
      const maxZIndex = Math.max(...prev.map(img => img.zIndex), 0) + 1;
      return prev.map(img => img.id === id ? { ...img, zIndex: maxZIndex } : img);
    });
  };

  const exportCanvas = () => {
    if (stageRef.current) {
      // 一時的にスケールをリセットしてからデータURLを取得
      const originalScale = stageRef.current.scaleX();
      stageRef.current.scale({ x: 1, y: 1 });
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 1 });
      stageRef.current.scale({ x: originalScale, y: originalScale });
      onCompleteHandler(dataURL);
    }
  };

  return (
    <div
      className="w-[80vw] h-[80dvh] p-2 flex flex-col justify-between items-center gap-4"
    >
      <div className="flex justify-between items-center w-full">
        <Button onClick={onClose} variant="contained" color="error">
          閉じる
        </Button>
        <Button onClick={exportCanvas} variant="contained" color="success" startIcon={<IconDeviceFloppy />}>
          保存
        </Button>
      </div>
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center"
        style={{
          height: "calc(100% - 80px)",
        }}
      >
        <div
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `scale(${scale})`,
          }}
          className="solid-border border-2 border-black"
        >
          <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef}>
            <Layer>
              {images
                .toSorted((a, b) => a.zIndex - b.zIndex)
                .map((img) => (
                  <DraggableImage
                    key={img.id}
                    image={img}
                    onDragMove={handleDragMove}
                    onWheel={handleWheel}
                    onBringForward={bringForward}
                  />
                ))}
            </Layer>
          </Stage>
        </div>
      </div>
      <div className="h-12 flex justify-center items-center">
        <label htmlFor="upload-image"
        >
          <Input
            id="upload-image"
            type="file"
            inputProps={{ accept: "image/*", multiple: false }}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <Button
            component="span"
            variant="contained"
            color="primary"
            startIcon={<IconDeviceFloppy />}
          >
            画像をアップロード
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImageEditor;
