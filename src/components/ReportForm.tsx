
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileText, RefreshCw } from "lucide-react";
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

const LOCAL_STORAGE_KEY = "report_form_data";

const ReportForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reportLinks, setReportLinks] = useState<{ link_informe?: string; link_pdf?: string }>({});
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return {
          ...parsedData,
          fotosMeta: [],
          fotos: []
        };
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
    
    return {
      cliente: "",
      fecha: "",
      proyecto: "",
      responsable: "",
      referencia_equipo: "",
      
      marca: "",
      modelo: "",
      serie: "",
      dimensiones: "",
      torque: "",
      aceite: "",
      velocidad: "",
      
      resumen: "",
      actividades: [{ fecha: "", descripcion: "" }],
      hallazgos: "",
      recomendaciones: "",
      fotos: [] as File[],
      fotosMeta: [] as { file: File; etiqueta: "antes" | "durante" | "despues"; comentario: string }[],
    };
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    
    const dataToSave = { ...newFormData };
    delete dataToSave.fotos;
    delete dataToSave.fotosMeta;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentStep(parseInt(value));
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    const nextStep = Math.min(currentStep + 1, FORM_STEPS.length - 1);
    setCurrentStep(nextStep);
    setActiveTab(nextStep.toString());
  };

  const handlePrev = () => {
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);
    setActiveTab(prevStep.toString());
  };

  const handleStepClick = (stepIndex: number) => {
    // Check if we're trying to jump ahead and validate current step first
    if (stepIndex > currentStep && !validateCurrentStep()) {
      return;
    }
    
    setCurrentStep(stepIndex);
    setActiveTab(stepIndex.toString());
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.cliente || !formData.fecha || !formData.proyecto || !formData.responsable) {
          toast({
            title: "Campos requeridos",
            description: "Por favor complete todos los campos obligatorios.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 1:
        if (!formData.marca || !formData.modelo || !formData.serie) {
          toast({
            title: "Campos requeridos",
            description: "Por favor complete los campos obligatorios (marca, modelo y número de serie).",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2:
        if (formData.actividades.some(act => !act.fecha || !act.descripcion)) {
          toast({
            title: "Actividades incompletas",
            description: "Por favor complete todas las actividades o elimine las vacías.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 3:
        if (!formData.hallazgos) {
          toast({
            title: "Hallazgos requeridos",
            description: "Por favor ingrese los hallazgos técnicos.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const resetForm = () => {
    if (window.confirm("¿Está seguro que desea reiniciar el formulario? Se perderán todos los datos ingresados.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const formDataToSend = new FormData();
      
      const textData = {...formData};
      delete textData.fotos;
      delete textData.fotosMeta;
      
      formDataToSend.append("data", JSON.stringify(textData));
      
      formData.fotosMeta.forEach((photoMeta, index) => {
        formDataToSend.append(`foto_${index}`, photoMeta.file);
        formDataToSend.append(`foto_${index}_meta`, JSON.stringify({
          etiqueta: photoMeta.etiqueta,
          comentario: photoMeta.comentario
        }));
      });
      
      const webhookUrl = "https://your-n8n-webhook-url.com";
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            setReportLinks(responseData);
            
            toast({
              title: "Informe generado con éxito",
              description: "Se han generado los enlaces a su informe",
            });
          } catch (error) {
            console.error("Error parsing response:", error);
            toast({
              title: "Error en la respuesta",
              description: "El servidor respondió, pero hubo un problema al procesar la respuesta.",
              variant: "destructive",
            });
          }
        } else {
          console.error("Server error:", xhr.statusText);
          toast({
            title: `Error ${xhr.status}`,
            description: "Hubo un problema al generar el informe. Por favor intente nuevamente.",
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
      };
      
      xhr.onerror = () => {
        console.error("Network error");
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor. Verifique su conexión a internet.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      };
      
      // This timeout is to ensure the document is ready before generating PDF
      setTimeout(() => {
        xhr.open("POST", webhookUrl);
        xhr.send(formDataToSend);
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el informe. Por favor intente nuevamente.",
        variant: "destructive",
      });
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!isMobile && (
        <FormProgress 
          steps={FORM_STEPS} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
        />
      )}
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="grid grid-cols-7 w-full">
          {FORM_STEPS.map((step, index) => (
            <TabsTrigger 
              key={index} 
              value={index.toString()}
              className={isMobile ? "text-xs py-1" : ""}
            >
              {isMobile ? `${index + 1}` : step}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {FORM_STEPS.map((step, index) => (
          <TabsContent key={index} value={index.toString()}>
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{FORM_STEPS[index]}</h2>
                <p className="text-gray-500 mt-1">
                  {index === 0 && "Ingrese la información general del proyecto"}
                  {index === 1 && "Ingrese los datos técnicos del equipo"}
                  {index === 2 && "Detalle las actividades realizadas por fecha"}
                  {index === 3 && "Describa los hallazgos técnicos encontrados"}
                  {index === 4 && "Suba fotografías del proceso"}
                  {index === 5 && "Agregue recomendaciones y próximos pasos"}
                  {index === 6 && "Verifique la información antes de generar el informe"}
                </p>
              </div>
              
              {renderFormStep()}
              
              {isSubmitting && (
                <div className="mt-4 mb-4">
                  <p className="text-sm text-gray-500 mb-2">Enviando datos... {uploadProgress}%</p>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                {index > 0 ? (
                  <Button 
                    variant="outline" 
                    onClick={handlePrev}
                    disabled={isSubmitting}
                  >
                    Anterior
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reiniciar formulario
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
                  <div className="flex gap-2 ml-auto">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (reportLinks.link_informe) {
                          window.open(reportLinks.link_informe, '_blank');
                        } else {
                          toast({
                            title: "Informe no disponible",
                            description: "Primero debe generar el informe",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={!reportLinks.link_informe || isSubmitting}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Informe
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Generar Informe"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ReportForm;
