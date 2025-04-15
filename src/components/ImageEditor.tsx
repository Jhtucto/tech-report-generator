import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import {
  Square,
  ArrowUp,
  Type,
  Undo,
  Redo,
  Move,
  Circle,
  Check,
  X
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { isInEnum, loadImageToCanvas } from "./ImageEditorUtils";

interface ImageEditorProps {
  imageFile: File | null;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

const EDITOR_MODES = ["select", "rectangle", "arrow", "text", "circle"] as const;
type EditorMode = typeof EDITOR_MODES[number];

const ImageEditor = ({ imageFile, onSave, onCancel }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [mode, setMode] = useState<EditorMode>("select");
  const [color, setColor] = useState("#FF0000");
  const [textInput, setTextInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  const isModeActive = (currentMode: string): boolean => {
    return isInEnum(currentMode, EDITOR_MODES) && mode === currentMode;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      selection: true,
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas || !imageFile) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const imgInstance = new fabric.Image(img, {
          left: 0,
          top: 0,
          selectable: false,
        });
        canvas.clear();
        canvas.setBackgroundImage(imgInstance, canvas.renderAll.bind(canvas));
        canvas.renderAll();
        saveToHistory();
        setIsLoading(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(imageFile);
  }, [canvas, imageFile]);

  // ... el resto del código permanece igual hasta el return

  return (
    <div className="flex flex-col">
      <div className="flex flex-col mb-4 items-center">
        <label className="text-sm mb-1 font-medium">Tomar foto desde cámara</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setIsLoading(true);
              const reader = new FileReader();
              reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                  const imgInstance = new fabric.Image(img, {
                    left: 0,
                    top: 0,
                    selectable: false,
                  });
                  canvas?.clear();
                  canvas?.setBackgroundImage(imgInstance, canvas?.renderAll.bind(canvas));
                  canvas?.renderAll();
                  saveToHistory();
                  setIsLoading(false);
                };
                img.src = reader.result as string;
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
      <div className="bg-gray-100 p-2 rounded-md overflow-auto flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-md">
            <p className="bg-white px-4 py-2 rounded-md shadow-md">Cargando imagen...</p>
          </div>
        )}
        <canvas ref={canvasRef} className="border border-gray-300 bg-white" />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />Guardar
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;
