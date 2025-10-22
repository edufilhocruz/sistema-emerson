import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'

// Schema de validação
const contactFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  contactType: z.enum(['syndic', 'condominium', 'administrator'], {
    errorMap: () => ({ message: 'Selecione uma opção' })
  }),
  company: z.string().optional(),
  units: z.string().optional(),
  message: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

// Dados de contato
const contactInfo = [
  {
    type: 'email',
    label: 'Email',
    value: 'contato@raunaimer.adv.br',
    icon: Mail
  },
  {
    type: 'phone',
    label: 'Telefone',
    value: '(11) 99999-9999',
    icon: Phone
  },
  {
    type: 'address',
    label: 'Endereço',
    value: 'Avenida Paulista, 2073, Conj. 1104 - Bela Vista - SP',
    icon: MapPin
  }
]

export const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      contactType: undefined,
      company: '',
      units: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      // Enviar dados para a API do sistema principal
      const response = await fetch('https://app.raunaimer.adv.br/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          contact_type: data.contactType === 'syndic' ? 'Síndico' : 
                       data.contactType === 'condominium' ? 'Condomínio' : 'Administrador',
          company: data.company || 'Não informado',
          units: data.units || 'Não informado',
          message: data.message || 'Não informado',
          source: 'landing-page',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar email')
      }

      // Sucesso
      setShowSuccess(true)
      form.reset()
      
      // Resetar sucesso após 5 segundos
      setTimeout(() => setShowSuccess(false), 5000)

    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error)
      alert('Erro ao enviar mensagem. Tente novamente em alguns instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <section id="contato" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center bg-white rounded-2xl p-8 shadow-xl"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
            <p className="text-gray-600 mb-6">
              Obrigado pelo contato. Entraremos em contato em breve!
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Enviar Nova Mensagem
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="contato" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quer saber mais sobre o Emerson Advogado? Preencha o formulário abaixo e entraremos em contato em até 24 horas.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Informações de Contato */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Informações de Contato
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Nossa equipe está pronta para ajudar você a transformar a gestão do seu condomínio. 
                  Entre em contato conosco e descubra como podemos facilitar seu dia a dia.
                </p>
              </div>

              {/* Cards de contato */}
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.type}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{info.label}</h4>
                      <p className="text-gray-600">{info.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Estatísticas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl p-8 text-white"
              >
                <h4 className="text-xl font-bold mb-4">Por que escolher o Emerson Advogado?</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm opacity-90">Condomínios Atendidos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24h</div>
                    <div className="text-sm opacity-90">Tempo de Resposta</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Envie sua Mensagem
              </h3>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Tipo de Contato */}
                <div>
                  <label htmlFor="contactType" className="block text-sm font-medium text-gray-700 mb-2">
                    Você é *
                  </label>
                  <select
                    id="contactType"
                    {...form.register('contactType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="syndic">Síndico</option>
                    <option value="condominium">Condomínio</option>
                    <option value="administrator">Administrador</option>
                  </select>
                  {form.formState.errors.contactType && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactType.message}</p>
                  )}
                </div>

                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    {...form.register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...form.register('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    {...form.register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* Empresa */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa (opcional)
                  </label>
                  <input
                    id="company"
                    type="text"
                    placeholder="Nome da sua empresa"
                    {...form.register('company')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Unidades */}
                <div>
                  <label htmlFor="units" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Unidades (opcional)
                  </label>
                  <input
                    id="units"
                    type="text"
                    placeholder="Ex: 50 unidades"
                    {...form.register('units')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="message"
                    placeholder="Conte-nos mais sobre suas necessidades..."
                    rows={4}
                    {...form.register('message')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Botão de envio */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Mensagem
                    </>
                  )}
                </button>

                {/* Texto de segurança */}
                <p className="text-xs text-gray-500 text-center">
                  Seus dados estão seguros conosco. Não compartilharemos suas informações com terceiros.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
} 