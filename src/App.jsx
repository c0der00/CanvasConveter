import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CanvaConvater from './commponante/CanvaConvater'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CanvaConvater/>
    </>
  )
}

export default App
