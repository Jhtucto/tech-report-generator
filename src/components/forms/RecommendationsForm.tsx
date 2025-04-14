
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RecommendationsFormProps {
  data: {
    recomendaciones: string;
  };
  updateData: (data: Partial<RecommendationsFormProps["data"]>) => void;
}

const RecommendationsForm = ({ data, updateData }: RecommendationsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recomendaciones">Recomendaciones y Próximos Pasos <span className="text-red-500">*</span></Label>
        <Textarea
          id="recomendaciones"
          placeholder="Detalle las recomendaciones técnicas y próximos pasos sugeridos"
          rows={10}
          value={data.recomendaciones}
          onChange={(e) => updateData({ recomendaciones: e.target.value })}
          required
        />
        <p className="text-sm text-gray-500">
          Describa las acciones recomendadas para el cliente, mantenimientos preventivos futuros, o cualquier sugerencia que ayude a prolongar la vida útil del equipo.
        </p>
      </div>
    </div>
  );
};

export default RecommendationsForm;
