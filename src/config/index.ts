export const appConfig = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  defaultLanguage: 'pt-BR',
  defaultTheme: 'light',
  appName: 'Mentei!',
  version: '1.0.0'
};

export const getApiUrl = () => appConfig.apiUrl; 