import ProjectBrowser from '@/components/site/ProjectBrowser';
import ProjectSpotlight from '@/components/site/ProjectSpotlight';
import { CtaBand, RevealLines } from '@/components/site/Blocks';
import { getProjectHighlights, getPublishedProjects } from '@/lib/projects';
import { pad2 } from '@/lib/format';

export const revalidate = 300;

export const metadata = {
  title: 'Projects',
  description: 'Homes, cafés, offices and buildings delivered by Nirmaan Sena across Jaipur.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const [projects, highlights] = await Promise.all([getPublishedProjects(), getProjectHighlights()]);
  return (
    <>
      <section className="page-hero">
        <div className="container grid">
          <span className="label" data-reveal="fade">
            Projects — {pad2(projects.length)}
          </span>
          <RevealLines lines={['Work you can', 'walk through.']} />
          <p className="lead" data-reveal="" style={{ '--d': '300ms' }}>
            Homes, cafés, offices and buildings delivered across Jaipur — each one built from a line-item BOQ and checked stage by stage.
          </p>
        </div>
      </section>
      <ProjectSpotlight project={highlights.projectsSpotlight[0]} label="In the spotlight" />
      <ProjectBrowser projects={projects} />
      <CtaBand title="Planning something similar? Start with a site audit." />
    </>
  );
}
