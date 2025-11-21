import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { InputForm } from './components/InputForm';
import { ExtractionResult } from './components/ExtractionResult';
import { AdminPanel } from './components/AdminPanel';
import { extractShipmentData } from './services/geminiService';
import { generateAndDownloadWord } from './services/wordService';
import { generateAndDownloadExcel } from './services/excelService';
import { generateAndDownloadPDF } from './services/pdfService';
import { authAPI, submissionAPI, emailAPI } from './services/apiService';
import { AppStatus, ShipmentData } from './types';
import { Container, LogOut, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [data, setData] = useState<ShipmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sendToPricingMode, setSendToPricingMode] = useState(false);
  const [pricingEmail, setPricingEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const user = await authAPI.getCurrentUser();
          setCurrentUser(user.username);
          setUserRole(user.role);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, remove it
          authAPI.logout();
          setIsAuthenticated(false);
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const response = await authAPI.login({ username, password });
      setCurrentUser(response.username);
      setUserRole(response.role);
      setIsAuthenticated(true);
      setLoginError(null);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials');
      setIsAuthenticated(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole('user');
    setShowAdminPanel(false);
    setStatus(AppStatus.IDLE);
    setData(null);
    setError(null);
  };

  const handleProcess = async (text: string) => {
    setStatus(AppStatus.PROCESSING);
    setError(null);
    try {
      const extractedData = await extractShipmentData(text);
      setData(extractedData);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setData(null);
    setError(null);
  };

  const handleUpdateData = (newData: ShipmentData) => {
    setData(newData);
  };

  const saveSubmission = async (fileType: 'word' | 'excel' | 'pdf') => {
    if (!data) return;
    
    try {
      await submissionAPI.saveSubmission({
        ...data,
        fileType,
      });
    } catch (error) {
      console.error('Failed to save submission:', error);
      // Don't show error to user, just log it
    }
  };

  const handleDownloadWord = async () => {
    if (!data) return;
    await generateAndDownloadWord(data);
    await saveSubmission('word');
  };

  const handleDownloadExcel = async () => {
    if (!data) return;
    await generateAndDownloadExcel(data);
    await saveSubmission('excel');
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    await generateAndDownloadPDF(data);
    await saveSubmission('pdf');
  };

  const handleSendToPricingClick = () => {
    const newMode = !sendToPricingMode;
    setSendToPricingMode(newMode);
    if (!newMode) {
      // Exiting send to pricing mode - clear email
      setPricingEmail('');
      setError(null);
    } else {
      // Entering send to pricing mode - clear any errors
      setError(null);
    }
  };

  const handleSendToPricing = async () => {
    if (!data || !pricingEmail.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    setError(null);

    try {
      await emailAPI.sendToPricing(pricingEmail.trim(), data);
      // Save submission
      await saveSubmission('pdf');
      // Show success message
      alert('Email sent successfully to pricing team!');
      setSendToPricingMode(false);
      setPricingEmail('');
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} isLoggingIn={isLoggingIn} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <Container className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Logistics Email-to-File</h1>
              <span className="text-xs text-slate-500 font-medium">Automated Documentation Tool</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="text-sm text-slate-600 font-medium">Welcome, {currentUser}</span>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  showAdminPanel
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                {showAdminPanel ? 'Hide Admin' : 'Admin Panel'}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        
        {showAdminPanel ? (
          <AdminPanel onBack={() => setShowAdminPanel(false)} />
        ) : (
          <>
            {status === AppStatus.IDLE && (
          <div className="text-center mb-10 max-w-2xl animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Streamline your shipment paperwork.
            </h2>
            <p className="text-lg text-slate-500 font-light">
              Paste your logistics email below. We'll format it into a professional file instantly.
            </p>
          </div>
        )}

        {error && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
             <div className="text-red-500 mt-0.5">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
             </div>
             <div>
                <p className="text-sm font-medium text-red-800">Extraction Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button onClick={handleReset} className="text-sm font-semibold text-red-700 hover:text-red-800 mt-2">Try Again</button>
             </div>
          </div>
        )}

        {status === AppStatus.IDLE || status === AppStatus.PROCESSING || status === AppStatus.ERROR ? (
          <InputForm onProcess={handleProcess} isProcessing={status === AppStatus.PROCESSING} />
        ) : (
          data && (
            <ExtractionResult 
              data={data} 
              onDownloadWord={handleDownloadWord}
              onDownloadExcel={handleDownloadExcel}
              onDownloadPDF={handleDownloadPDF}
              onReset={handleReset}
              onUpdate={handleUpdateData}
            />
          )
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
          <p className="text-sm text-slate-400">
            Logistics Email-to-File Tool &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;