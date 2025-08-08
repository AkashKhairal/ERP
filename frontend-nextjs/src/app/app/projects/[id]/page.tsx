import ProjectDetails from '@/components/pages/Projects/ProjectDetails'

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  return <ProjectDetails projectId={params.id} />
} 