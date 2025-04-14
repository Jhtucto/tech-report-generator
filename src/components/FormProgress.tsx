
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
    <div className="hidden sm:flex w-full justify-between relative">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div 
            key={index} 
            className="flex flex-col items-center"
            onClick={() => handleStepClick(index)}
          >
            <button
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                isCompleted
                  ? "bg-blue-600 text-white"
                  : isCurrent
                  ? "border-2 border-blue-600 text-blue-600"
                  : "border-2 border-gray-300 text-gray-300"
              }`}
              aria-label={`Ir al paso ${index + 1}: ${step}`}
            >
              {isCompleted ? <CheckIcon className="h-4 w-4" /> : index + 1}
            </button>
            <div
              className={`text-xs mt-1 text-center ${
                isCompleted || isCurrent ? "text-blue-600 font-medium" : "text-gray-400"
              }`}
            >
              {step}
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`absolute h-0.5 top-4 -z-10 ${
                  index < currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
                style={{
                  left: `calc(${(index + 0.5) * (100 / (steps.length - 1))}% - ${
                    100 / (steps.length - 1) / 2
                  }%)`,
                  width: `calc(${100 / (steps.length - 1)}%)`,
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
