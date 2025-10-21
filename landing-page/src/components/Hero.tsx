import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Background Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/banner_001.jpg"
          alt="Raunaimer Advocacia - Especialistas em Direito Condominial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white mb-6">
              Especialistas em{' '}
              <span className="bg-gradient-to-r from-raunaimer-gold to-gray-400 bg-clip-text text-transparent">
                Direito Condominial
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Sua jornada para soluções jurídicas condominiais começa aqui
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button
              onClick={() => scrollToSection('contato')}
              className="bg-gradient-to-r from-raunaimer-gold to-gray-400 text-raunaimer-dark px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Fale Conosco</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToSection('recursos')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Saiba Mais
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <StatCard end={100} suffix="+" label="Condomínios Atendidos" delay={0.6} />
            <StatCard end={80} suffix="%" label="Redução na Inadimplência" delay={0.8} />
            <StatCard end={24} suffix="/7" label="Suporte Disponível" delay={1} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  end: number
  suffix: string
  label: string
  delay: number
}

const StatCard: React.FC<StatCardProps> = ({ end, suffix, label, delay }) => {
  const [count, setCount] = React.useState(0)
  const [hasAnimated, setHasAnimated] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  React.useEffect(() => {
    if (!hasAnimated) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / 2000, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(end * easeOutQuart)
      
      setCount(currentCount)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, hasAnimated])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl font-bold text-raunaimer-gold mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm text-white/80 font-medium">
        {label}
      </div>
    </motion.div>
  )
} 