export const storage = {
  setUserSettings(settings: { currency: string; language: string }) {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  },

  getUserSettings() {
    const data = localStorage.getItem('userSettings');
    return data ? JSON.parse(data) : { currency: '₴', language: 'uk' };
  },

  setLastSync(timestamp: string) {
    localStorage.setItem('lastSync', timestamp);
  },

  getLastSync(): string | null {
    return localStorage.getItem('lastSync');
  }
}; 