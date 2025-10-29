import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Video Segmentation App</h1>
        <p className="read-the-docs">
          Крутое приложение для сегментации видео в реальном времени
        </p>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
        <p>
          Начинаем разработку ML-приложения с React + TypeScript + Vite
        </p>
      </div>
    </>
  )
}

export default App
