
interface ReportPreviewProps {
  data: any;
  reportLinks: {
    link_informe?: string;
    link_pdf?: string;
  };
}

const ReportPreview = ({ data, reportLinks }: ReportPreviewProps) => {
  const fotosAntes = data.fotosMeta.filter((f: any) => f.etiqueta === "antes");
  const fotosDurante = data.fotosMeta.filter((f: any) => f.etiqueta === "durante");
  const fotosDespues = data.fotosMeta.filter((f: any) => f.etiqueta === "despues");

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Vista Previa del Informe</h3>

      {/* Links section */}
      {(reportLinks.link_informe || reportLinks.link_pdf) && (
        <div className="p-4 bg-green-50 rounded-md border border-green-200 mb-6">
          <h4 className="text-lg font-semibold text-green-800 mb-2">¡Informe Generado!</h4>
          <div className="space-y-2">
            {reportLinks.link_informe && (
              <div>
                <a 
                  href={reportLinks.link_informe} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Ver informe en Google Docs
                </a>
              </div>
            )}
            
            {reportLinks.link_pdf && (
              <div>
                <a 
                  href={reportLinks.link_pdf} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Descargar informe en PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview content */}
      <div className="border border-gray-200 rounded-md p-4">
        <div className="space-y-6">
          <section>
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-3">Información del Proyecto</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cliente:</p>
                <p>{data.cliente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha:</p>
                <p>{data.fecha}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Proyecto:</p>
                <p>{data.proyecto}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Responsable:</p>
                <p>{data.responsable}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Referencia Equipo:</p>
                <p>{data.referencia_equipo}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-3">Datos Técnicos del Equipo</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Marca:</p>
                <p>{data.marca}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Modelo:</p>
                <p>{data.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Número de Serie:</p>
                <p>{data.serie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dimensiones:</p>
                <p>{data.dimensiones}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Torque:</p>
                <p>{data.torque}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aceite:</p>
                <p>{data.aceite}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Velocidad:</p>
                <p>{data.velocidad}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-3">Resumen Ejecutivo</h4>
            <p className="whitespace-pre-line">{data.resumen}</p>
          </section>

          <section>
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-3">Actividades Realizadas</h4>
            {data.actividades.map((act: any, idx: number) => (
              <div key={idx} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                <p className="font-semibold text-sm">{act.fecha}</p>
                <p className="whitespace-pre-line">{act.descripcion}</p>
              </div>
            ))}
          </section>

          <section>
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-3">Hallazgos Técnicos</h4>
            <p className="whitespace-pre-line">{data.hallazgos}</p>
          </section>

          <section>
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-3">Recomendaciones</h4>
            <p className="whitespace-pre-line">{data.recomendaciones}</p>
          </section>

          <section>
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-3">Fotografías</h4>
            
            {fotosAntes.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-700 mb-2">Antes</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotosAntes.map((foto: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-2">
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                        <img 
                          src={URL.createObjectURL(foto.file)} 
                          alt={`Foto ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{foto.comentario}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {fotosDurante.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-700 mb-2">Durante</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotosDurante.map((foto: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-2">
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                        <img 
                          src={URL.createObjectURL(foto.file)} 
                          alt={`Foto ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{foto.comentario}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {fotosDespues.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-700 mb-2">Después</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotosDespues.map((foto: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-2">
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                        <img 
                          src={URL.createObjectURL(foto.file)} 
                          alt={`Foto ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{foto.comentario}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
