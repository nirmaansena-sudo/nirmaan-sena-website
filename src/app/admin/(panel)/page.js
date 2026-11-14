import ProjectsTable from '@/components/admin/ProjectsTable';
import { getStore } from '@/lib/store';
import { resolveHighlights } from '@/lib/highlights';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Projects' };

export default async function AdminProjectsPage() {
  const store = await getStore();
  const [projects, enquiries, highlights] = await Promise.all([store.listProjects({ includeDrafts: true }), store.listEnquiries(), store.getHighlights()]);
  const highlightedIds = [...new Set(Object.values(resolveHighlights(projects, highlights)).flat().map((project) => project.id))];
  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.published).length,
    featured: projects.filter((p) => p.featured && p.published).length,
    newEnquiries: enquiries.filter((e) => e.status === 'new').length,
  };
  return <ProjectsTable initialProjects={projects} stats={stats} highlightedIds={highlightedIds} />;
}
