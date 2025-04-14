
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EquipmentInfoFormProps {
  data: {
    marca: string;
    modelo: string;
    serie: string;
    dimensiones: string;
    torque: string;
    aceite: string;
    velocidad: string;
  };
  updateData: (data: Partial<EquipmentInfoFormProps["data"]>) => void;
}

const EquipmentInfoForm = ({ data, updateData }: EquipmentInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marca">Marca <span className="text-red-500">*</span></Label>
          <Input
            id="marca"
            placeholder="Marca del equipo"
            value={data.marca}
            onChange={(e) => updateData({ marca: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo <span className="text-red-500">*</span></Label>
          <Input
            id="modelo"
            placeholder="Modelo del equipo"
            value={data.modelo}
            onChange={(e) => updateData({ modelo: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="serie">Número de Serie</Label>
        <Input
          id="serie"
          placeholder="Número de serie"
          value={data.serie}
          onChange={(e) => updateData({ serie: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dimensiones">Dimensiones</Label>
        <Input
          id="dimensiones"
          placeholder="Dimensiones del equipo"
          value={data.dimensiones}
          onChange={(e) => updateData({ dimensiones: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="torque">Torque</Label>
          <Input
            id="torque"
            placeholder="Especificación de torque"
            value={data.torque}
            onChange={(e) => updateData({ torque: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="aceite">Aceite/Lubricación</Label>
          <Input
            id="aceite"
            placeholder="Tipo de aceite"
            value={data.aceite}
            onChange={(e) => updateData({ aceite: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="velocidad">Velocidad</Label>
          <Input
            id="velocidad"
            placeholder="Velocidad de operación"
            value={data.velocidad}
            onChange={(e) => updateData({ velocidad: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default EquipmentInfoForm;
