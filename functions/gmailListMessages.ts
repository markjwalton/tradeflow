import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function refreshTokenIfNeeded(base44, user) {
  if (!user.gmail_token_expiry || Date.now() >= user.gmail_token_expiry) {
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: user.gmail_refresh_token,
        grant_type: 'refresh_token'
      })
    });

    const tokens = await response.json();
    await base44.asServiceRole.auth.updateUser(user.id, {
      gmail_access_token: tokens.access_token,
      gmail_token_expiry: Date.now() + (tokens.expires_in * 1000)
    });

    return tokens.access_token;
  }
  return user.gmail_access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.gmail_access_token) {
      return Response.json({ error: 'Gmail not connected', needsAuth: true }, { status: 401 });
    }

    const accessToken = await refreshTokenIfNeeded(base44, user);
    const { folder = 'INBOX', maxResults = 50 } = await req.json();

    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${folder}&maxResults=${maxResults}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];

    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return detailResponse.json();
      })
    );

    const formatted = detailedMessages.map((msg) => {
      const headers = msg.payload.headers;
      const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

      return {
        id: msg.id,
        threadId: msg.threadId,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: new Date(parseInt(msg.internalDate)),
        snippet: msg.snippet,
        body: msg.payload.body.data || msg.payload.parts?.[0]?.body?.data || '',
        labels: msg.labelIds,
        isRead: !msg.labelIds.includes('UNREAD'),
        isStarred: msg.labelIds.includes('STARRED')
      };
    });

    return Response.json({ messages: formatted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});