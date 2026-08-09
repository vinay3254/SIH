import React from 'react';
import AppLayout from '@/components/AppLayout';
import NewCaseForm from './components/NewCaseForm';

export default function NewCaseEvidenceIntakePage() {
  return (
    <AppLayout currentPath="/new-case-evidence-intake">
      <NewCaseForm />
    </AppLayout>
  );
}
