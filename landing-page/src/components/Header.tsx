import React, { useState, useEffect } from 'react'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gray-800/95 backdrop-blur-md shadow-xl' : 'bg-gray-800'
    }`}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="/logotipo.png" 
              alt="Emerson Reis Advocacia" 
              className="w-auto h-24"
            />
          </div>


        </div>


      </div>
    </header>
  )
} 