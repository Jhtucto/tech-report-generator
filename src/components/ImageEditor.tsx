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
  X,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { isInEnum, loadImageToCanvas } from "./ImageEditorUtils";

interface ImageEditorProps {
  imageFile: File;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

const EDITOR_MODES = ["select", "rectangle", "arrow", "text", "circle"] as const;
type EditorMode = typeof EDITOR_MODES[number];

const ImageEditor = ({ imageFile, onSave, onCancel }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [mode, setMode] = useState<EditorMode>("select");
  const [color, setColor] = useState("#FF0000"); // Default to red
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

    loadImageToCanvas(canvas, imageFile)
      .then(() => {
        saveToHistory();
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading image:", err);
        setIsLoading(false);
      });
  }, [canvas, imageFile]);

  useEffect(() => {
    if (!canvas) return;

    canvas.selection = mode === "select";

    canvas.forEachObject((obj) => {
      if (obj.type !== "image") {
        obj.selectable = mode === "select";
      }
    });

    canvas.isDrawingMode = false;

    canvas.off("mouse:down");

    if (mode === "rectangle") {
      let rect: fabric.Rect | null = null;
      let startPoint: { x: number; y: number } | null = null;

      canvas.on("mouse:down", (opt) => {
        const pointer = canvas.getPointer(opt.e);
        startPoint = { x: pointer.x, y: pointer.y };

        rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          stroke: color,
          strokeWidth: 2,
          fill: "transparent",
        });

        canvas.add(rect);
        canvas.renderAll();
      });

      canvas.on("mouse:move", (opt) => {
        if (!startPoint || !rect) return;

        const pointer = canvas.getPointer(opt.e);

        if (pointer.x < startPoint.x) {
          rect.set({ left: pointer.x });
        }
        if (pointer.y < startPoint.y) {
          rect.set({ top: pointer.y });
        }

        rect.set({
          width: Math.abs(pointer.x - startPoint.x),
          height: Math.abs(pointer.y - startPoint.y),
        });

        canvas.renderAll();
      });

      canvas.on("mouse:up", () => {
        startPoint = null;
        saveToHistory();
      });
    } else if (mode === "circle") {
      let circle: fabric.Circle | null = null;
      let startPoint: { x: number; y: number } | null = null;

      canvas.on("mouse:down", (opt) => {
        const pointer = canvas.getPointer(opt.e);
        startPoint = { x: pointer.x, y: pointer.y };

        circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          stroke: color,
          strokeWidth: 2,
          fill: "transparent",
          originX: "center",
          originY: "center",
        });

        canvas.add(circle);
        canvas.renderAll();
      });

      canvas.on("mouse:move", (opt) => {
        if (!startPoint || !circle) return;

        const pointer = canvas.getPointer(opt.e);
        const radius = Math.max(
          Math.abs(pointer.x - startPoint.x),
          Math.abs(pointer.y - startPoint.y)
        ) / 2;

        circle.set({
          left: startPoint.x,
          top: startPoint.y,
          radius: radius,
        });

        canvas.renderAll();
      });

      canvas.on("mouse:up", () => {
        startPoint = null;
        saveToHistory();
      });
    }

    return () => {
      canvas.off("mouse:down");
      canvas.off("mouse:move");
      canvas.off("mouse:up");
    };
  }, [canvas, mode, color]);

  const saveToHistory = () => {
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());

    if (historyIndex < history.length - 1) {
      setHistory((prev) => prev.slice(0, historyIndex + 1));
    }

    setHistory((prev) => [...prev, json]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (!canvas || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const json = history[newIndex];

    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleRedo = () => {
    if (!canvas || historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const json = history[newIndex];

    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const handleDelete = () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      saveToHistory();
    }
  };

  const handleSave = () => {
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 0.8,
    });

    fetch(dataURL)
      .then((res) => res.blob())
      .then((blob) => {
        onSave(blob);
      })
      .catch((err) => {
        console.error("Error saving image:", err);
      });
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataURL)).blob();

        loadImageToCanvas(canvasRef.current, blob);
      }

      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <div className="flex gap-1">
          <Toggle
            pressed={isModeActive("select")}
            onPressedChange={() => setMode("select")}
            aria-label="Select"
          >
            <Move size={16} />
          </Toggle>
          <Toggle
            pressed={isModeActive("rectangle")}
            onPressedChange={() => setMode("rectangle")}
            aria-label="Rectangle"
          >
            <Square size={16} />
          </Toggle>
          <Toggle
            pressed={isModeActive("circle")}
            onPressedChange={() => setMode("circle")}
            aria-label="Circle"
          >
            <Circle size={16} />
          </Toggle>
          <Toggle
            pressed={isModeActive("arrow")}
            onPressedChange={() => setMode("arrow")}
            aria-label="Arrow"
          >
            <ArrowUp size={16} />
          </Toggle>
        </div>

        <div className="flex gap-1 items-center">
          <Toggle
            pressed={isModeActive("text")}
            onPressedChange={() => setMode("text")}
            aria-label="Text"
          >
            <Type size={16} />
          </Toggle>
          <Input
            type="text"
            placeholder="Enter text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-36 h-8 text-sm"
            disabled={!isModeActive("text")}
          />
        </div>

        <div className="flex gap-1 items-center">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo size={16} />
          </Button>

          <Button variant="outline" size="sm" onClick={handleDelete}>
            <X size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 p-2 rounded-md overflow-auto flex justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-md">
            <p className="bg-white px-4 py-2 rounded-md shadow-md">
              Loading image...
            </p>
          </div>
        )}
        <canvas ref={canvasRef} className="border border-gray-300 bg-white" />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button variant="outline" onClick={handleCameraCapture}>
          Capture from Camera
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;
