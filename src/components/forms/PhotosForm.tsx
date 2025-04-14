import { useState, useRef } from "react";
import { Camera, UploadIcon, XIcon, Edit2, Check, Plus, Square, ArrowUp, Type, Undo, Redo } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageEditor from "@/components/ImageEditor";
import { toast } from "@/components/ui/use-toast";

interface PhotosFormProps {
  data: {
    fotosMeta: Array<{
      file: File;
      etiqueta: "antes" | "durante" | "despues";
      comentario: string;
    }>;
  };
  updateData: (data: Partial<PhotosFormProps["data"]>) => void;
}

const PhotosForm = ({ data, updateData }: PhotosFormProps) => {
  const [etiqueta, setEtiqueta] = useState<"antes" | "durante" | "despues">("antes");
  const [comentario, setComentario] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<{ file: File, index: number | null }>({ file: new File([], ""), index: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        file,
        etiqueta,
        comentario
      }));
      
      updateData({
        fotosMeta: [...data.fotosMeta, ...newPhotos]
      });
      
      // Reset the comment but keep the selected tag for convenience
      setComentario("");
      
      // Reset the file input
      e.target.value = "";
    }
  };
  
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const capturedPhoto = e.target.files[0];
      openImageEditor(capturedPhoto, null);
      e.target.value = "";
    }
  };
  
  const openImageEditor = (file: File, index: number | null) => {
    setCurrentEditingImage({ file, index });
    setIsEditorOpen(true);
  };
  
  const handleEditedImage = (editedImageBlob: Blob) => {
    const editedFile = new File([editedImageBlob], currentEditingImage.file.name, {
      type: editedImageBlob.type,
      lastModified: new Date().getTime()
    });
    
    if (currentEditingImage.index !== null) {
      // Replace existing image
      const updatedPhotos = [...data.fotosMeta];
      updatedPhotos[currentEditingImage.index] = {
        ...updatedPhotos[currentEditingImage.index],
        file: editedFile
      };
      updateData({ fotosMeta: updatedPhotos });
    } else {
      // Add new edited image
      updateData({
        fotosMeta: [...data.fotosMeta, {
          file: editedFile,
          etiqueta,
          comentario
        }]
      });
      setComentario("");
    }
    
    setIsEditorOpen(false);
    toast({
      title: "Imagen editada",
      description: currentEditingImage.index !== null 
        ? "La imagen ha sido actualizada correctamente."
        : "La imagen ha sido agregada correctamente."
    });
  };
  
  const removePhoto = (index: number) => {
    const fotosMeta = [...data.fotosMeta];
    fotosMeta.splice(index, 1);
    updateData({ fotosMeta });
    
    toast({
      title: "Imagen eliminada",
      description: "La fotografía ha sido eliminada."
    });
  };
  
  const editExistingPhoto = (index: number) => {
    const photo = data.fotosMeta[index];
    openImageEditor(photo.file, index);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Agregar Fotografías</Label>
          <p className="text-sm text-gray-500 mb-4">
            Suba fotos del equipo, categorizadas en "Antes", "Durante" o "Después" del servicio.
          </p>
          
          <div className="space-y-4 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="etiqueta">Etiqueta</Label>
                <Select 
                  value={etiqueta} 
                  onValueChange={(value) => setEtiqueta(value as "antes" | "durante" | "despues")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una etiqueta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antes">Antes</SelectItem>
                    <SelectItem value="durante">Durante</SelectItem>
                    <SelectItem value="despues">Después</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comentario">Comentario</Label>
                <Input
                  id="comentario"
                  placeholder="Breve descripción de la fotografía"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraCapture}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 max-w-[150px]"
              >
                <Camera className="mr-2 h-4 w-4" />
                Cámara
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 max-w-[150px]"
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Galería
              </Button>
            </div>
          </div>
        </div>
        
        {data.fotosMeta.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 mt-6">Fotografías Cargadas ({data.fotosMeta.length})</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.fotosMeta.map((foto, index) => (
                <div key={index} className="relative border border-gray-200 rounded-md p-2">
                  <div className="absolute right-2 top-2 flex gap-1 z-10">
                    <button
                      type="button"
                      onClick={() => editExistingPhoto(index)}
                      className="bg-white rounded-full p-1 shadow-sm hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="bg-white rounded-full p-1 shadow-sm hover:bg-red-50"
                    >
                      <XIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                    <img 
                      src={URL.createObjectURL(foto.file)} 
                      alt={`Foto ${index + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Etiqueta:</span>
                      <span className={`px-2 py-0.5 rounded-full text-white ${
                        foto.etiqueta === "antes" 
                          ? "bg-orange-500" 
                          : foto.etiqueta === "durante" 
                          ? "bg-blue-500" 
                          : "bg-green-500"
                      }`}>
                        {foto.etiqueta.charAt(0).toUpperCase() + foto.etiqueta.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 line-clamp-2">
                      <span className="font-medium">Comentario:</span> {foto.comentario || "(Sin comentario)"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-[90vw] w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editor de Imágenes</DialogTitle>
          </DialogHeader>
          
          {isEditorOpen && currentEditingImage.file.size > 0 && (
            <ImageEditor 
              imageFile={currentEditingImage.file} 
              onSave={handleEditedImage}
              onCancel={() => setIsEditorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotosForm;
