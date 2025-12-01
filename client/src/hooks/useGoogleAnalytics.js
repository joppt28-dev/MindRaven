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

  return { trackEvent, trackPageView };
};
