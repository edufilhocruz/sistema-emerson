import React from 'react'
import { motion } from 'framer-motion'
import { useContactForm } from '@/hooks/useContactForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SuccessCard } from '@/components/SuccessCard'
import { contactInfo, unitsOptions } from '@/data'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'

export const Contact: React.FC = () => {
  const { form, isSubmitting, showSuccessCard, onSubmit, resetForm } = useContactForm()

  if (showSuccessCard) {
    return (
      <section id="contato" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SuccessCard onReset={resetForm} />
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
            Quer saber mais sobre o Sistema Raunaimer? Preencha o formulário abaixo e entraremos em contato em até 24 horas.
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
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {info.type === 'email' && <Mail className="w-6 h-6 text-white" />}
                      {info.type === 'phone' && <Phone className="w-6 h-6 text-white" />}
                      {info.type === 'address' && <MapPin className="w-6 h-6 text-white" />}
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
              >
                <h4 className="text-xl font-bold mb-4">Por que escolher o Raunaimer?</h4>
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

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    {...form.register('name')}
                    className="w-full"
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
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...form.register('email')}
                    className="w-full"
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
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    {...form.register('phone')}
                    className="w-full"
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
                  <Input
                    id="company"
                    type="text"
                    placeholder="Nome da sua empresa"
                    {...form.register('company')}
                    className="w-full"
                  />
                </div>

                {/* Unidades */}
                <div>
                  <label htmlFor="units" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Unidades (opcional)
                  </label>
                  <Select onValueChange={(value) => form.setValue('units', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a quantidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem (opcional)
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Conte-nos mais sobre suas necessidades..."
                    rows={4}
                    {...form.register('message')}
                    className="w-full resize-none"
                  />
                </div>

                {/* Botão de envio */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>

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