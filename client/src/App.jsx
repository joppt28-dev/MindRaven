import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import { AuthPage } from './pages/AuthPages';
import OnboardingPage from './pages/OnboardingPage';
import ProjectSelectorPage from './pages/ProjectSelectorPage';
import ProjectFlowPage from './pages/ProjectFlowPage';
import IdeaGeneratorPage from './pages/IdeaGeneratorPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProtectedRoute from './pages/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <div className="relative z-10">
        <BrowserRouter>
          <div className="noise-overlay" aria-hidden="true" />
          <Routes>
            
            {/* --- ZONA PÚBLICA (SIN SIDEBAR) --- */}
            
            {/* La Landing Page ahora es independiente */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Login y Registro también independientes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />


            {/* --- ZONA PRIVADA (CON SIDEBAR) --- */}
            {/* Solo al entrar aquí aparecerá la barra lateral */}
            <Route element={<DashboardLayout />}>
              
              <Route path="/ideas" element={
                <ProtectedRoute>
                  <IdeaGeneratorPage />
                </ProtectedRoute>
              } />

              <Route path="/projects" element={
                <ProtectedRoute>
                  <ProjectsListPage />
                </ProtectedRoute>
              } />

              <Route path="/projects/flow" element={
                <ProtectedRoute>
                  <ProjectFlowPage />
                </ProtectedRoute>
              } />

              <Route path="/projects/select" element={
                <ProtectedRoute>
                  <ProjectSelectorPage />
                </ProtectedRoute>
              } />
              
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;