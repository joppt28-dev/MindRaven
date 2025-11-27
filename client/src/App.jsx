import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import { AuthPage } from './pages/AuthPages';
import OnboardingPage from './pages/OnboardingPage';
import ProjectSelectorPage from './pages/ProjectSelectorPage';
import ProjectFlowPage from './pages/ProjectFlowPage';
import IdeaGeneratorPage from './pages/IdeaGeneratorPage';
import ProjectsListPage from './pages/ProjectsListPage'; // <--- IMPORTANTE: Importamos la lista
import ProtectedRoute from './pages/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <div className="relative z-10">
        <BrowserRouter>
          {/* Capa de ruido de fondo */}
          <div className="noise-overlay" aria-hidden="true" />
          
          <Routes>
            {/* Layout Principal (Sidebar + Contenido) */}
            <Route element={<DashboardLayout />}>
              
              {/* Rutas Públicas */}
              <Route index element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              
              {/* --- RUTAS PROTEGIDAS --- */}
              
              {/* 1. Generador de Ideas */}
              <Route path="/ideas" element={
                <ProtectedRoute>
                  <IdeaGeneratorPage />
                </ProtectedRoute>
              } />

              {/* 2. Lista de Proyectos (Historial) */}
              <Route path="/projects" element={
                <ProtectedRoute>
                  <ProjectsListPage />
                </ProtectedRoute>
              } />

              {/* 3. Detalle del Proyecto (Flujo) */}
              {/* A esta ruta es donde navega el botón "Profundizar" */}
              <Route path="/projects/flow" element={
                <ProtectedRoute>
                  <ProjectFlowPage />
                </ProtectedRoute>
              } />

              {/* 4. Selector de Proyectos (Opcional) */}
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
            
            {/* Ruta por defecto (Redirige al inicio si no encuentra nada) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;