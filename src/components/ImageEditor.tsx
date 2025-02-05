import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import { Button, Input, Slider } from "@mui/material";
import { IconDeviceFloppy, IconX, IconTrash, IconUpload } from "@tabler/icons-react";

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
  onPinch: (id: string, newScale: number, newX: number, newY: number) => void;
  onBringForward: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  image,
  onDragMove,
  onWheel,
  onPinch,
  onBringForward,
  onSelect,
  isSelected,
}) => {
  const [img] = useImage(image.src);
  // ピンチ操作用の初期状態を保持するためのref
  const pinchState = useRef<{
    initialDistance: number;
    initialScale: number;
    center: { x: number; y: number };
  } | null>(null);

  // タッチ開始時に現在編集中の画像として選択
  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    onSelect(image.id);
    const touches = e.evt.touches;
    if (touches && touches.length === 2 && img) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const initialDistance = Math.hypot(dx, dy);
      pinchState.current = {
        initialDistance,
        initialScale: image.scale,
        center: {
          x: image.x + (img.width * image.scale) / 2,
          y: image.y + (img.height * image.scale) / 2,
        },
      };
    }
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (pinchState.current && touches && touches.length === 2 && img) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const newDistance = Math.hypot(dx, dy);
      const scaleFactor = newDistance / pinchState.current.initialDistance;
      const newScale = pinchState.current.initialScale * scaleFactor;
      // 画像の中心が維持されるように、新しい位置を計算
      const newX = pinchState.current.center.x - (img.width * newScale) / 2;
      const newY = pinchState.current.center.y - (img.height * newScale) / 2;
      window.requestAnimationFrame(() => {
        onPinch(image.id, newScale, newX, newY);
      });
    }
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length < 2) {
      pinchState.current = null;
    }
  };

  // マウス時にも選択状態にする
  const handleMouseDown = () => {
    onSelect(image.id);
  };

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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={() => {
        onBringForward(image.id);
        onSelect(image.id);
      }}
      stroke={isSelected ? "#1da1f2" : undefined}
      strokeWidth={8}
    />
  );
};

interface ImageEditorProps {
  readonly onCompleteHandler: (data: string) => void;
  readonly onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onCompleteHandler, onClose }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // コンテナに合わせた自動スケール
  const [containerScale, setContainerScale] = useState(1);
  const STAGE_WIDTH = 1080;
  const STAGE_HEIGHT = 1920;

  useEffect(() => {
    const fitStageIntoParentContainer = () => {
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const scale = Math.min(containerWidth / STAGE_WIDTH, containerHeight / STAGE_HEIGHT);
        setContainerScale(scale);
      }
    };
    fitStageIntoParentContainer();
    window.addEventListener("resize", fitStageIntoParentContainer);
    return () => window.removeEventListener("resize", fitStageIntoParentContainer);
  }, []);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleImagePromise = async (file: File, index: number, newImages: UploadedImage[]) => {
    const dataUrl = await readFileAsDataURL(file);
    handleFileLoad(dataUrl, newImages, index);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const filePromises = Array.from(files).map((file, index) => handleImagePromise(file, index, newImages));

    await Promise.all(filePromises);
    setImages((prev) => [...prev, ...newImages]);

    // ファイル選択をリセット
    event.target.value = '';
  };


  const handleFileLoad = (
    src: string,
    newImages: UploadedImage[],
    index: number
  ) => {
    const id = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`;
    newImages.push({
      id,
      src,
      x: 100 + index * 20,
      y: 100 + index * 20,
      scale: 1,
      zIndex: images.length + index,
    });
  };

  const handleDragMove = (id: string, x: number, y: number) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, x, y } : img))
    );
  };

  const handleWheel = (id: string, event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, scale: Math.max(0.1, img.scale + event.evt.deltaY * -0.001) }
          : img
      )
    );
  };

  const handlePinch = (
    id: string,
    newScale: number,
    newX: number,
    newY: number
  ) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scale: Math.max(0.1, newScale), x: newX, y: newY } : img
      )
    );
  };

  const bringForward = (id: string) => {
    setImages((prev) => {
      const maxZIndex = Math.max(...prev.map((img) => img.zIndex), 0) + 1;
      return prev.map((img) => (img.id === id ? { ...img, zIndex: maxZIndex } : img));
    });
  };

  const handleSelect = (id: string) => {
    setCurrentEditingId(id);
    bringForward(id); // 選択した画像を一番手前にする
  };

  // スライダーで現在編集中の画像のscaleを変更
  const handleSliderChange = (event: Event, value: number) => {
    if (typeof value !== "number" || !currentEditingId) return;
    setImages((prev) =>
      prev.map((img) => (img.id === currentEditingId ? { ...img, scale: value } : img))
    );
  };

  // 現在編集中の画像を削除
  const deleteCurrentImage = () => {
    if (!currentEditingId) return;
    setImages((prev) => prev.filter((img) => img.id !== currentEditingId));
    setCurrentEditingId(null);
  };

  const exportCanvas = () => {
    // 青い枠線を消すために選択状態を解除
    setCurrentEditingId(null);
    // まずは選択状態を解除して再レンダリングされるのを待つ
    requestAnimationFrame(() => {
      // 更に一度描画完了を待つ
      requestAnimationFrame(() => {
        if (stageRef.current) {
          // 必要に応じてキャンバスの scale を一時的にリセット
          const originalScale = stageRef.current.scaleX();
          stageRef.current.scale({ x: 1, y: 1 });
          // キャンバスを再描画
          stageRef.current.batchDraw();
          const dataURL = stageRef.current.toDataURL({ pixelRatio: 1 });
          // スケールを元に戻す
          stageRef.current.scale({ x: originalScale, y: originalScale });
          onCompleteHandler(dataURL);
        }
      });
    });
  };

  // 現在編集中の画像のscaleを取得（なければ 1）
  const currentImageScale =
    currentEditingId && images.find((img) => img.id === currentEditingId)
      ? images.find((img) => img.id === currentEditingId)?.scale ?? 1
      : 1;

  return (
    <div className="w-[95vw] h-[95dvh] p-2 flex flex-col justify-between items-center gap-2">
      <div className="flex justify-between items-center w-full px-4">
        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          startIcon={<IconX />}
        >
          閉じる
        </Button>
        <Button
          onClick={exportCanvas}
          variant="contained"
          color="success"
          startIcon={<IconDeviceFloppy />}
          disabled={images.length === 0}
        >
          保存
        </Button>
      </div>
      <div
        ref={containerRef}
        className="w-full flex flex-col justify-center items-center"
        style={{
          height: "calc(100% - 160px)",
        }}
      >
        <div
          style={{
            width: `{${STAGE_WIDTH} - 4}`,
            height: `{${STAGE_HEIGHT} - 4}`,
            transform: `scale(${containerScale})`,
            backgroundImage: `linear-gradient(45deg, #eee 25%, transparent 25%),
                              linear-gradient(135deg, #eee 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #eee 75%),
                              linear-gradient(135deg, transparent 75%, #eee 75%)`,
            backgroundSize: "80px 80px",
            backgroundPosition: "0 0, 40px 0, 40px -40px, 0px 40px"
          }}
          className="solid-border border-4 border-black"
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
                    onPinch={handlePinch}
                    onBringForward={bringForward}
                    onSelect={handleSelect}
                    isSelected={img.id === currentEditingId}
                  />
                ))}
            </Layer>
          </Stage>
        </div>
      </div>
      <div className="h-[160px] flex justify-center items-center flex-col gap-2 px-4 py-1 w-full">
        <div className="w-full">
          <Slider
            value={currentImageScale}
            min={0.1}
            max={5.0}
            step={0.01}
            onChange={(e, value) => handleSliderChange(e, value as number)}
            aria-labelledby="image-scale-slider"
            disabled={!currentEditingId}
          />
        </div>
        <div className="w-full flex justify-between items-center">
          <Button
            onClick={deleteCurrentImage}
            variant="contained"
            color="error"
            startIcon={<IconTrash />}
            disabled={!currentEditingId}
          >
            削除
          </Button>
          <label htmlFor="upload-image">
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
              startIcon={<IconUpload />}
            >
              アップロード
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
