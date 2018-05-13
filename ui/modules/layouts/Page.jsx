import React from 'react';

export const Header = ({ children }) => (
  <header className="ms-fontColor-themeDarkAlt ms-bgColor-neutralQuaternary">
    {children}
  </header>
);

export const Title = ({ children }) => (
  <div className="ms-fontSize-xxl">{children}</div>
);

export const TitleBar = ({ children }) => (
  <div className="ms-fontSize-xxl ms-bgColor-neutralPrimaryAlt ms-fontColor-white" style={{ margin: '0 -20px 20px', padding: '10px 20px' }}>
    <Title>
      {children}
    </Title>
  </div>
);

export const PreTitle = ({ children }) => (
  <div className="ms-fontSize-mPlus ms-fontWeight-semibold">{children}</div>
);

export const Main = ({ children }) => (
  <main style={{ display: 'flex', flex: '1 auto', flexDirection: 'column', overflow: 'auto' }}>
    {children}
  </main>
);

export const Footer = ({ children }) => (
  <footer style={{ padding: '12px 0' }}>
    {children}
  </footer>
);

export const Page = ({ children }) => (
  <article style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    {children}
  </article>
);
