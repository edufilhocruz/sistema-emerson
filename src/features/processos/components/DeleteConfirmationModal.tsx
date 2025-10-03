import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
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

  const handleConfirm = async () => {
    if (!processo) return;

    setDeleting(true);
    
    try {
      await onConfirm();
      setDeleting(false);
      // Após confirmação, o componente pai deve controlar o fechamento
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      setDeleting(false);
      alert('Erro ao excluir processo. Tente novamente.');
    }
  };

  const handleClose = () => {
    if (!deleting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>
        
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
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};