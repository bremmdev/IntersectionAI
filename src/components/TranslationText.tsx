import React from 'react'
import { useTranslation } from '@/context/translation-context'

const TranslationText = () => {

  const { translatedText } = useTranslation();

  return (
    <div className="h-40 rounded-lg px-3 py-2 bg-slate-50 overflow-y-auto">{translatedText}</div>
  )
}

export default TranslationText