import Select from '@/components/ui/CustomSelect';

interface ProjectSelectorProps {
  projects: Array<{ _id?: string; id?: string; name: string; slug?: string }>;
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
  loading?: boolean;
}

export default function ProjectSelector({
  projects,
  selectedProject,
  onProjectChange,
  loading,
}: ProjectSelectorProps) {
  return (
    <div className="w-56">
      <Select
        value={selectedProject}
        onChange={onProjectChange}
        disabled={loading}
        placeholder="All Projects"
        options={[
          { value: '', label: 'All Projects' },
          ...projects.map((project) => ({
            value: (project._id || project.id) as string,
            label: project.name,
          })),
        ]}
      />
    </div>
  );
}
