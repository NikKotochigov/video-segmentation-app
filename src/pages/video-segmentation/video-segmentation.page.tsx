import { AppBar, Toolbar, Typography, Grid, Container, Paper } from '@mui/material'
import { VideoInput } from '../../widgets/video-input/video-input'
import { VideoOutput } from '../../widgets/video-output/video-output'
import { RvmInitializer } from '../../features/rvm-init/rvm-initializer'

const RVM_MODEL_URL = '/models/rvm_mobilenetv3_tfjs_int8/model.json' // разместите файлы модели здесь

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

      <RvmInitializer modelUrl={RVM_MODEL_URL} />

      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ height: { xs: 360, md: 'calc(100vh - 160px)' }, p: 0 }}>
              <VideoInput />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ height: { xs: 360, md: 'calc(100vh - 160px)' }, p: 0 }}>
              <VideoOutput />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
