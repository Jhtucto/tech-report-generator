
import { Wrench } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  logo?: string;
  companyName?: string;
}

const Header = ({ logo, companyName = "TecniReport" }: HeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 md:py-4 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt={companyName} className="h-8 md:h-10" />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <Wrench size={isMobile ? 18 : 24} />
            </div>
          )}
          <h1 className="text-lg md:text-xl font-bold text-gray-800">{companyName}</h1>
        </div>
        {!isMobile && (
          <div className="text-sm text-gray-500">
            Generador de Informes Técnicos
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
