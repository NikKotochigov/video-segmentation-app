import { useEffect } from 'react'
import { loadRvmModel } from '../../shared/lib/ml/rvm/load-rvm'
import { useRvmStore } from '../../stores/rvm/rvm.store'

interface UseRvmInitOptions {
  modelUrl: string
}

export const useRvmInit = ({ modelUrl }: UseRvmInitOptions) => {
  const { setModel, setIsLoading, setError } = useRvmStore()

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setIsLoading(true)
        const model = await loadRvmModel(modelUrl)
        if (!mounted) return
        setModel(model)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load RVM model'
        setError(msg)
        console.error('RVM load error', e)
      } finally {
        setIsLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [modelUrl, setModel, setIsLoading, setError])
}
