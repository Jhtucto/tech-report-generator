
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FindingsFormProps {
  data: {
    hallazgos: string;
  };
  updateData: (data: Partial<FindingsFormProps["data"]>) => void;
}

const FindingsForm = ({ data, updateData }: FindingsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hallazgos">Hallazgos Técnicos <span className="text-red-500">*</span></Label>
        <Textarea
          id="hallazgos"
          placeholder="Describa los hallazgos técnicos encontrados (desgastes, fisuras, deformaciones, etc.)"
          rows={10}
          value={data.hallazgos}
          onChange={(e) => updateData({ hallazgos: e.target.value })}
          required
        />
        <p className="text-sm text-gray-500">
          Detalle los problemas identificados, condiciones anormales, desgastes, fisuras o cualquier otra observación relevante encontrada durante la inspección o reparación.
        </p>
      </div>
    </div>
  );
};

export default FindingsForm;
