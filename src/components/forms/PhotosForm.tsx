import { useState } from "react";
import { UploadIcon, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  
  const removePhoto = (index: number) => {
    const fotosMeta = [...data.fotosMeta];
    fotosMeta.splice(index, 1);
    updateData({ fotosMeta });
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
            
            <div>
              <Input
                id="fotos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="fotos" className="flex flex-col items-center justify-center py-6 cursor-pointer">
                <UploadIcon className="w-10 h-10 mb-2 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Haga clic para seleccionar imágenes</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 10MB</span>
              </Label>
            </div>
          </div>
        </div>
        
        {data.fotosMeta.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 mt-6">Fotografías Cargadas ({data.fotosMeta.length})</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.fotosMeta.map((foto, index) => (
                <div key={index} className="relative border border-gray-200 rounded-md p-2">
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-2 top-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 z-10"
                  >
                    <XIcon className="w-4 h-4 text-red-500" />
                  </button>
                  
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
    </div>
  );
};

export default PhotosForm;
