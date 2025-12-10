import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Upload to get a URL (required for Whisper API)
    const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });

    // Use OpenAI Whisper via LLM integration for transcription
    // Note: This uses the Core.InvokeLLM as a workaround - in production you'd use a dedicated Whisper endpoint
    const transcription = await base44.integrations.Core.InvokeLLM({
      prompt: `Transcribe the audio file at ${file_url}. Return only the transcribed text, no additional commentary.`,
      add_context_from_internet: false,
      file_urls: [file_url]
    });

    return Response.json({
      transcription,
      audio_url: file_url
    });
  } catch (error) {
    console.error('Speech to text error:', error);
    return Response.json({ 
      error: error.message || 'Transcription failed' 
    }, { status: 500 });
  }
});