
import { Wrench } from "lucide-react";

interface HeaderProps {
  logo?: string;
  companyName?: string;
}

const Header = ({ logo, companyName = "TecniReport" }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt={companyName} className="h-10" />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <Wrench size={24} />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800">{companyName}</h1>
        </div>
        <div className="text-sm text-gray-500">
          Generador de Informes Técnicos
        </div>
      </div>
    </header>
  );
};

export default Header;
