'use client';

import React from 'react';
import { NavLayout } from '@/components/Layout/NavLayout';
import { ResumeLab } from '@/components/ResumeLab/ResumeLab';

export default function ResumeLabPage() {
  return (
    <NavLayout
      title="Resume Lab"
      subtitle="Manage, tailor, and compare multiple variants of your professional resume with real-time keyword alignment analysis."
    >
      <ResumeLab />
    </NavLayout>
  );
}
