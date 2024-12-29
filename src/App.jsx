import { 
  ThemeProvider, 
  createTheme, 
  Container, 
} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import MainPage from './pages/MainPage'
const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <MainPage />
      </Container>
    </ThemeProvider>
  )
}

export default App
