# Simple Authentication

An authentication service powered by [magic.link](https://magic.link) that returns a JSON Web Token.

[Demo](https://simpleauth.calebirwin.ca/)

## How to use

1. Go to https://your_simple_authentication_path.com/login?cb=https://example.com/callback
2. User logs in
3. Redirected back to https://example.com/callback?jwt=JSON_WEB_TOKEN
4. Verify JWT and manage your user's session

## JWT Information

### Header

`Algorithm: RS256`

### Payload

```ts
{
    sub: string; // A uuid v5 id generated from google id, email, or phone. This is not dependent on magic.link issuer.
    exp: number; // Five minutes after creation (in seconds)
    email?: string; // Email used to login or from google
    phone_number?: string; // Phone used to login or from google
    gid?: string; // Unique id from google fetched from https://www.googleapis.com/oauth2/v2/userinfo/ using access token
    jti?: string; // JWT ID (unique)
    iat?: number; // Issued at (in seconds)
}
```

### Signature

Get the public key from https://your_simple_authentication_path.com/ under encryption information or from environment variables. Both JWT and PEM formats are provided.

## Config (Environment Variables)

See [example.env](./example.env)

```env
VITE_MAGIC_PUBLIC = "pk_live_YOUR_PUBLIC_KEY"
MAGIC_PRIVATE = "sk_live_YOUR_PRIVATE_KEY"
KEY_PAIR = "a key pair in JWK format"
VITE_NAMESPACE = "YOUR_NAMESPACE (if not provided will use public key)"
```

- `VITE_MAGIC_PUBLIC` and `MAGIC_PRIVATE` you can get for free from [magic.link](https://magic.link/) by creating an account. Because we generate our own id you can change your magic keys whenever (as long as they are from the same account).
- `KEY_PAIR` must be in JWK format. [Example generator](https://mkjwk.org/) (set to sign and RS256).
- `VITE_NAMESPACE` can be any string. A UUID v4 works well.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying

Out of the box, you can deploy this app to Netlify, just make sure to add the environment variables. If you change the adapter you should be able to deploy to any node-based platform (such as Vercel, but not Cloudflare Pages).
