import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook to fetch and resolve website assets for a given folder
 * @param {string} websiteSlug - The slug of the website folder (e.g., 'radiant', 'commit')
 * @returns {Object} - { getAssetUrl, assets, isLoading }
 */
export function useWebsiteAssets(websiteSlug) {
  const { data: folder } = useQuery({
    queryKey: ['websiteFolder', websiteSlug],
    queryFn: async () => {
      const folders = await base44.entities.WebsiteFolder.filter({ slug: websiteSlug });
      return folders[0];
    },
    enabled: !!websiteSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['websiteAssets', folder?.id],
    queryFn: async () => {
      return await base44.entities.WebsiteAsset.filter({ website_folder_id: folder.id });
    },
    enabled: !!folder?.id,
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Resolve a relative path to an actual asset URL
   * @param {string} relativePath - Path like 'screenshots/app.png' or '/screenshots/app.png'
   * @returns {string} - Full asset URL or the original path if not found
   */
  const getAssetUrl = (relativePath) => {
    if (!relativePath) return '';
    
    // Remove leading slash if present
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    
    // Find asset by matching file_path (which includes 'public/' prefix)
    const asset = assets.find(a => 
      a.file_path === `public/${cleanPath}` || 
      a.file_path === cleanPath ||
      a.file_path.endsWith(`/${cleanPath}`)
    );
    
    return asset?.file_url || relativePath;
  };

  return {
    getAssetUrl,
    assets,
    isLoading,
    folder,
  };
}