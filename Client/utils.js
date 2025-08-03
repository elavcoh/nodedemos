// Utility functions for the Pokémon application

// Common audio functions
const AudioUtils = {
  playBattleSound: () => {
    const sound = new Audio('/sounds/battle sound.mp3');
    sound.volume = 0.3;
    return sound.play().catch(e => console.log('Battle sound play failed:', e));
  },
  
  playVictorySound: () => {
    const sound = new Audio('/sounds/sound.wav');
    return sound.play().catch(e => console.log('Victory sound play failed:', e));
  },
  
  stopSound: (sound) => {
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
};

// Common UI functions
const UIUtils = {
  showLoading: (element) => {
    if (element) element.style.display = 'flex';
  },
  
  hideLoading: (element) => {
    if (element) element.style.display = 'none';
  },
  
  clearElement: (element) => {
    if (element) element.innerHTML = '';
  },
  
  toggleElement: (element, show) => {
    if (element) element.style.display = show ? 'block' : 'none';
  }
};

// Common API functions
const APIUtils = {
  handleResponse: async (response) => {
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'API request failed');
    }
    return response.json();
  },
  
  makeRequest: async (url, options = {}) => {
    const defaultOptions = {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }
    };
    const response = await fetch(url, { ...defaultOptions, ...options });
    return APIUtils.handleResponse(response);
  }
};

// Export for use in other files
window.AudioUtils = AudioUtils;
window.UIUtils = UIUtils;
window.APIUtils = APIUtils; 