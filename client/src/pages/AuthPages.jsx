import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest, API_BASE } from '../utils/apiRequest';

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || 'demo@mindraven.ai';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'MindRaven2025';

export const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const isRegisterRoute = location.pathname === '/register';
  const [isFlipped, setIsFlipped] = useState(isRegisterRoute);

  useEffect(() => {
    setIsFlipped(location.pathname === '/register');
  }, [location.pathname]);

  const toggleFlip = (to) => {
    setIsFlipped(to === 'register');
    setTimeout(() => navigate(to === 'register' ? '/register' : '/login'), 0);
  };

  // --- ESTADOS Y LÓGICA DE LOGIN ---
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      if (!response.ok) throw new Error('Credenciales inválidas');
      const data = await response.json();
      login(data);
      navigate('/', { replace: true });
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // --- ESTADOS Y LÓGICA DE REGISTRO ---
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      await apiRequest('/api/auth/register', null, { method: 'POST', body: JSON.stringify(regForm) });
      alert("Cuenta creada con éxito. Iniciando sesión...");
      toggleFlip('login');
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    // CAMBIO AQUÍ: Fondo negro plano (#0B0F19)
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden px-4 py-10">
      
      {/* (Aquí eliminé los divs de fondo aurora y ruido) */}

      {/* CONTENEDOR 3D */}
      <div className="relative w-full max-w-md h-[600px] perspective-1000">
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

          {/* ================= CARA FRONTAL: LOGIN ================= */}
          <div className="absolute top-0 left-0 w-full h-full backface-hidden">
            <div className="h-full backdrop-blur-2xl bg-[#131620]/90 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col justify-center">
              
              <div className="mb-8 text-center space-y-2">
                <p className="text-xs font-bold tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase">MindRaven AI</p>
                <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
                <p className="text-slate-400 text-sm">Ingresa al nexo de innovación.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1 group">
                  <label className="text-xs font-medium text-slate-300 ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </div>
                    <input className="block w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} disabled={loginLoading} />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label className="text-xs font-medium text-slate-300 ml-1">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <input className="block w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                      type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} disabled={loginLoading} />
                  </div>
                </div>

                {loginError && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg text-center border border-red-500/20">{loginError}</p>}

                <button type="submit" disabled={loginLoading} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] py-3.5 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:bg-right transition-all duration-500 disabled:opacity-50">
                  {loginLoading ? 'Conectando...' : 'Acceder a la Plataforma'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-slate-400 mb-2">¿Aún no tienes cuenta?</p>
                <button onClick={() => toggleFlip('register')} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group">
                  Crea tu cuenta gratis
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* ================= CARA TRASERA: REGISTRO ================= */}
          <div className="absolute top-0 left-0 w-full h-full backface-hidden rotate-y-180">
            <div className="h-full backdrop-blur-2xl bg-[#131620]/90 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col justify-center">
              
              <div className="mb-6 text-center space-y-2">
                <p className="text-xs font-bold tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase">Únete a MindRaven</p>
                <h1 className="text-3xl font-bold text-white">Crear Cuenta</h1>
                <p className="text-slate-400 text-sm">Empieza a materializar tus proyectos.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1 group">
                  <label className="text-xs font-medium text-slate-300 ml-1">Nombre Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input className="block w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      type="text" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} disabled={regLoading} />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label className="text-xs font-medium text-slate-300 ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </div>
                    <input className="block w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} disabled={regLoading} />
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label className="text-xs font-medium text-slate-300 ml-1">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <input className="block w-full pl-11 pr-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                      type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} disabled={regLoading} />
                  </div>
                </div>

                {regError && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg text-center border border-red-500/20">{regError}</p>}

                <button type="submit" disabled={regLoading} className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all disabled:opacity-50">
                  {regLoading ? 'Registrando...' : 'Confirmar Registro'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-sm text-slate-400 mb-2">¿Ya eres un explorador?</p>
                <button onClick={() => toggleFlip('login')} className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group">
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  Inicia sesión aquí
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export const LoginPage = () => <AuthPage />;
export const RegisterPage = () => <AuthPage />;