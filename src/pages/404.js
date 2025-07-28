import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Custom404() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    if (router.isReady) {
      setCurrentPath(router.asPath);
    }
  }, [router.isReady, router.asPath]);

  return (
    <>
      <Head>
        <title>404 - Seite nicht gefunden | EduPe</title>
        <meta name="description" content="Die angeforderte Seite wurde nicht gefunden." />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-gray-300 select-none">404</div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Oops! Seite nicht gefunden
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Die Seite, die Sie suchen, existiert nicht oder wurde verschoben. 
            Überprüfen Sie die URL oder navigieren Sie zurück zur Startseite.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoHome}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Zur Startseite
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Zurück
            </button>
          </div>



          {/* Error Code Display */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              Fehlercode: 404 {currentPath && `| URL: ${currentPath}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 