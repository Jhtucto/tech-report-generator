
// Type guard to check if a string is in a specific union type
export function isInEnum<T extends string>(value: string, enumValues: readonly T[]): value is T {
  return (enumValues as readonly string[]).includes(value);
}

// Helper for type-safe string comparisons
export function safeCompare<T extends string>(value1: T, value2: string): boolean {
  return value1 === value2;
}

// Image loading helper
export function loadImageToCanvas(
  canvas: fabric.Canvas, 
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
      
      fabric.Image.fromURL(event.target.result.toString(), (img) => {
        const canvasWidth = canvas.width || 800;
        const canvasHeight = canvas.height || 600;
        
        const scaleX = canvasWidth / img.width!;
        const scaleY = canvasHeight / img.height!;
        const scale = Math.min(scaleX, scaleY);
        
        img.scale(scale);
        img.set({
          left: (canvasWidth - img.width! * scale) / 2,
          top: (canvasHeight - img.height! * scale) / 2,
          selectable: false,
          evented: false,
        });
        
        canvas.clear();
        canvas.add(img);
        canvas.renderAll();
        
        if (onLoad) onLoad();
        resolve();
      });
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsDataURL(imageFile);
  });
}
