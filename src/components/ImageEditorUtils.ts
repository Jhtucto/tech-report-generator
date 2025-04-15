
import { fabric } from "fabric";

// Type guard to check if a string is in a specific union type
export function isInEnum<T extends string>(value: string, enumValues: readonly T[]): value is T {
  return (enumValues as readonly string[]).includes(value);
}

// Helper for type-safe string comparisons
export function safeCompare<T extends string>(value1: T, value2: string): boolean {
  return value1 === value2;
}

// Fixed image loading helper with improved error handling
export function loadImageToCanvas(
  canvas: fabric.Canvas, 
  imageFile: File, 
  onLoad?: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error("Canvas is not initialized"));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error("Failed to read file"));
        return;
      }
      
      const dataUrl = event.target.result.toString();
      
      // Create a native HTML Image element to preload
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        // Create a fabric image from the loaded HTML image
        const fabricImg = new fabric.Image(img);
        
        const canvasWidth = canvas.getWidth() || 800;
        const canvasHeight = canvas.getHeight() || 600;
        
        const scaleX = canvasWidth / fabricImg.width!;
        const scaleY = canvasHeight / fabricImg.height!;
        const scale = Math.min(scaleX, scaleY);
        
        fabricImg.scale(scale);
        fabricImg.set({
          left: (canvasWidth - fabricImg.width! * scale) / 2,
          top: (canvasHeight - fabricImg.height! * scale) / 2,
          selectable: false,
          evented: false,
        });
        
        canvas.clear();
        canvas.add(fabricImg);
        canvas.renderAll();
        canvas.requestRenderAll();
        
        if (onLoad) onLoad();
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error("Error loading image"));
      };
      
      img.src = dataUrl;
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsDataURL(imageFile);
  });
}
