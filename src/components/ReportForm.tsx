
import { useState, useCallback, useEffect } from "react";
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
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds initial delay
const WEBHOOK_URL = "https://hook.eu1.make.com/abcd1234"; // Placeholder URL - replace with actual URL

const ReportForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reportLinks, setReportLinks] = useState<{ link_informe?: string; link_pdf?: string }>({});
  const [retryCount, setRetryCount] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
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

  // Add a cleanup effect for the fetch request
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

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
    setCurrentStep(stepIndex);
    setActiveTab(stepIndex.toString());
  };

  const validateCurrentStep = () => {
    if (currentStep === FORM_STEPS.length - 1) {
      if (!formData.cliente || !formData.fecha || !formData.proyecto || !formData.responsable) {
        toast({
          title: "Información del proyecto incompleta",
          description: "Por favor complete todos los campos en la sección de información del proyecto.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!formData.marca || !formData.modelo || !formData.serie) {
        toast({
          title: "Datos del equipo incompletos",
          description: "Por favor complete los campos obligatorios en la sección de datos del equipo.",
          variant: "destructive",
        });
        return false;
      }
      
      if (formData.actividades.some(act => !act.fecha || !act.descripcion)) {
        toast({
          title: "Actividades incompletas",
          description: "Por favor complete todas las actividades o elimine las vacías.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!formData.hallazgos) {
        toast({
          title: "Hallazgos requeridos",
          description: "Por favor ingrese los hallazgos técnicos.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const resetForm = () => {
    if (window.confirm("¿Está seguro que desea reiniciar el formulario? Se perderán todos los datos ingresados.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  // Fix: Completely rewrite the submission function with proper cancellation
  const sendFormData = useCallback(async (formDataToSend: FormData) => {
    try {
      // Create a new AbortController for this request
      const controller = new AbortController();
      setAbortController(controller);
      
      // Set a timeout to abort after 45 seconds to prevent infinite waiting
      const timeoutId = setTimeout(() => {
        controller.abort();
        throw new Error("Tiempo de espera agotado");
      }, 45000);
      
      setUploadProgress(10); // Show initial progress
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formDataToSend,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      setUploadProgress(90);
      
      const responseData = await response.json();
      
      if (!responseData.link_informe && !responseData.link_pdf) {
        throw new Error("Respuesta sin enlaces al documento");
      }
      
      setUploadProgress(100);
      setReportLinks(responseData);
      setRetryCount(0);
      
      toast({
        title: "Informe generado con éxito",
        description: "Se han generado los enlaces a su informe",
      });
      
      return true;
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast({
            title: "Tiempo de espera agotado",
            description: "La generación del informe está tomando demasiado tiempo. Por favor intente más tarde.",
            variant: "destructive",
          });
        } else {
          console.error("Error en la generación:", error.message);
          
          // If we haven't exceeded max retries, try again
          if (retryCount < MAX_RETRIES) {
            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);
            
            const delay = RETRY_DELAY * Math.pow(2, newRetryCount - 1);
            
            toast({
              title: "Reintentando envío",
              description: `Intento ${newRetryCount} de ${MAX_RETRIES}. Espere por favor...`,
            });
            
            // Wait and try again
            await new Promise(resolve => setTimeout(resolve, delay));
            return sendFormData(formDataToSend);
          } else {
            toast({
              title: "Error en la generación",
              description: "No se pudo generar el informe después de varios intentos. El servidor podría estar sobrecargado o sin conexión. Por favor intente más tarde.",
              variant: "destructive",
            });
          }
        }
      }
      
      return false;
    } finally {
      setAbortController(null);
      setIsSubmitting(false);
    }
  }, [retryCount]);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    // If already submitting, allow cancellation
    if (isSubmitting && abortController) {
      abortController.abort();
      setIsSubmitting(false);
      setUploadProgress(0);
      toast({
        title: "Envío cancelado",
        description: "La generación del informe ha sido cancelada.",
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    setRetryCount(0);
    
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
      
      toast({
        title: "Preparando documento",
        description: "Espere mientras preparamos su informe...",
      });
      
      // Small delay to ensure UI is updated before starting the network request
      setTimeout(async () => {
        const success = await sendFormData(formDataToSend);
        
        if (!success) {
          setIsSubmitting(false);
          setUploadProgress(0);
        }
      }, 500);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error de preparación",
        description: "Hubo un problema al preparar los datos del informe. Por favor intente nuevamente.",
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
                  <p className="text-sm text-gray-500 mb-2">
                    {retryCount > 0 
                      ? `Reintentando (${retryCount}/${MAX_RETRIES})... ${uploadProgress}%` 
                      : `Enviando datos... ${uploadProgress}%`}
                  </p>
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
                      className={isSubmitting ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} 
                      onClick={handleSubmit}
                      disabled={false}
                    >
                      {isSubmitting ? "Cancelar envío" : "Generar Informe"}
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
