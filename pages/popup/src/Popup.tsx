import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Popup() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_THEME' }, response => {
          if (response) {
            setCurrentTheme(response.theme);
            setIsEnabled(response.enabled);
          }
        });
      }
    });
  }, []);

  const toggleTheme = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_THEME', theme: newTheme }, response => {
          if (response) {
            setCurrentTheme(response.theme);
          }
        });
      }
    });
  };

  const toggleEnabled = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        const newEnabled = !isEnabled;
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_ENABLED', enabled: newEnabled }, response => {
          if (response) {
            setIsEnabled(response.enabled);
          }
        });
      }
    });
  };

  return (
    <div className="w-80 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Theme Switcher</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{isEnabled ? 'On' : 'Off'}</span>
          <button
            onClick={toggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Make any website easier to read by switching between light and dark themes.
      </p>

      {isEnabled && (
        <div className="space-y-3">
          <button
            onClick={toggleTheme}
            className={`flex w-full items-center justify-between rounded-lg border-2 p-4 transition-all ${
              currentTheme === 'light'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}>
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-gray-800">Light Theme</span>
            </div>
            {currentTheme === 'light' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
          </button>

          <button
            onClick={toggleTheme}
            className={`flex w-full items-center justify-between rounded-lg border-2 p-4 transition-all ${
              currentTheme === 'dark'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}>
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-indigo-600" />
              <span className="font-medium text-gray-800">Dark Theme</span>
            </div>
            {currentTheme === 'dark' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-center text-xs text-gray-500">Works on all websites • Toggle anytime</p>
      </div>
    </div>
  );
}
