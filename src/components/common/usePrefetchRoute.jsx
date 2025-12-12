import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Common query prefetch helpers
export function usePrefetchRoute() {
  const queryClient = useQueryClient();

  const prefetchProjects = () => {
    queryClient.prefetchQuery({
      queryKey: ['projects'],
      queryFn: () => base44.entities.Project.list(),
      staleTime: 30000,
    });
  };

  const prefetchTasks = () => {
    queryClient.prefetchQuery({
      queryKey: ['tasks'],
      queryFn: () => base44.entities.Task.list(),
      staleTime: 30000,
    });
  };

  const prefetchCustomers = () => {
    queryClient.prefetchQuery({
      queryKey: ['customers'],
      queryFn: () => base44.entities.Customer.list(),
      staleTime: 30000,
    });
  };

  const prefetchTeam = () => {
    queryClient.prefetchQuery({
      queryKey: ['team'],
      queryFn: () => base44.entities.TeamMember.list(),
      staleTime: 30000,
    });
  };

  const prefetchMindMaps = () => {
    queryClient.prefetchQuery({
      queryKey: ['mindmaps'],
      queryFn: () => base44.entities.MindMap.list(),
      staleTime: 30000,
    });
  };

  const prefetchLibrary = (libraryType) => {
    const entityMap = {
      'EntityLibrary': 'EntityTemplate',
      'PageLibrary': 'PageTemplate',
      'FeatureLibrary': 'FeatureTemplate',
      'TemplateLibrary': 'NodeTemplate',
      'BusinessTemplates': 'BusinessTemplate',
    };
    
    const entityName = entityMap[libraryType];
    if (entityName) {
      queryClient.prefetchQuery({
        queryKey: [libraryType],
        queryFn: () => base44.entities[entityName].list(),
        staleTime: 30000,
      });
    }
  };

  const prefetchRoadmap = () => {
    queryClient.prefetchQuery({
      queryKey: ['roadmap'],
      queryFn: () => base44.entities.RoadmapItem.list(),
      staleTime: 30000,
    });
  };

  const prefetchEstimates = () => {
    queryClient.prefetchQuery({
      queryKey: ['estimates'],
      queryFn: () => base44.entities.Estimate.list(),
      staleTime: 30000,
    });
  };

  return {
    prefetchProjects,
    prefetchTasks,
    prefetchCustomers,
    prefetchTeam,
    prefetchMindMaps,
    prefetchLibrary,
    prefetchRoadmap,
    prefetchEstimates,
  };
}