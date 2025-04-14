
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectInfoFormProps {
  data: {
    cliente: string;
    fecha: string;
    proyecto: string;
    responsable: string;
    referencia_equipo: string;
  };
  updateData: (data: Partial<ProjectInfoFormProps["data"]>) => void;
}

const ProjectInfoForm = ({ data, updateData }: ProjectInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente <span className="text-red-500">*</span></Label>
          <Input
            id="cliente"
            placeholder="Nombre del cliente"
            value={data.cliente}
            onChange={(e) => updateData({ cliente: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha <span className="text-red-500">*</span></Label>
          <Input
            id="fecha"
            type="date"
            value={data.fecha}
            onChange={(e) => updateData({ fecha: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="proyecto">Proyecto <span className="text-red-500">*</span></Label>
        <Input
          id="proyecto"
          placeholder="Nombre del proyecto"
          value={data.proyecto}
          onChange={(e) => updateData({ proyecto: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="responsable">Ingeniero Responsable <span className="text-red-500">*</span></Label>
        <Input
          id="responsable"
          placeholder="Nombre del ingeniero responsable"
          value={data.responsable}
          onChange={(e) => updateData({ responsable: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="referencia_equipo">Referencia del Equipo <span className="text-red-500">*</span></Label>
        <Input
          id="referencia_equipo"
          placeholder="Referencia o nombre del equipo"
          value={data.referencia_equipo}
          onChange={(e) => updateData({ referencia_equipo: e.target.value })}
          required
        />
      </div>
    </div>
  );
};

export default ProjectInfoForm;
