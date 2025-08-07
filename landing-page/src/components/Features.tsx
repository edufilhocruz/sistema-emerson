import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Building, Eye, Shield, Users, FileText, ArrowUpRight, UserCheck } from 'lucide-react'

export const Features: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Proteção Legal',
      description: 'Defesa completa do condomínio em ações judiciais e administrativas'
    },
    {
      icon: Eye,
      title: 'Monitoramento',
      description: 'Acompanhamento contínuo de processos e prazos legais'
    },
    {
      icon: ArrowUpRight,
      title: 'Elaboração de Multas',
      description: 'Processo completo de aplicação de penalidades conforme legislação'
    },
    {
      icon: UserCheck,
      title: 'Análise de Contratos',
      description: 'Proteção legal para seu condomínio com revisão especializada'
    }
  ]

  const services = [
    {
      icon: Heart,
      title: 'Orientação ao Síndico',
      description: 'Orientação completa ao corpo diretivo condominial'
    },
    {
      icon: Building,
      title: 'Gestão Administrativa',
      description: 'Suporte na gestão administrativa e legal do condomínio'
    },
    {
      icon: Eye,
      title: 'Compliance Legal',
      description: 'Garantia de conformidade com todas as normas legais aplicáveis'
    },
    {
      icon: Shield,
      title: 'Defesas e Ações',
      description: 'Defesa de ações que o condomínio figure no polo.'
    }
  ]

  return (
    <section id="recursos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Soluções Jurídicas{' '}
            <span className="bg-gradient-to-r from-raunaimer-gold to-yellow-400 bg-clip-text text-transparent">
              Completas
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rastreie cada questão condominial e interação para refinar estratégias de resolução
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-raunaimer-gold transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-r from-raunaimer-gold to-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 text-center mb-20"
        >
          <p className="text-2xl text-gray-800 leading-relaxed max-w-4xl mx-auto">
            Síndico, nós sabemos que administrar um condomínio não é fácil, por isso estamos aqui, prontos a
            te auxiliar em todas as questões que envolvem o condomínio, desde{' '}
            <span className="font-bold text-raunaimer-gold">uma briga de vizinhos</span> até{' '}
            <span className="font-bold text-raunaimer-gold">uma ação trabalhista</span>.
          </p>
        </motion.div>

        {/* Services Section */}
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              O que oferecemos aos nossos Clientes
            </h3>
            <div className="space-y-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-raunaimer-gold to-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h4>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Precisa de ajuda com seu condomínio?
              </h3>
              <p className="text-gray-600 mb-8 max-w-md">
                Entre em contato conosco e descubra como podemos ajudar a resolver os problemas do seu condomínio
              </p>
              <button
                onClick={() => {
                  const element = document.getElementById('contato')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="bg-gradient-to-r from-raunaimer-gold to-yellow-400 text-raunaimer-dark px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Fale Conosco Agora
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 