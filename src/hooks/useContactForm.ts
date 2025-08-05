import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/useToast'
import { generateWhatsAppLink, generateEmailLink } from '@/lib/utils'

// Schema de validação do formulário
const contactFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  company: z.string().optional(),
  units: z.string().optional(),
  message: z.string().optional(),
})

type ContactFormSchema = z.infer<typeof contactFormSchema>

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessCard, setShowSuccessCard] = useState(false)
  const { toast } = useToast()

  const form = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      units: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormSchema) => {
    setIsSubmitting(true)

    try {
      // Enviar dados diretamente para a API do sistema principal
      const response = await fetch('https://app.raunaimer.adv.br/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          contact_type: 'Cliente',
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

      // Mostrar toast de sucesso
      toast({
        title: 'Mensagem enviada com sucesso!',
        description: 'Você receberá um email de confirmação em breve.',
        variant: 'success',
      })

      // Mostrar card de sucesso
      setShowSuccessCard(true)

      // Limpar formulário
      form.reset()

      console.log('Email enviado via API:', result)

    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error)

      // Mostrar erro específico
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      })

      // Fallback: tentar enviar via WhatsApp/Email
      try {
        await sendToWhatsApp(data)
        await sendToEmail(data)
        
        toast({
          title: 'Dados enviados via WhatsApp/Email',
          description: 'Como alternativa, enviamos seus dados via WhatsApp e Email.',
          variant: 'info',
        })
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendToWhatsApp = async (data: ContactFormSchema) => {
    const message = formatWhatsAppMessage(data)
    const whatsappLink = generateWhatsAppLink('11999999999', message)

    // Abrir WhatsApp em nova aba
    window.open(whatsappLink, '_blank')
  }

  const sendToEmail = async (data: ContactFormSchema) => {
    const subject = 'Nova solicitação - Sistema Raunaimer'
    const body = formatEmailMessage(data)
    const emailLink = generateEmailLink('contato@raunaimer.adv.br', subject, body)

    // Abrir cliente de email
    window.open(emailLink, '_blank')
  }

  const formatWhatsAppMessage = (data: ContactFormSchema): string => {
    return `Olá! Recebi uma nova solicitação do site:

*Nome:* ${data.name}
*Email:* ${data.email}
*Telefone:* ${data.phone}
${data.company ? `*Empresa:* ${data.company}` : ''}
${data.units ? `*Unidades:* ${data.units}` : ''}
${data.message ? `*Mensagem:* ${data.message}` : ''}

Gostaria de saber mais sobre o Sistema Raunaimer.`
  }

  const formatEmailMessage = (data: ContactFormSchema): string => {
    return `Nova solicitação recebida do site:

Nome: ${data.name}
Email: ${data.email}
Telefone: ${data.phone}
${data.company ? `Empresa: ${data.company}` : ''}
${data.units ? `Unidades: ${data.units}` : ''}
${data.message ? `Mensagem: ${data.message}` : ''}

---
Enviado automaticamente pelo sistema de contato.`
  }

  const resetForm = () => {
    setShowSuccessCard(false)
    form.reset()
  }

  return {
    form,
    isSubmitting,
    showSuccessCard,
    onSubmit: form.handleSubmit(onSubmit),
    resetForm,
  }
} 