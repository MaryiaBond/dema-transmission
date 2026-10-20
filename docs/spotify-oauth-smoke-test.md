# Spotify OAuth smoke test

## Environment

Create `.env.local` from `.env.example`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Restart Vite after changing environment variables. Do not put the Spotify Client Secret or any Supabase secret/service-role key in a `VITE_*` variable.

## Dashboard checklist

1. Supabase Authentication → Providers → Spotify is enabled with the Spotify Client ID and Client Secret.
2. Spotify Dashboard contains the Supabase callback URL shown by the provider settings, normally `https://PROJECT_REF.supabase.co/auth/v1/callback`.
3. Supabase Authentication → URL Configuration contains the exact application origins used for testing, for example `http://localhost:5173` and the production origin.
4. The Spotify test account is eligible for the current Development Mode application.

## Manual flow

1. Run `npm run dev` and open the exact allowed origin.
2. Scroll to `OBTAIN CITIZENSHIP` and start sign-in.
3. Confirm that Spotify opens with only the `user-read-recently-played` permission requested.
4. Complete consent and confirm that the browser returns to THE OUTSIDE.
5. Verify the compact panel: display name/avatar when Spotify supplies them, Supabase user ID, `CONFIRMED`, and `SIGN OUT`.
6. Reload the page and verify that the same Supabase session is restored.
7. Sign out and verify that the guest invitation returns while the story remains available.
8. Deny consent once and verify the localized OAuth error without console token output.

Spotify may omit email. The implementation never uses email as a required profile field and never invents one.

References: [Supabase Spotify login](https://supabase.com/docs/guides/auth/social-login/auth-spotify), [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
