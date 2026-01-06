import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { zipFileUrl, websiteFolderId, currentPath } = await req.json();

    if (!zipFileUrl || !websiteFolderId) {
      return Response.json({ error: 'Missing zipFileUrl or websiteFolderId' }, { status: 400 });
    }

    // Fetch the zip file from the URL
    const zipResponse = await fetch(zipFileUrl);
    if (!zipResponse.ok) {
      return Response.json({ error: 'Failed to fetch zip file' }, { status: 400 });
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    const uploadedFiles = [];

    // Process each file in the zip
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      // Skip directories
      if (zipEntry.dir) continue;

      // Get file content as Uint8Array
      const fileContent = await zipEntry.async('uint8array');
      
      // Create a File object
      const fileName = relativePath.split('/').pop();
      const file = new File([fileContent], fileName, { 
        type: 'application/octet-stream' 
      });

      // Upload file using Base44
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: file,
      });

      // Determine file type
      const extension = fileName.split('.').pop()?.toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
      const fileType = imageExtensions.includes(extension) ? 'image' : 'other';

      // Build final file path
      const finalPath = currentPath ? `${currentPath}/${relativePath}` : relativePath;

      // Create asset record
      await base44.asServiceRole.entities.WebsiteAsset.create({
        website_folder_id: websiteFolderId,
        file_name: fileName,
        file_path: finalPath,
        file_url,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
      });

      uploadedFiles.push({
        file_name: fileName,
        file_path: relativePath,
        file_url,
      });
    }

    return Response.json({ 
      success: true, 
      uploaded_count: uploadedFiles.length,
      files: uploadedFiles 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});