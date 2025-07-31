import React, { useState, useEffect } from 'react'
import { navigationItems } from '@/data'
import { smoothScrollTo } from '@/lib/utils'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank')
    } else {
      smoothScrollTo(href.replace('#', ''), 80)
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Raunaimer</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href, item.external)}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
          >
            <nav className="flex flex-col space-y-1 py-4">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href, item.external)}
                  className="text-left px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium rounded-lg mx-2"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
} 