import React from 'react';
import TransactionModal from './TransactionModal';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  return (
    <TransactionModal
      isOpen={isOpen}
      onClose={onClose}
      editTransaction={transaction}
    />
  );
};

export default EditTransactionModal;