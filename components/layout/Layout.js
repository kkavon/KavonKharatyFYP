import Header from './Header';
import themes from './themes';
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import NoSsr from '@mui/material/NoSsr';

const Layout = ({children}) => {
  const [theme] = useState('light');

  return ( 
    <NoSsr>
    <ThemeProvider theme={themes[theme]}>
      <LayoutWrapper>
        <GlobalStyle />
        <Header />
        {children}
      </LayoutWrapper>
    </ThemeProvider>
    </NoSsr>
  );
}

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }
`;

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background-color: ${(props) => props.theme.bgColor};
  background-image: ${(props) => props.theme.bgImage};
  color: ${(props) => props.theme.color};
`;

export default Layout;
