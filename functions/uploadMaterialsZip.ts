import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { zipFileUrl, supplierFolder, colorMappings } = await req.json();

    if (!zipFileUrl || !supplierFolder) {
      return Response.json({ error: 'Missing zipFileUrl or supplierFolder' }, { status: 400 });
    }

    // Fetch the zip file
    const zipResponse = await fetch(zipFileUrl);
    if (!zipResponse.ok) {
      return Response.json({ error: 'Failed to fetch zip file' }, { status: 400 });
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    const uploadedMaterials = [];
    const errors = [];

    // Process each image in the zip
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;

      try {
        const fileContent = await zipEntry.async('uint8array');
        const fileName = relativePath.split('/').pop();
        const fileNameWithoutExt = fileName.split('.')[0];

        // Skip if not an image
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) continue;

        // Extract code from filename (flexible matching)
        // Handles: "W990.jpg", "U775_ST2.jpg", "U780 ST9 Monument Grey.jpg"
        const fileUpper = fileNameWithoutExt.toUpperCase();
        const codeMatch = fileUpper.match(/^([A-Z]\d+)/);
        
        if (!codeMatch) {
          errors.push(`Could not extract code from ${fileName}`);
          continue;
        }
        
        const extractedCode = codeMatch[1];
        const matchedColor = colorMappings?.find(m => 
          m.code.toUpperCase() === extractedCode
        );

        if (!matchedColor) {
          errors.push(`No color mapping found for code ${extractedCode} (from ${fileName})`);
          continue;
        }
        
        // Try to extract surface type from filename
        const surfaceMatch = fileUpper.match(/ST\d+|TM\d+/);
        const surfaceType = surfaceMatch ? surfaceMatch[0] : matchedColor.surface_type;

        // Upload image
        const file = new File([fileContent], fileName, { type: `image/${extension}` });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Create material record
        await base44.asServiceRole.entities.Material.create({
          code: matchedColor.code,
          surface_type: surfaceType,
          name: matchedColor.name,
          supplier_folder: supplierFolder,
          image_url: file_url,
          is_active: true
        });

        uploadedMaterials.push({
          code: matchedColor.code,
          name: matchedColor.name,
          file_url
        });
      } catch (error) {
        errors.push(`Error processing ${relativePath}: ${error.message}`);
      }
    }

    return Response.json({ 
      success: true,
      uploaded_count: uploadedMaterials.length,
      materials: uploadedMaterials,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});