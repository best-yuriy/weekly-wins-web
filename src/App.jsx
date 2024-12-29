import { useState } from 'react'
import { 
  ThemeProvider, 
  createTheme, 
  Button, 
  Typography, 
  Container, 
  Box 
} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Vite + React + MUI
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </Button>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Edit <code>src/App.jsx</code> and save to test HMR
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
