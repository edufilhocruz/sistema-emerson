import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Processo } from '../services/processoService';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  processo: Processo | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  processo
}) => {
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleConfirm = async () => {
    if (!processo) return;

    setDeleting(true);
    
    try {
      await onConfirm();
      
      // Mostrar animação de sucesso
      setDeleting(false);
      setShowSuccess(true);
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      setDeleting(false);
      setShowError(true);
      
      // Esconder erro após 3 segundos
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const handleClose = () => {
    if (!deleting && !showSuccess && !showError) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6 animate-pulse" />
                Processo Excluído
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-gray-600 mb-4">
                O processo <span className="font-semibold">{processo?.numeroProcesso}</span> foi excluído com sucesso!
              </p>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
            </DialogHeader>
            
            {showError ? (
              <div className="py-4">
                <div className="flex items-center gap-2 text-red-600 mb-4">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">Erro ao excluir processo</span>
                </div>
                <p className="text-sm text-gray-400">
                  Tente novamente ou verifique se o processo não está sendo usado por outras funcionalidades.
                </p>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-gray-600">
                  Tem certeza que deseja excluir o processo{' '}
                  <span className="font-semibold text-gray-800">
                    {processo?.numeroProcesso}
                  </span>
                  {' '}de {processo?.nome}?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirm}
                disabled={deleting}
                className="relative"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : showError ? (
                  'Tentar Novamente'
                ) : (
                  'Excluir'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
