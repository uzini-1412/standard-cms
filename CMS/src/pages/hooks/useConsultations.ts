import { useState } from 'react';
import { ConsultationWithCompany } from '../../types/consultation';


export function useConsultations() {
  const [consultations] = useState<ConsultationWithCompany[]>([]);

  return { consultations };
}