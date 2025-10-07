import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider } from './components/ui/provider.tsx'
import { ChakraProvider, createSystem, defineConfig } from '@chakra-ui/react';
import { defaultConfig } from '@chakra-ui/react/preset';


const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: '#f5e6c8' },
        secondary: { value: '#a8b5a2' },
      },
    },
    semanticTokens: {
      colors: {
        myColor: {
          value: { base: '{colors.primary}', _dark: '{colors.secondary}' },
        },
      },
    },
  },
});
const system = createSystem(defaultConfig, config);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </Provider>
    
  </StrictMode>,
)
