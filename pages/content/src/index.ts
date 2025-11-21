// Content script that runs on all web pages

interface ThemeState {
  theme: 'light' | 'dark';
  enabled: boolean;
}

class ThemeSwitcher {
  private state: ThemeState = {
    theme: 'light',
    enabled: true,
  };
  private styleElement: HTMLStyleElement | null = null;
  private storageKey: string;

  constructor() {
    this.storageKey = `theme_${window.location.hostname}`;
    this.init();
  }

  private async init() {
    const result = await chrome.storage.local.get(this.storageKey);
    if (result[this.storageKey]) {
      this.state = result[this.storageKey];
    }

    if (this.state.enabled) {
      this.applyTheme(this.state.theme);
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true;
    });
  }

  private handleMessage(message: any, sendResponse: (response: any) => void) {
    switch (message.type) {
      case 'GET_THEME':
        sendResponse(this.state);
        break;

      case 'TOGGLE_THEME':
        this.state.theme = message.theme;
        this.applyTheme(this.state.theme);
        this.saveState();
        sendResponse(this.state);
        break;

      case 'TOGGLE_ENABLED':
        this.state.enabled = message.enabled;
        if (this.state.enabled) {
          this.applyTheme(this.state.theme);
        } else {
          this.removeTheme();
        }
        this.saveState();
        sendResponse(this.state);
        break;
    }
  }

  private applyTheme(theme: 'light' | 'dark') {
    this.removeTheme();

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'theme-switcher-styles';

    const styles = theme === 'dark' ? this.getDarkThemeStyles() : this.getLightThemeStyles();
    this.styleElement.textContent = styles;

    document.documentElement.appendChild(this.styleElement);
    document.documentElement.setAttribute('data-theme-switcher', theme);
  }

  private removeTheme() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    document.documentElement.removeAttribute('data-theme-switcher');
  }

  private getDarkThemeStyles(): string {
    return `
      /* Dark Theme Styles */
      html[data-theme-switcher="dark"] {
        filter: invert(1) hue-rotate(180deg);
      }

      html[data-theme-switcher="dark"] img,
      html[data-theme-switcher="dark"] video,
      html[data-theme-switcher="dark"] iframe,
      html[data-theme-switcher="dark"] [style*="background-image"] {
        filter: invert(1) hue-rotate(180deg);
      }

      /* Improve readability */
      html[data-theme-switcher="dark"] * {
        background-color: inherit;
        border-color: inherit;
      }
    `;
  }

  private getLightThemeStyles(): string {
    return `
      /* Light Theme Styles - Reset to default */
      html[data-theme-switcher="light"] {
        filter: none;
      }
    `;
  }

  private async saveState() {
    await chrome.storage.local.set({ [this.storageKey]: this.state });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ThemeSwitcher());
} else {
  new ThemeSwitcher();
}
