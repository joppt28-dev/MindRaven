// Hook para rastrear eventos en Google Analytics
export const useGoogleAnalytics = () => {
  const trackEvent = (eventName, eventData = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventData);
    }
  };

  const trackPageView = (pageTitle, pagePath) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        'page_title': pageTitle,
        'page_path': pagePath,
      });
    }
  };

  // Rastrear login de usuario
  const trackUserLogin = (userId, userEmail) => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Configurar user_id para vincular sesiones del mismo usuario
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        'user_id': userId,
        'user_email': userEmail,
      });

      // Rastrear evento de login
      window.gtag('event', 'login', {
        method: 'email',
        user_id: userId,
      });
    }
  };

  // Rastrear logout
  const trackUserLogout = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'logout');
    }
  };

  return { trackEvent, trackPageView, trackUserLogin, trackUserLogout };
};
