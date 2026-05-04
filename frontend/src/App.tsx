import './App.css'
import Navbar from './partials/Navbar'
import HeroBanner from './components/HeroBanner'
import Reassurances from './components/Reassurances'
import { SectionHotels, SectionActivites, SectionConferences } from './components/SectionsEdito'
import Avis from './components/Avis'
import Faq from './components/Faq'
import Footer from './partials/Footer'

function App() {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <Reassurances />
      <SectionHotels />
      <Avis />
      <SectionActivites />
      <div style={{ height: "80px" }} />
      <SectionConferences />
      <Faq />
      <Footer />
    </>
  )
}

export default App
