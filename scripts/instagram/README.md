# Blog post to Instagram

Every new post on rendoire.com gets an Instagram **carousel** (up to 10 slides, 4:5) and a **reel** (9:16, about 40 seconds, animated), drawn in the site's own style: Fraunces, Geist, Plex Mono, the green and lavender, the dot grid.

```
push a new post to main
  -> deploy.yml notices the new file, renders slides + reel with headless Chromium
  -> the files ship with the site at rendoire.com/ig/<slug>/
  -> instagram.yml waits until they are live, then publishes through the Instagram API
```

Nothing posts until you set the secrets and the `IG_AUTOPUBLISH` variable. Until then each new post just leaves a draft (contact sheet, slides, reel, captions) in the **ig-out** artifact of its deploy run.

## Look at one locally

```bash
export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"
npm run ig -- <slug>                  # carousel + reel
npm run ig -- <slug> --no-reel        # stills only, takes a couple of seconds
npm run ig -- <slug> --no-ai          # never call the AI copywriter
```

Output goes to `.instagram/<slug>/`: `slide-01.jpg` ..., `reel.mp4`, `caption.txt`, `reel-caption.txt`, `preview.jpg` (every slide on one sheet).
First time only: `npx playwright-core install chromium`. `ffmpeg` must be on the PATH.

## Where the copy comes from

In order of preference:

1. **`instagram:` frontmatter** in the post, hand written. Full control. See `i-just-broke-my-kindle-and-it-got-way-better.md` for an example with every slide type.
2. **AI**, if the `ANTHROPIC_API_KEY` secret is set. Claude writes the slides and caption in your voice (UK spelling, no em dashes, no hype) from the post text. If the call fails it falls back to 3.
3. **Automatic**, no AI. One slide per section: bold-led lists become list slides, numbered bold paragraphs become step slides, a section with an image gets a picture, everything else gets its opening sentences. It skips Links and Credits sections and keeps the best 8.

Frontmatter fields (all optional):

```yaml
instagram:
  skip: true                 # do not post this one
  kicker: "Kindle hacking"   # small label on the cover
  emphasis: "It Got Way Better"  # part of the title set in italic lavender
  coverImage: "../../assets/blog/<slug>/photo.webp"   # default: the post's cover
  coverFocus: "85% 50%"      # crop focus for the cover image
  slides:                    # replaces the automatic slides (cover and last slide are added for you)
    - { type: text,  heading: "...", body: "Short copy with **one bold phrase**.", image: "../../assets/..." }
    - { type: list,  heading: "...", items: [{ lead: "...", text: "..." }] }
    - { type: steps, heading: "...", items: [{ n: 1, title: "...", text: "..." }] }
    - { type: quote, text: "...", heading: "who said it" }
  caption: |
    ...
  reelCaption: |
    ...
  hashtags: [kindle, koreader]   # used when the caption is generated
```

House rules are enforced in code: em and en dashes are replaced, captions are capped at 2,200 characters, carousels at 10 slides.

## One-time setup to let it post

1. The Instagram account must be a **Professional** account (Creator or Business). Settings, Account type and tools.
2. Go to <https://developers.facebook.com>, create an app, add the **Instagram API with Instagram Login** product. Add your account as an Instagram tester and accept the invite in the Instagram app (Settings, Website permissions, Tester invites).
3. In the app dashboard, Instagram API setup, **Generate access token** for your account with `instagram_business_basic` and `instagram_business_content_publish`. While the app is in development mode you can post to your own account without app review.
4. In GitHub, Settings, Secrets and variables, Actions:

   | Kind | Name | Value |
   |---|---|---|
   | Secret | `IG_ACCESS_TOKEN` | the token from step 3 |
   | Variable | `IG_AUTOPUBLISH` | `true` |
   | Variable | `IG_FORMATS` | optional, `carousel,reel` (default) or just one |
   | Secret | `ANTHROPIC_API_KEY` | optional, turns on the AI copywriter |
   | Secret | `IG_SECRETS_PAT` | optional, a fine-grained token with Secrets write access, so the monthly job can store the refreshed Instagram token |
   | Variable | `IG_ENABLED` | set to `false` to switch the whole pipeline off |

   A token from a Facebook Login app (Page linked account) also works: set the `IG_API_BASE` variable to `https://graph.facebook.com/v23.0` and add the `IG_USER_ID` secret.
5. Tokens last **60 days**. `instagram-token.yml` refreshes it on the 1st of each month if `IG_SECRETS_PAT` is set. Otherwise run `IG_ACCESS_TOKEN=... node scripts/instagram/refresh-token.mjs` yourself.

## Posting an older post, or re-posting

GitHub, Actions, **Deploy to GitHub Pages**, Run workflow: fill in `ig_slug` (and tick `ig_publish` to post even if `IG_AUTOPUBLISH` is off). Publishing checks your recent posts for the post's link first, so a re-run never double posts.

## Limits worth knowing

- Instagram downloads the media from a public URL, which is why the files ship with the site first. Posting waits until they are live.
- API posts are limited to 100 per 24 hours and carousels to 10 slides. Reels need 9:16 H.264 video, which this produces.
- The reel is silent. The API cannot attach Instagram's music library. If you want audio, post the reel from the app instead.
- Captions cannot contain clickable links, so they say "link in bio".
