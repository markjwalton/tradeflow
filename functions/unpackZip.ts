import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const zipFile = formData.get('zipFile');
    const websiteFolderId = formData.get('websiteFolderId');

    if (!zipFile || !websiteFolderId) {
      return Response.json({ error: 'Missing zipFile or websiteFolderId' }, { status: 400 });
    }

    // Read zip file
    const zipBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    const uploadedFiles = [];

    // Process each file in the zip
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      // Skip directories
      if (zipEntry.dir) continue;

      // Get file content as blob
      const fileBlob = await zipEntry.async('blob');
      
      // Create FormData for upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileBlob, relativePath.split('/').pop());

      // Upload file using Base44
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: fileBlob,
      });

      // Determine file type
      const fileName = relativePath.split('/').pop();
      const extension = fileName.split('.').pop()?.toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
      const fileType = imageExtensions.includes(extension) ? 'image' : 'other';

      // Create asset record
      await base44.asServiceRole.entities.WebsiteAsset.create({
        website_folder_id: websiteFolderId,
        file_name: fileName,
        file_path: relativePath,
        file_url,
        file_type: fileType,
        file_size: fileBlob.size,
        mime_type: fileBlob.type,
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