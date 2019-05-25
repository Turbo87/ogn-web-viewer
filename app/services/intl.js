import * as Sentry from '@sentry/browser';
import IntlService from 'ember-intl/services/intl';
import fetch from 'fetch';
import { negotiateLanguages } from 'fluent-langneg';

import config from 'ogn-web-viewer/config/environment';

export default class extends IntlService {
  negotiateLocale() {
    let requestedLocales = navigator.languages || [navigator.language || navigator.userLanguage].filter(Boolean);

    return negotiateLanguages(requestedLocales, config.intl.locales, {
      strategy: 'lookup',
      defaultLocale: 'en-US',
    })[0];
  }

  async loadTranslations(locale) {
    let response = await fetch(`/translations/${locale.toLowerCase()}.json`);
    let translations = await response.json();
    this.addTranslations(locale, translations);
  }

  setLocale(locale) {
    super.setLocale(...arguments);
    Sentry.configureScope(scope => scope.setTag('locale', locale));
  }
}
