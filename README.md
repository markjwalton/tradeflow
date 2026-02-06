# Base44 App

## Getting Your API Keys

### CMS API Key (Internal)

The application generates CMS API keys for authenticating requests to the built-in CMS API. To create one:

1. Open the app and navigate to **Settings → API Manager**
2. Under the **APIs** tab, click **Add API**
3. Fill in a name, select a provider, and enter the key
4. The key is stored and can be used via the `X-API-Key` header when calling the `/cmsApi` endpoint

For standalone instances, API keys are auto-generated with the prefix `sa_` when you create a new instance in the **Standalone Instance Manager**.

### External Service API Keys

The app integrates with several third-party services. Obtain keys from their respective platforms:

| Service | Where to Get Your Key | Dashboard Secret Name |
|---|---|---|
| [Ideal Postcodes](https://ideal-postcodes.co.uk) | Sign up at ideal-postcodes.co.uk and copy your API key from the dashboard | `IDEAL_POSTCODES_API_KEY` |
| [OpenAI](https://platform.openai.com/api-keys) | Create an API key at platform.openai.com under **API Keys** | `OPENAI_API_KEY` |
| [Google Cloud](https://console.cloud.google.com/apis/credentials) | Create credentials in the Google Cloud Console | `GOOGLE_CLOUD_API_KEY` |
| [Stripe](https://dashboard.stripe.com/apikeys) | Find your keys in the Stripe Dashboard under **Developers → API Keys** | `STRIPE_API_KEY` |
| [SendGrid](https://app.sendgrid.com/settings/api_keys) | Generate an API key in SendGrid under **Settings → API Keys** | `SENDGRID_API_KEY` |
| [Twilio](https://www.twilio.com/console) | Get your Account SID and Auth Token from the Twilio Console | `TWILIO_API_KEY` |
| [Adobe Fonts](https://developer.adobe.com/) | Create a project in the Adobe Developer Console | `ADOBE_FONTS_API_TOKEN` |
| [GitHub](https://github.com/settings/tokens) | Generate a personal access token under **Settings → Developer settings** | `GITHUB_TOKEN` |

### Configuring Secrets in Base44

All sensitive API keys are stored as server-side secrets through the Base44 dashboard — they are never exposed to the client.

1. Go to **Base44 Dashboard → Settings → Environment Variables**
2. Add a new secret using the name from the table above (e.g. `OPENAI_API_KEY`)
3. Paste your key as the value and save

Backend functions access these secrets via `Deno.env.get('SECRET_NAME')`. See the [Environment Configuration Guide](src/components/common/ENVIRONMENT_CONFIG_GUIDE.md.jsx) for full details on secure secret management.
