---
title: "GrapheneOS Review"
description: "“Mistrust authority. Promote decentralization.” Steven Levy, Hackers I am a software engineer, so I should have known better than to install a new operating system on my phone. …"
pubDate: 2026-11-03
tags: ["security", "grapheneos", "technology", "review", "android"]
cover: "https://cdn-images-1.medium.com/max/1200/1*bRLh1tHs2_hawBwE7Ica8A.jpeg"
medium: "https://rendoire.medium.com/grapheneos-review-e3ceed6f53cf"
draft: false
---

> *“Mistrust authority. Promote decentralization.”  
> Steven Levy,* Hackers

I am a software engineer, so I should have known better than to install a new operating system on my phone. Instead I did it on purpose. A few months ago I flashed GrapheneOS onto a Pixel Fold, and my relationship with the thing in my pocket changed. It was not a smooth change. It was effort.

There is a phrase I keep coming back to: BYOS, Bring Your Own Services. A normal phone brings the services for you: wallet, maps, notifications, backups, identity. The trade is silent: you get convenience, and the OS gets a quiet look at everything you do.

GrapheneOS flips the deal. You bring your own services, one at a time. It is more work. It is also, strangely, the best part.

### What I like about it

GrapheneOS is fast and quiet. No carrier bloat, no preinstalled games, no app demanding a Google login before it opens. Battery life improved, and the phone feels like a tool again instead of a billboard. The security is real too: a locked bootloader, hardened memory protections, and Google Play services sandboxed so they can’t touch everything else. You can still run Google apps. They just stop being the centre of the phone.

### The hard parts

Then there are the hard parts. Notifications arrive late because they no longer ride Google’s push channel, so I get messages when the app checks rather than the instant a server pings me. A few banking apps refuse to run, because they check for a Google signature and treat its absence as proof the phone is compromised*(This can be bypassed by using a google play exploit)*. It is not. It is just not Google.

And then there is the big one: paying for things.

### Payments: the Curve discovery

Google Wallet will not do contactless on GrapheneOS.

The fix came from an unexpected place: Curve. It is a UK fintech wallet that sits on top of your existing cards, and it has its own contactless layer called Curve Pay. It does not demand Google Play Integrity, and it works on GrapheneOS. I installed it, added my cards, set it as the default payment app, and paid for a coffee with my phone for the first time in weeks.

### Maps: CoMaps and OpenStreetMap

Maps were the same story. I didnt want to use Google Maps, so I moved to CoMaps, a free and open source navigation app built on OpenStreetMap data. It is offline first, so I download a region once and it works without a signal, and it does not track me. The catch: the map is only as good as the people who maintain it, and now I am one of them. A café near me was missing its opening hours, so I opened the built in editor and added them.

This is the part I did not expect to enjoy. Google Maps is finished for you. Someone already did the work. CoMaps is unfinished, and that is the point. You get to help finish it.

### The invisible design

Don Norman wrote that good design is invisible. A normal phone is that design, polished until the effort disappears. You never see the work, because someone else did it, and in exchange you hand over the keys.

Tim Wu calls this the Cycle. In *The Master Switch* he traces how every information industry starts open, then consolidates, then gets disrupted. The smartphone is the latest loop, and the app store is the master switch. You do not own the platform. You rent a slot on it.

GrapheneOS is the disruption end of that cycle. It hands you the work back.

### Self-hosting made it smaller

I already self-host my notes and media on a homelab I run on Proxmox, with AdGuard blocking trackers and everything reachable over Tailscale. Leaving Google’s cloud was a step rather than a cliff. The phone was just the last device still renting someone else’s roof. I am still tinkering, and I doubt I ever stop.

### The human cost

The hardest part is not technical. It is my fiancée.

GrapheneOS is easy to use, right up until one of its small kinks lands on the person next to me. A photo that will not share the way she expects. The moment I suggest she install Signal instead of texting, I lose, because her answer never changes: “I am not downloading another app.”

She uses iMessage/RCS. Getting her onto anything else means asking her to download an app, and that is a non-starter. So we text the way she wants, and I make my peace with it. The point of a phone is to stay close to people, not to win an argument about messaging protocols. I am still waiting for the day she stops finding it annoying.

### What GrapheneOS is not

This is where most people get it wrong. GrapheneOS is not a purity test. You do not have to harden every surface. It is a spectrum. You choose what you are willing to sacrifice, and what is a necessity for your family. I run some Google services in a sandbox because my life is easier with them. I keep RCS because the person I love uses it. Security is not about refusing every compromise. It is about deciding which compromises are yours to make.

### Bring Your Own Services

Steven Levy called the hacker ethic “mistrust authority, promote decentralization.” That sounds like a slogan. It is actually a work ethic. Bring Your Own Services is not rage against the machine. It is knowing which parts of the machine you want to run yourself.

My phone is more annoying than it used to be. It is also more mine. Every app on it is there because I chose it, and I know why. The digital minimalism came free. When nothing installs itself and nothing pings for attention, the phone goes quiet, and the quiet is the point.

Bring Your Own Services sounds like a burden. It is. But it is the same burden as cooking your own food instead of eating whatever the platform hands you. It costs effort, and it tastes different.

### TL;DR

-   GrapheneOS is fast, quiet, and secure, with Google services sandboxed if you want them.
-   The cost is real: late notifications, banking apps that refuse to run, no Google Wallet.
-   Curve Pay fixed payments. CoMaps replaced Maps, and OpenStreetMap made me a contributor.
-   Self-hosting made the switch smaller. The phone was the last thing renting someone else’s roof.
-   It is not a purity test. You pick the sacrifices that make sense, and keep RCS for the person you love.

Would you try a de-Googled phone? What is the one app you could not leave behind?

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=e3ceed6f53cf)
