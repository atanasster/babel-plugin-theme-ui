/** @jsxRuntime classic */
/** @jsx jsx */
import { FC } from 'react';
import { jsx, Box, Container, Button, useColorMode } from 'theme-ui';


export const Layout: FC = props => {
  const [mode, setMode] = useColorMode()
  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }
  return (
    <Box sx={{ py: 2, px: 4 }}>
      <Box as="header">
        
        <Button title="Toggle Dark Mode" onClick={toggleMode}>
          {mode}
        </Button>
      </Box>
      <Box as="main">
        <Container>{props.children}</Container>
      </Box>
    </Box>
  );
}  
