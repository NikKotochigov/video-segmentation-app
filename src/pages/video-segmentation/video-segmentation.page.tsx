import { AppBar, Toolbar, Typography, Grid, Container, Paper } from '@mui/material'
import { VideoInput } from '../../widgets/video-input/video-input'
import { VideoOutput } from '../../widgets/video-output/video-output'

export const VideoSegmentationPage = () => {
  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Приложение для сегментации видео
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ height: { xs: 360, md: 'calc(100vh - 120px)' }, p: 0 }}>
              <VideoInput />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ height: { xs: 360, md: 'calc(100vh - 120px)' }, p: 0 }}>
              <VideoOutput />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
