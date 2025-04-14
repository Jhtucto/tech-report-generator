import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EquipmentInfoForm from "./forms/EquipmentInfoForm";
import ProjectInfoForm from "./forms/ProjectInfoForm";
import ActivitiesForm from "./forms/ActivitiesForm";
import FindingsForm from "./forms/FindingsForm";
import PhotosForm from "./forms/PhotosForm";
import RecommendationsForm from "./forms/RecommendationsForm";
import FormProgress from "./FormProgress";
import ReportPreview from "./ReportPreview";
import { toast } from "@/components/ui/use-toast";

const FORM_STEPS = [
  "Información del Proyecto",
  "Datos del Equipo",
  "Actividades",
  "Hallazgos",
  "Fotografías",
  "Recomendaciones",
  "Vista Previa"
];

const ReportForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportLinks, setReportLinks] = useState<{ link_informe?: string; link_pdf?: string }>({});
  
  const [formData, setFormData] = useState({
    // Project info
    cliente: "",
    fecha: "",
    proyecto: "",
    responsable: "",
    referencia_equipo: "",
    
    // Equipment info
    marca: "",
    modelo: "",
    serie: "",
    dimensiones: "",
    torque: "",
    aceite: "",
    velocidad: "",
    
    // Other sections
    resumen: "",
    actividades: [{ fecha: "", descripcion: "" }],
    hallazgos: "",
    recomendaciones: "",
    fotos: [] as File[],
    fotosMeta: [] as { file: File; etiqueta: "antes" | "durante" | "despues"; comentario: string }[],
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all text data as JSON
      const textData = {...formData};
      delete textData.fotos;
      delete textData.fotosMeta;
      
      formDataToSend.append("data", JSON.stringify(textData));
      
      // Add each photo with metadata
      formData.fotosMeta.forEach((photoMeta, index) => {
        formDataToSend.append(`foto_${index}`, photoMeta.file);
        formDataToSend.append(`foto_${index}_meta`, JSON.stringify({
          etiqueta: photoMeta.etiqueta,
          comentario: photoMeta.comentario
        }));
      });
      
      // Example webhook URL - this should be configurable or set in environment variables
      const webhookUrl = "https://your-n8n-webhook-url.com";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error("Error al enviar el informe");
      }
      
      const responseData = await response.json();
      setReportLinks(responseData);
      
      toast({
        title: "Informe generado con éxito",
        description: "Se han generado los enlaces a su informe",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el informe. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return <ProjectInfoForm data={formData} updateData={updateFormData} />;
      case 1:
        return <EquipmentInfoForm data={formData} updateData={updateFormData} />;
      case 2:
        return <ActivitiesForm data={formData} updateData={updateFormData} />;
      case 3:
        return <FindingsForm data={formData} updateData={updateFormData} />;
      case 4:
        return <PhotosForm data={formData} updateData={updateFormData} />;
      case 5:
        return <RecommendationsForm data={formData} updateData={updateFormData} />;
      case 6:
        return <ReportPreview data={formData} reportLinks={reportLinks} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === FORM_STEPS.length - 1;
  const isPreviewStep = currentStep === 6;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <FormProgress steps={FORM_STEPS} currentStep={currentStep} />
      
      <Card className="mt-6 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{FORM_STEPS[currentStep]}</h2>
          <p className="text-gray-500 mt-1">
            {currentStep === 0 && "Ingrese la información general del proyecto"}
            {currentStep === 1 && "Ingrese los datos técnicos del equipo"}
            {currentStep === 2 && "Detalle las actividades realizadas por fecha"}
            {currentStep === 3 && "Describa los hallazgos técnicos encontrados"}
            {currentStep === 4 && "Suba fotografías del proceso"}
            {currentStep === 5 && "Agregue recomendaciones y próximos pasos"}
            {currentStep === 6 && "Verifique la información antes de generar el informe"}
          </p>
        </div>
        
        {renderFormStep()}
        
        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              Anterior
            </Button>
          )}
          
          {!isLastStep ? (
            <Button 
              className="ml-auto" 
              onClick={handleNext}
            >
              Siguiente
            </Button>
          ) : (
            <Button 
              className="ml-auto bg-blue-600 hover:bg-blue-700" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Generar Informe"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReportForm;
