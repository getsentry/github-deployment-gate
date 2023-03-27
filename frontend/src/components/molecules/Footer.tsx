import styled from '@emotion/styled';
import React from 'react';

import SentryLogo from '../atoms/SentryLogo';

const Footer = () => (
  <StyledFooter>
    <a href="https://github.com/getsentry/github-deployment-gate" className="right">
      Docs
    </a>
    <SentryLogo />
    <a href="https://github.com/getsentry/github-deployment-gate">Source Code</a>
  </StyledFooter>
);

const StyledFooter = styled.div`
  background: ${(p) => p.theme.gray100};
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(p) => p.theme.gray300};
  svg {
    margin: 0 3rem;
  }
  a {
    flex: 1;
    color: ${(p) => p.theme.gray300};
    text-decoration: none;
    &.right {
      text-align: right;
    }
  }
`;

export default Footer;
