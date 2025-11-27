import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sampleAreas = [
  'Emprendimiento social en Latinoamérica',
  'Innovación en IA aplicada a fintech',
  'Startups de tecnología climática para agro',
  'Tendencias GovTech y participación ciudadana',
];

const userTypes = [
  { value: 'student', label: 'Estudiante' },
  { value: 'researcher', label: 'Investigador' },
  { value: 'entrepreneur', label: 'Emprendedor / Startup' },
];

const goals = [
  { value: 'find-idea', label: 'Encontrar una idea' },
  { value: 'validate', label: 'Validar una idea' },
  { value: 'structure', label: 'Estructurar un proyecto' },
  { value: 'proposal', label: 'Crear una propuesta lista para entregar' },
];

const projectTypes = [
  { value: 'research', label: 'Proyecto de investigación académica' },
  { value: 'innovation', label: 'Proyecto de innovación / Startup' },
];

const OnboardingPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userType: user?.role || 'entrepreneur',
    goal: 'find-idea',
    projectType: 'innovation',
    topic: '',
    interests: [],
  });
  const [interestInput, setInterestInput] = useState('');
  const [error, setError] = useState('');

  const addInterest = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      interests: Array.from(new Set([...prev.interests, trimmed])).slice(0, 6),
    }));
    setInterestInput('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (form.interests.length < 3) {
      setError('Agrega al menos 3 áreas de interés.');
      return;
    }
    setError('');
    navigate('/projects', { state: form });
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-10 md:px-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-ink-subtle)]">Onboarding inteligente</p>
          <h1 className="text-3xl font-bold text-[var(--color-ink-strong)]">Personaliza tu flujo</h1>
          <p className="text-sm text-[var(--color-ink-label)]">
            Define tu perfil, objetivo y tipo de proyecto. Luego continuaremos con la idea, evidencia y validación.
          </p>
        </header>
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <label className="text-sm font-semibold text-[var(--color-ink-muted)]">
              Tipo de usuario
              <select
                className="mt-1 w-full rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={form.userType}
                onChange={(e) => setForm({ ...form, userType: e.target.value })}
              >
                {userTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[var(--color-ink-muted)]">
              Objetivo de hoy
              <select
                className="mt-1 w-full rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              >
                {goals.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[var(--color-ink-muted)]">
              Tipo de proyecto
              <select
                className="mt-1 w-full rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                value={form.projectType}
                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
              >
                {projectTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[var(--color-ink-muted)]">
              Tema central / reto
              <input
                className="mt-1 w-full rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Ej. IA para salud preventiva"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </label>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--color-ink-muted)]">Áreas de interés (min. 3)</p>
            <div className="flex flex-wrap gap-2">
              {form.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-slate-800/40 text-[var(--color-ink-strong)] px-3 py-1 text-xs"
                >
                  {interest}
                  <button
                    type="button"
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink-strong)]"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== interest) }))
                    }
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleAreas.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="rounded-full border border-[var(--color-border)] bg-slate-800/40 px-3 py-1 text-xs text-[var(--color-ink-soft)] hover:bg-slate-800/50 transition"
                  onClick={() => addInterest(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Agregar interés"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
              />
              <button
                type="button"
                className="rounded-2xl btn-primary px-4 py-2 text-[var(--color-ink-strong)] text-sm font-semibold hover:opacity-90"
                onClick={() => addInterest(interestInput)}
              >
                Agregar
              </button>
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-[var(--color-ink-label)]">El siguiente paso armará tu flujo completo con IA.</p>
            <button type="submit" className="rounded-2xl btn-primary text-[var(--color-ink-strong)] px-6 py-3 text-sm font-semibold hover:opacity-90">
              Continuar al flujo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
