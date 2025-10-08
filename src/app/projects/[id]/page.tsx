import { createClerkSupabaseClientSsr } from '@/lib/supabase-ssr';
import { CanvasPage } from '@/components/organisms/CanvasPage';
import { mapSupabaseCards, mapSupabaseEdges } from '@/lib/utils/mappers';

interface ProjectPageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params;
  const search = await searchParams;
  const supabase = await createClerkSupabaseClientSsr();

  const [{ data: project }, { data: cards }, { data: edges }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('cards').select('*').eq('project_id', id),
    supabase.from('edges').select('*').eq('project_id', id)
  ]);

  // Mapear cards e edges do Supabase para o formato esperado
  const mappedCards = cards ? mapSupabaseCards(cards) : [];
  const mappedEdges = edges ? mapSupabaseEdges(edges) : [];

  // Fallback para desenvolvimento: se não encontrar projeto, renderiza stub
  const projectStub = project || ({
    id,
    name: 'Projeto (draft)',
    description: 'Canvas em modo desenvolvimento',
    template_id: 'site-app',
    status: 'draft',
    owner_id: 'dev-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any);
  const isLoading = false;

  const onboarding = search?.onboarding === '1' || search?.onboarding === 'true';

  return (
    <CanvasPage
      projectId={id}
      project={projectStub as any}
      cards={mappedCards}
      edges={mappedEdges}
      isLoading={isLoading}
      onboarding={onboarding}
    />
  );
}
