
import { Canvas, Image } from "fabric";

// Type guard to check if a string is in a specific union type
export function isInEnum<T extends string>(value: string, enumValues: readonly T[]): value is T {
  return (enumValues as readonly string[]).includes(value);
}

// Helper for type-safe string comparisons
export function safeCompare<T extends string>(value1: T, value2: string): boolean {
  return value1 === value2;
}

// Image loading helper with improved error handling
export function loadImageToCanvas(
  canvas: Canvas, 
  imageFile: File, 
  onLoad?: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error("Failed to read file"));
        return;
      }
      
      const dataUrl = event.target.result.toString();
      
      // Preload the image to check for errors
      const img = new window.Image();
      img.onload = () => {
        // Now load into fabric after we know the image is valid
        Image.fromURL(dataUrl, (fabricImg) => {
          const canvasWidth = canvas.width || 800;
          const canvasHeight = canvas.height || 600;
          
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
          
          if (onLoad) onLoad();
          resolve();
        });
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
