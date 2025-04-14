
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ActivitiesFormProps {
  data: {
    actividades: { fecha: string; descripcion: string }[];
    resumen: string;
  };
  updateData: (data: Partial<ActivitiesFormProps["data"]>) => void;
}

const ActivitiesForm = ({ data, updateData }: ActivitiesFormProps) => {
  const addActivity = () => {
    const actividades = [...data.actividades, { fecha: "", descripcion: "" }];
    updateData({ actividades });
  };

  const removeActivity = (index: number) => {
    const actividades = [...data.actividades];
    actividades.splice(index, 1);
    updateData({ actividades });
  };

  const updateActivity = (index: number, field: "fecha" | "descripcion", value: string) => {
    const actividades = [...data.actividades];
    actividades[index][field] = value;
    updateData({ actividades });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resumen">Resumen Ejecutivo <span className="text-red-500">*</span></Label>
        <Textarea
          id="resumen"
          placeholder="Escriba un resumen ejecutivo de las actividades"
          rows={4}
          value={data.resumen}
          onChange={(e) => updateData({ resumen: e.target.value })}
          required
        />
        <p className="text-sm text-gray-500">
          Describa brevemente el alcance del trabajo y los principales hitos.
        </p>
      </div>
      
      <div>
        <Label>Actividades por Fecha <span className="text-red-500">*</span></Label>
        <p className="text-sm text-gray-500 mb-3">
          Agregue las actividades realizadas organizadas por fecha.
        </p>
        
        {data.actividades.map((actividad, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex justify-between mb-2">
              <h4 className="font-medium">Actividad {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeActivity(index)}
                disabled={data.actividades.length === 1}
                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2Icon size={16} />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor={`fecha-${index}`}>Fecha</Label>
                <Input
                  id={`fecha-${index}`}
                  type="date"
                  value={actividad.fecha}
                  onChange={(e) => updateActivity(index, "fecha", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`descripcion-${index}`}>Descripción</Label>
                <Textarea
                  id={`descripcion-${index}`}
                  placeholder="Describa las actividades realizadas en esta fecha"
                  rows={3}
                  value={actividad.descripcion}
                  onChange={(e) => updateActivity(index, "descripcion", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          onClick={addActivity}
          className="flex items-center gap-1 mt-2"
        >
          <PlusCircleIcon size={16} />
          Agregar Actividad
        </Button>
      </div>
    </div>
  );
};

export default ActivitiesForm;
