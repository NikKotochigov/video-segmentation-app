import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { VideoSegmentationPage } from './pages/video-segmentation/video-segmentation.page'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VideoSegmentationPage />
    </ThemeProvider>
  )
}

export default App
