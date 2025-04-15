
import { CheckIcon } from "lucide-react";

interface FormProgressProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const FormProgress = ({ steps, currentStep, onStepClick }: FormProgressProps) => {
  const handleStepClick = (index: number) => {
    if (onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className="hidden sm:flex w-full justify-between relative mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div 
            key={index} 
            className="flex flex-col items-center relative"
            style={{ width: `${100 / steps.length}%` }}
          >
            <button
              type="button"
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                isCompleted
                  ? "bg-blue-600 text-white"
                  : isCurrent
                  ? "border-2 border-blue-600 text-blue-600"
                  : "border-2 border-gray-300 text-gray-300"
              }`}
              onClick={() => handleStepClick(index)}
              aria-label={`Ir al paso ${index + 1}: ${step}`}
            >
              {isCompleted ? <CheckIcon className="h-5 w-5" /> : index + 1}
            </button>
            
            <span className="text-xs mt-2 text-center text-gray-600 max-w-[90%] truncate">
              {step}
            </span>
            
            {index < steps.length - 1 && (
              <div
                className={`absolute h-0.5 top-5 -z-10 ${
                  index < currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
                style={{
                  left: `calc(50% + 5px)`,
                  width: `calc(100% - 10px)`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormProgress;
