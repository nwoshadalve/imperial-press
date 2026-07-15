import { create } from 'zustand';

interface DraftFields {
  title: string;
  abstract: string;
  keywords: string[];
  journalId: string;
}

interface DraftState extends DraftFields {
  step: number;
  isDirty: boolean;
  setStep: (step: number) => void;
  updateField: <K extends keyof DraftFields>(key: K, value: DraftFields[K]) => void;
  reset: () => void;
}

const initialFields: DraftFields = {
  title: '',
  abstract: '',
  keywords: [],
  journalId: '',
};

export const useSubmissionDraftStore = create<DraftState>((set) => ({
  ...initialFields,
  step: 1,
  isDirty: false,
  setStep: (step) => set({ step }),
  updateField: (key, value) => set({ [key]: value, isDirty: true }),
  reset: () => set({ ...initialFields, step: 1, isDirty: false }),
}));
