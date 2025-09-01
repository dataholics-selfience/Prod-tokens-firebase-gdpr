export const API_CONFIG = {
  webhook: {
    url: 'https://primary-production-2e3b.up.railway.app/webhook/production',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  adminWebhooks: {
    test: {
      list: '/admin-api/webhook-test/capta-startups',
      delete: '/admin-api/webhook-test/capta-startups',
      search: '/admin-api/webhook-test/capta-startups'
    },
    production: {
      list: '/admin-api/webhook/capta-startups',
      delete: '/admin-api/webhook/capta-startups',
      search: '/admin-api/webhook/capta-startups'
    }
  }
};

export const PLAN_URLS = {
  jedi: import.meta.env.VITE_PLAN_JEDI_URL,
  mestreJedi: import.meta.env.VITE_PLAN_MESTRE_JEDI_URL,
  mestreYoda: import.meta.env.VITE_PLAN_MESTRE_YODA_URL
};