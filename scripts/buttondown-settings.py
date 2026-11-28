# Buttondown newsletter settings for rendoire, applied through the API.
#
# Usage: python3 scripts/buttondown-settings.py [--paid]
#   Reads the API key from ~/.config/buttondown/token (never commit the key).
#   Without --paid it applies what the free plan allows: identity, socials,
#   redirects, header and footer. With --paid (Standard plan or above) it also
#   applies the email/archive CSS and the custom confirmation and welcome emails.
import json, os, urllib.request, urllib.error
TOKEN = open(os.path.expanduser('~/.config/buttondown/token')).read().strip()
NID = 'news_1m90m9pw9d8cy9jwpc7w2fk9eh'
def api(method, path, body=None):
    req = urllib.request.Request('https://api.buttondown.com/v1' + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': f'Token {TOKEN}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r: return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e: return e.code, e.read().decode()[:800]

EMAIL_CSS = """
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1c1c1c; font-size: 17px; line-height: 1.7; }
h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; color: #0a0a0a; letter-spacing: -0.01em; line-height: 1.25; }
h1 { font-size: 30px; } h2 { font-size: 23px; margin-top: 32px; } h3 { font-size: 19px; }
a { color: #1d7f56; text-decoration: underline; text-underline-offset: 3px; }
strong { color: #0a0a0a; }
em { color: #333; }
blockquote { border-left: 3px solid #3ecf8e; margin: 24px 0; padding: 2px 0 2px 18px; color: #444; font-style: italic; }
img { max-width: 100%; height: auto; border-radius: 6px; }
hr { border: 0; border-top: 1px solid #e4e4e4; margin: 32px 0; }
code { font-family: 'IBM Plex Mono', Menlo, Consolas, monospace; font-size: 0.9em; background: #f2f2f2; padding: 1px 5px; border-radius: 3px; }
.rendoire-kicker { font-family: 'IBM Plex Mono', Menlo, Consolas, monospace; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #1d7f56; margin: 0 0 4px; }
.rendoire-kicker strong { color: #0a0a0a; font-weight: 600; letter-spacing: 0.02em; text-transform: none; font-family: Georgia, serif; font-size: 18px; }
.rendoire-footer { font-size: 14px; color: #666; }
"""

WEB_CSS = """
@font-face { font-family: 'Fraunces'; src: url('https://rendoire.com/fonts/fraunces.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
@font-face { font-family: 'Geist'; src: url('https://rendoire.com/fonts/geist.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
:root, :root.dark, :root.supports-dark-mode {
  --font-accent: 'Fraunces', Georgia, serif;
  --font-body: 'Geist', system-ui, sans-serif;
  --color-accent: #3ecf8e;
  --color-background: #0a0a0a;
  --color-background-card: #101010;
  --color-background-offset: #1c1c1c;
  --color-foreground: #d6d6d6;
  --color-foreground-offset: #b0b0b0;
  --color-foreground-offset-2: #8f8f8f;
  --color-action: #3ecf8e;
  --pattern-color: rgba(255, 255, 255, 0.03);
}
body { background: #0a0a0a; }
h1, h2, h3, .newsletter-name, .header-brand-name { font-family: 'Fraunces', Georgia, serif; color: #ececec; letter-spacing: -0.01em; }
a { color: #3ecf8e; }
.archive__button, .button.tinted { background: #3ecf8e !important; color: #0a0a0a !important; border: none; }
.archive__input, input[type=email] { background: #0a0a0a !important; color: #ececec !important; border: 1px solid rgba(255,255,255,0.18) !important; }
"""

HEADER = '<p class="rendoire-kicker"><strong>rendoire</strong> &nbsp;·&nbsp; essays by Ry Henderson</p>'
FOOTER = ('<hr><p class="rendoire-footer">You are getting this because you subscribed at '
          '<a href="https://rendoire.com">rendoire.com</a>. Hit reply any time: replies come straight to me.</p>'
          '<p class="rendoire-footer"><a href="https://rendoire.com/start/">Start here</a> &nbsp;·&nbsp; '
          '<a href="https://rendoire.com/blog/">All essays</a> &nbsp;·&nbsp; <a href="https://rendoire.com/feed.xml">RSS</a></p>')

CONFIRM_TEXT = ('<p>Hi,</p>'
  '<p>Thanks for signing up to rendoire. One click and you are in:</p>'
  '<p><a href="{{ confirmation_url }}"><strong>Yes, send me new essays</strong></a></p>'
  '<p>If you did not sign up, ignore this email and you will not hear from me again.</p>'
  '<p>Ry</p>')

WELCOME_TEXT = ("Hi,\n\nYou're in. Thanks for subscribing.\n\n"
  "Here's the deal. When I publish a new essay on [rendoire.com](https://rendoire.com), it lands in your inbox the same day, in full. "
  "Nothing else: no promotions, no tracking pixels on the site, and one click to leave whenever you like.\n\n"
  "I write about two things. What happens when AI meets a real organisation, and running more of my own technology instead of renting it. "
  "If you only have time for three, start with these:\n\n"
  "- [The Models Were the Easy Part](https://rendoire.com/blog/the-models-were-the-easy-part/): why most AI pilots stall, and it's not the models.\n"
  "- [The Safety Was Never in the Model](https://rendoire.com/blog/the-safety-was-never-in-the-model/): why guardrails have to be yours.\n"
  "- [I Just Broke My Kindle & It Got Way Better](https://rendoire.com/blog/i-just-broke-my-kindle-and-it-got-way-better/): a 2013 Paperwhite with no Amazon account.\n\n"
  "And if anything I write makes you disagree, or reminds you of something you've seen, just hit reply. Replies come straight to me.\n\nRy")

settings = {
  'name': 'rendoire',
  'description': 'Essays by Ry Henderson on putting AI to work in the real world, and on owning your own technology. Each new essay, straight to your inbox.',
  'from_name': 'Ry Henderson',
  'locale': 'en-GB',
  'timezone': 'Europe/London',
  'template': 'modern',
  'tint_color': '#1d7f56',
  'archive_theme': 'modern',
  'icon': 'https://rendoire.com/apple-touch-icon.png',
  'icon_alt_text': 'rendoire',
  'image': 'https://rendoire.com/og-image.png',
  'socials': [
    {'type': 'generic', 'url': 'https://rendoire.com', 'label': 'rendoire.com'},
    {'type': 'linkedin', 'url': 'https://www.linkedin.com/in/rhenderson832/'},
    {'type': 'github', 'url': 'https://github.com/rhenpri'},
    {'type': 'medium', 'url': 'https://rendoire.medium.com'},
    {'type': 'youtube', 'url': 'https://www.youtube.com/@rendoire'},
    {'type': 'instagram', 'url': 'https://instagram.com/rendoire'},
  ],
  'subscription_redirect_url': 'https://rendoire.com/subscribed/',
  'subscription_confirmation_redirect_url': 'https://rendoire.com/welcome/',
  'custom_subscription_confirmation_email_subject': 'Confirm your subscription to rendoire',
  'custom_subscription_confirmation_email_text': CONFIRM_TEXT,
  'custom_subscription_confirmed_email_subject': "You're in",
  'custom_subscription_confirmed_email_text': WELCOME_TEXT,
  'header': HEADER,
  'footer': FOOTER,
}

FREE = ['name','description','from_name','locale','timezone','template','tint_color','archive_theme','icon','icon_alt_text','image',
        'socials','subscription_redirect_url','subscription_confirmation_redirect_url','header','footer']
PAID = ['custom_subscription_confirmation_email_subject','custom_subscription_confirmation_email_text',
        'custom_subscription_confirmed_email_subject','custom_subscription_confirmed_email_text']

if __name__ == '__main__':
    import sys
    body = {k: settings[k] for k in FREE}
    if '--paid' in sys.argv:
        body.update({k: settings[k] for k in PAID})
        body['css'] = EMAIL_CSS.strip()
        body['web_css'] = WEB_CSS.strip()
    code, res = api('PATCH', f'/newsletters/{NID}', body)
    print('PATCH newsletter:', code, '' if code < 300 else res)
