/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Box, ThemeProvider, Heading, Link } from 'theme-ui'
import { Layout } from './layout';
import { theme } from './theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          fontFamily: 'body',
          color: 'text',
          bg: 'background',
        }}
      >
        <Layout>
          <Heading as="h1">Hello</Heading>
          <p>
            This is an example of adding a dark mode with <Link>Theme UI</Link>.
            Click the button in the header to toggle dark or light mode.
            The color mode should persist after reloading the page and across different pages in the site.
          </p>  

          <Link href="https://theme-ui.now.sh">theme ui: https://theme-ui.now.sh</Link>

        </Layout>
      </Box>
    </ThemeProvider>
  )
}

export default App;
