"use client";

import React from 'react'
import { Trash } from 'lucide-react';
import { deleteTranslation } from '@/_actions/translation-actions';
import { toast } from "sonner";

type Props = {
  translationId: string
}

const DeleteTranslation = ({ translationId}: Props) => {

  const handleDeleteTranslation = async () => {
    const response = await deleteTranslation(translationId);
    if (response?.error) {
      toast.error(response.error);
    } else {
      toast.success('Translation deleted successfully');
    }
  };

  return (
    <button
      className="text-rose-500 font-medium text-sm mt-4 hover:bg-slate-100 rounded-full p-1"
      aria-label="Delete translation"
      onClick={handleDeleteTranslation}
    >
      <Trash size={24} />
    </button>
  )
}

export default DeleteTranslation