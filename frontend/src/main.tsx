import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast.tsx'
import './index.css'
import App from './App.tsx'
import Conferences from './pages/Conferences.tsx'
import Hotels from './pages/Hotels.tsx'
import HotelSingle from './pages/HotelSingle.tsx'
import Activites from './pages/Activites.tsx'
import Connexion from './pages/Connexion.tsx'
import Inscription from './pages/Inscription.tsx'
import Profil from './pages/Profil.tsx'
import Reserver from './pages/Reserver.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/conferences" element={<Conferences />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelSingle />} />
        <Route path="/activites" element={<Activites />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/reserver" element={<Reserver />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
)
