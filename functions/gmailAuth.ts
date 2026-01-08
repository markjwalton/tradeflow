import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const redirectUri = Deno.env.get('GMAIL_OAUTH_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      return Response.json({ error: 'OAuth credentials not configured' }, { status: 500 });
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ].join(' ');

    // Add login_hint if provided to pre-select the correct Google account
    const body = await req.json().catch(() => ({}));
    const email = body.email;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${user.id}` +
      (email ? `&login_hint=${encodeURIComponent(email)}` : '');

    return Response.json({ authUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});