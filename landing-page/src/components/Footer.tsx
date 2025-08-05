import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-raunaimer-gold" />
                <span>Avenida Regente Feijó 944, Conj. 1604A Anália Franco, São Paulo/SP</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-raunaimer-gold" />
                <span>Seg-Sex 9.00 - 17.00</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-raunaimer-gold" />
                <span>contato@raunaimer.adv.br</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-raunaimer-gold" />
                <span>11 99423-2497</span>
              </li>
            </ul>
          </motion.div>

          {/* Serviços */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button
                  onClick={() => scrollToSection('recursos')}
                  className="hover:text-raunaimer-gold transition-colors cursor-pointer"
                >
                  Direito Condominial
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('recursos')}
                  className="hover:text-raunaimer-gold transition-colors cursor-pointer"
                >
                  Nossos Serviços
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Links Rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button
                  onClick={() => scrollToSection('recursos')}
                  className="hover:text-raunaimer-gold transition-colors"
                >
                  Nossos Serviços
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contato')}
                  className="hover:text-raunaimer-gold transition-colors"
                >
                  Fale Conosco
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-raunaimer-gold transition-colors">
                  Sobre Nós
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Raunaimer Monfre Advocacia. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-raunaimer-gold transition-colors text-sm">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-raunaimer-gold transition-colors text-sm">
                Política de Privacidade
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
} 