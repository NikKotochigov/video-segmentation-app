import { Alert, LinearProgress, Stack, Typography } from '@mui/material'
import { useRvmStore } from '../../stores/rvm/rvm.store'
import { useRvmInit } from './use-rvm-init'

interface Props {
  modelUrl: string
  autoInit?: boolean
}

export const RvmInitializer = ({ modelUrl, autoInit = true }: Props) => {
  // Корректный вызов хука на верхнем уровне компонента
  useRvmInit({ modelUrl, enabled: autoInit })

  const { isLoading, error, model } = useRvmStore()

  if (isLoading) {
    return (
      <Stack sx={{ p: 2 }} spacing={1}>
        <Typography variant="body2">Загрузка модели RVM…</Typography>
        <LinearProgress />
      </Stack>
    )
  }

  if (error) {
    return <Alert severity="error">Ошибка загрузки модели: {error}</Alert>
  }

  if (model) {
    return (
      <Typography variant="body2" sx={{ p: 2 }}>
        Модель RVM загружена
      </Typography>
    )
  }

  return null
}
