import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-GB',
            enableAutomaticPunctuation: true,
            model: 'latest_long'
          },
          audio: { content: audioBase64 }
        })
      }
    );

    const result = await response.json();

    if (result.error) {
      return Response.json({ error: result.error.message }, { status: 400 });
    }

    const transcript = result.results
      ?.map(r => r.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ') || '';

    return Response.json({ transcript });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});