import React from 'react'
import { motion } from 'framer-motion'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <Features />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App 