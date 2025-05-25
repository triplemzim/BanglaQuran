import { useContext } from 'react';
import { QuranContext } from '../context/QuranContext';

export const useQuran = () => {
  const context = useContext(QuranContext);
  if (!context) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
};
