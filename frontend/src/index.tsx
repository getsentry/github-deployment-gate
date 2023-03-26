import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { SENTRY_DSN } from './constants/EnvVars';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
