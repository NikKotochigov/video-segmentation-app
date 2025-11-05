import React, { PropsWithChildren } from 'react';
import { Container } from '@mui/material';

interface IAppContainerProps extends PropsWithChildren {
  maxWidth?: number | string;
  paperProps?: object;
}

export const AppContainer: React.FC<IAppContainerProps> = ({ children }) => (
  <Container
    maxWidth={false}
    sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {children}
  </Container>
);
