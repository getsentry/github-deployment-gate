import {ThemeProvider} from '@emotion/react';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import SetupPage from './pages/SetupPage';
import GlobalStyles from './styles/GlobalStyles';
import {darkTheme, lightTheme} from './styles/theme';

function App() {
  const lightThemeMediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  return (
    <ThemeProvider theme={lightThemeMediaQuery?.matches ? lightTheme : darkTheme}>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/sentry/setup" element={<SetupPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
