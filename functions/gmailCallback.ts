import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Gmail OAuth callback handler
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Handle both GET (from Google OAuth redirect) and POST (from Base44)
    let code, state;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      code = url.searchParams.get('code');
      state = url.searchParams.get('state');
    } else {
      const body = await req.json().catch(() => ({}));
      code = body.code;
      state = body.state;
    }

    if (!code || !state) {
      return Response.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GMAIL_OAUTH_REDIRECT_URI');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      return Response.json({ 
        error: 'Failed to get access token',
        details: tokens.error_description || tokens.error || 'Unknown error'
      }, { status: 500 });
    }

    // Store tokens securely for the user
    await base44.asServiceRole.entities.User.update(state, {
      gmail_access_token: tokens.access_token,
      gmail_refresh_token: tokens.refresh_token,
      gmail_token_expiry: Date.now() + (tokens.expires_in * 1000)
    });

    return new Response(
      `<html><body><script>window.opener.postMessage({type:'gmail-auth-success'}, '*'); window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});