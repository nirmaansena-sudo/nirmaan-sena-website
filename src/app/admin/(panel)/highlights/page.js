import HighlightsManager from '@/components/admin/HighlightsManager';
import { getStore } from '@/lib/store';
import { initialHighlights } from '@/lib/highlights';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Project highlights' };

export default async function HighlightsPage() {
  const store = await getStore();
  const [projects, settings] = await Promise.all([store.listProjects({ includeDrafts: true }), store.getHighlights()]);
  return <HighlightsManager projects={projects} initialSettings={initialHighlights(projects, settings)} initiallyConfigured={settings !== null} />;
}
