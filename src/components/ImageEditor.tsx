import { useState, useRef } from "react";
import type React from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";

interface UploadedImage {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

interface ImageEditorProps {
  readonly onCompleteHandler: (data: string) => void;
}

const ImageEditor = ({ onCompleteHandler }: ImageEditorProps) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const stageRef = useRef<any>(null);

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

  const handleWheel = (id: string, event: any) => {
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
      const dataURL = stageRef.current.toDataURL();
      onCompleteHandler(dataURL);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
      <button type="button" onClick={exportCanvas}>Export as Base64</button>
      <Stage width={1080} height={1920} ref={stageRef} style={{ border: "1px solid black" }}>
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
  );
};

interface DraggableImageProps {
  image: UploadedImage;
  onDragMove: (id: string, x: number, y: number) => void;
  onWheel: (id: string, event: any) => void;
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

export default ImageEditor;
