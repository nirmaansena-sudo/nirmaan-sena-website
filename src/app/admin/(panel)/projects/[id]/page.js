import { notFound } from 'next/navigation';
import ProjectEditor from '@/components/admin/ProjectEditor';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit project' };

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  const project = await (await getStore()).getProject(id);
  if (!project) notFound();
  return <ProjectEditor initial={project} />;
}
