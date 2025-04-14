
import Header from "@/components/Header";
import ReportForm from "@/components/ReportForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Generador de Informes Técnicos</h1>
            <p className="text-gray-600">
              Complete el formulario para generar un informe técnico profesional y estructurado.
            </p>
          </div>
          
          <ReportForm />
        </div>
      </main>
      
      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} TecniReport - Generador de Informes Técnicos
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
