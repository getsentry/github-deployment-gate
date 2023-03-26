import { SENTRY_INSTALLATION_ID } from '../constants/BrowserStorage';

export function saveSentryInstallationId(id: string) {
  window.localStorage.setItem(SENTRY_INSTALLATION_ID, id);
}

export function loadSentryInstallationId(): string | null {
  return window.localStorage.getItem(SENTRY_INSTALLATION_ID);
}

export function clearSentryInstallationId() {
  window.localStorage.removeItem(SENTRY_INSTALLATION_ID);
}
