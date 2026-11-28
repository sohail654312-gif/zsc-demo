# ZSC free hosting
1. Sign in at https://app.netlify.com/start using GitHub. Choose Free, do not enable paid upgrades or auto-recharge.
2. Import sohail654312-gif/zsc-demo. Production branch: main. Build and publish are configured in netlify.toml.
3. Choose an available site name (for example zia-saria). Netlify provides an HTTPS netlify.app subdomain.
4. After deployment, verify the live homepage, six WebP assets, language switch, historical price board and WhatsApp quote. The build rewrites the canonical, structured data, sitemap and social URLs to Netlify's actual URL. Preview builds are noindex.
5. Verify the new URL-prefix property in Google Search Console and submit its sitemap. The previous host's verification tag is intentionally not copied. If the site name changes, redeploy so the canonical and sitemap reflect the new hostname.
6. Only after verification update the Google Business Profile website link. An owned custom domain can be attached later; domain registration is not included in free hosting. For a later custom domain set ZSC_SITE_URL to the final HTTPS origin and redeploy.

Weekly pricing remains historical and local estimates are labelled as unverified. Do not publish today's price; use the existing quotation CTA. GitHub remains source control, not the production commercial host.
