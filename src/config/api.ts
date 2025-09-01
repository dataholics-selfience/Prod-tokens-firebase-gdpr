export const API_CONFIG = {
  webhook: {
    url: 'https://primary-production-2e3b.up.railway.app/webhook/production',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  adminWebhooks: {
    test: {
      list: 'https://primary-production-2e3b.up.railway.app/webhook-test/capta-startups',
      delete: 'https://primary-production-2e3b.up.railway.app/webhook-test/capta-startups',
      search: 'https://primary-production-2e3b.up.railway.app/webhook-test/capta-startups'
    },
    production: {
      list: 'https://primary-production-2e3b.up.railway.app/webhook/capta-startups',
      delete: 'https://primary-production-2e3b.up.railway.app/webhook/capta-startups',
      search: 'https://primary-production-2e3b.up.railway.app/webhook/capta-startups'
    }
  }
};

export const PLAN_URLS = {
  jedi: import.meta.env.VITE_PLAN_JEDI_URL,
  mestreJedi: import.meta.env.VITE_PLAN_MESTRE_JEDI_URL,
  mestreYoda: import.meta.env.VITE_PLAN_MESTRE_YODA_URL
};