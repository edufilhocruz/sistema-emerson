import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, MessageCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SuccessCardProps {
  onReset: () => void
}

export const SuccessCard: React.FC<SuccessCardProps> = ({ onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl p-8 shadow-xl border border-green-200 max-w-md mx-auto"
    >
      <div className="text-center">
        {/* Ícone de sucesso */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>

        {/* Título */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Mensagem Enviada!
        </motion.h3>

        {/* Descrição */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6 leading-relaxed"
        >
          Recebemos sua solicitação com sucesso! Você receberá um email de confirmação em breve.
        </motion.p>

        {/* Ícones de comunicação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center space-x-6 mb-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Email</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">WhatsApp</span>
          </div>
        </motion.div>

        {/* Próximos passos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 rounded-lg p-4 mb-6"
        >
          <h4 className="font-semibold text-blue-900 mb-2">Próximos passos:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Nossa equipe analisará sua solicitação</li>
            <li>• Entraremos em contato em até 24 horas</li>
            <li>• Apresentaremos uma proposta personalizada</li>
          </ul>
        </motion.div>

        {/* Botões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <Button
            onClick={() => window.open('https://app.raunaimer.adv.br', '_blank')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Conhecer o Sistema
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
          >
            Enviar Nova Mensagem
          </Button>
        </motion.div>

        {/* Informações de contato */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <p className="text-xs text-gray-500">
            Precisa de ajuda? Entre em contato:
          </p>
          <p className="text-sm text-gray-700 font-medium">
            contato@raunaimer.adv.br | (11) 99999-9999
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
} 