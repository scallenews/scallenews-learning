import { useState, useEffect } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // Garante que o código só rode após carregar completamente no navegador
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Evita o erro de Hydration travando a tela inicial
  }

  return (
    <div className="bg-container">
      {/* Estilos em formato seguro para Next.js */}
      <style>{`
        .bg-container {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: #ffffff;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          box-sizing: border-box;
        }
        .card {
          max-width: 600px;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px 30px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .titulo {
          font-size: 2.8rem;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }
        .subtitulo {
          font-size: 1.5rem;
          color: #f0a500;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .texto {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 30px;
          color: #e0e0e0;
        }
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.1);
          width: 50px;
          height: 50px;
          border-left: 4px solid #f0a500;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Estrutura visual */}
      <div className="card">
        <h1 className="titulo">SCALLE</h1>
        <h2 className="subtitulo">Página em Construção</h2>
        <p className="texto">
          Uma nova experiência está chegando. Estamos finalizando nossa
          plataforma para oferecer acesso completo aos nossos produtos, com mais
          inovação, praticidade e excelência.
        </p>
        <div className="loader"></div>
      </div>
    </div>
  );
}
