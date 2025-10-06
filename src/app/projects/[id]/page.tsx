'use client';

import { CanvasPage } from '@/components/organisms/CanvasPage';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  return <CanvasPage projectId={id} />;
}
