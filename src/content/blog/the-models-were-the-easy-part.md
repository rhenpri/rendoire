---
title: "The Models Were the Easy Part"
description: "Ninety two and ninety five In September 2023 I submitted a dissertation on how AI would reshape cognitive productivity in consulting. ChatGPT was ten months old. I surveyed acro…"
pubDate: 2026-07-01
tags: ["ai-development", "artificial-intelligence", "future-technology", "ai-engineering", "business-technology"]
cover: "https://cdn-images-1.medium.com/max/1200/1*-WWKDoyOyVftUIqUTDrLig.jpeg"
medium: "https://rendoire.medium.com/the-models-were-the-easy-part-e3ad0f90a988"
draft: false
---

### **Ninety two and ninety five**

In September 2023 I submitted a dissertation on how AI would reshape cognitive productivity in consulting. ChatGPT was ten months old. I surveyed across the industry and 92% of their orgs were already pouring money and resource into AI. Everyone could feel it coming.

Two years later, MIT published the other number. Across 300 enterprise deployments and 150 executive interviews, 95% of generative AI pilots delivered no measurable impact on the profit and loss. Thirty to forty billion dollars in. Roughly nothing out.

Nearly every firm invested. Nearly every pilot stalled. Those two numbers, three years apart, are the whole story of enterprise AI so far.

The MIT study has its critics and the headline is harsher than the detail. But the detail is the interesting bit, because the researchers were explicit about the cause. It was not model quality. The pilots died in the layer between the model and the business: tools that dazzle in a demo, then cannot retain context, cannot learn from feedback, cannot plug into the systems where the work actually lives.

Meanwhile around 90% of employees were quietly using consumer AI at work anyway, sanctioned or not. The demand is real. The stack is the problem.

### What the dissertation got wrong

My dissertation asked whether the models would be good enough. They are.

What I underestimated was everything around the model. I wrote about co-pilots and productivity and burnout, and treated integration as a detail somebody else would sort out. Three years of building and teaching this technology have taught me the opposite. The model is the smallest problem in the room. The method is the whole game.

We have been here before. The last time an industry had this exact problem, it burned a few hundred billion dollars finding the answer.

### Been there, done that

In 1999 everyone knew the internet would change commerce. Nobody agreed on how. So capital flooded into a thousand bespoke answers to the same question, each with its own proprietary route to market. Pets.com put a sock puppet in the Super Bowl, raised $82 million in its IPO, and was gone nine months later. It had plenty of company.

What ended the chaos was not a better website. It was agreement, and most of it was free.

Tim Berners-Lee convinced CERN to release the web royalty free in 1993. The W3C formed the following year to stop HTML and HTTP fragmenting into vendor dialects. TCP/IP was already underneath, unglamorous and universal. Once the how was settled, building on the web stopped being an act of invention and became an act of engineering. Value stopped leaking into duplicated effort and started compounding.

Amazon did not win the dot com era with a proprietary internet. It won by executing relentlessly on the same open standards available to everyone else. The bubble popped in 2000. The web kept compounding. The survivors were the companies building on the standard, not the ones trying to be it.

### The gauge war

This pattern is older than the web, and the older versions are more instructive because the stakes were physical.

In the 1840s, Britain’s railways ran on two incompatible track widths. Brunel’s Great Western used broad gauge. Almost everyone else used Stephenson’s standard. Where the two met, at stations like Gloucester, every passenger got off one train and walked to another: luggage lost, cargo damaged, hours wasted, because two engineering cultures could not agree on how far apart to put the rails. Parliament eventually had to legislate a winner.

That is what the absence of a standard costs. Not drama. Friction. Thousands of small invisible taxes paid at every boundary where one system meets another.

A standard removes the tax. The standard does not even need to be the best option. Betamax was arguably the better tape and lost to VHS anyway, because the ecosystem picked a lane, and the ecosystem is what matters.

### Brilliant engines, no chassis

Inside most large organisations the AI stack currently looks like this. Frontier models from OpenAI, Anthropic and Google at the top. Business systems full of valuable context at the bottom. And in between, a layer of hand-rolled glue: duct-taped retrieval pipelines, unaudited connectors, and pilots that each solved the same integration problem in a slightly different, slightly undocumented way.

That middle layer is where the 95% dies. It is also where the security risk concentrates. Every bespoke connector is an attack surface nobody has properly reviewed, built under deadline by a team chasing the next capability before the last one was made safe. The shiny object does not just waste money. It accumulates risk.

Fred Brooks said in 1986. There is no silver bullet, no single technology that delivers an order of magnitude improvement on its own, and anyone selling you one is selling you next quarter’s orphaned pilot. In AI Engineering: the model is one box in a much larger system diagram, and the larger diagram is the product.

### The HTTP moment might be happening

In November 2024 Anthropic released the Model Context Protocol, an open standard for connecting AI systems to tools and data. A common plug, so that every team stops soldering its own. Four months later OpenAI adopted its rival’s protocol outright. Google, Microsoft and AWS followed. In December 2025 Anthropic donated it to a foundation under the Linux Foundation, the neutral home that stewards Kubernetes, co-founded with OpenAI and Block.

HTTP took most of the 1990s to reach that kind of cross-vendor consensus. MCP did it in sixteen months, because everyone in the room had lived through the alternative.

Watch what happened once the protocol settled. Nobody debates how to connect a model to a database anymore. The energy moved up the stack, to what you build with the connection. That is what standards do. They do not constrain innovation. They relocate it to where the value is.

But a protocol is not a method. MCP standardises the wire. It does not standardise how you decide what to build, how you evaluate whether it worked, how you architect for failure, or what your policy is when the agent does something you did not expect. That layer, the development method, the reference architectures, the evaluation discipline, is still being reinvented one organisation at a time.

### Working on the answer

The question I get most is not how does it work. It is what should we actually build. That question has no standard answer yet, and the honest response is uncomfortable: until an organisation can say what outcome it is buying and how it will measure it, it is not running an AI programme. It is collecting pilots.

The honest conversation about capability matters just as much. These systems are exceptional at some things and confidently wrong at others, and most teams that will not say the second half out loud will keep signing off projects designed around the marketing rather than the technology. Transparency between the people building this and the people buying it is the only way to know whether you are creating value or reinventing a wheel someone has already standardised.

And while the method layer stalls, the ground underneath it is moving.

### The compute is coming home

Intelligence is getting cheap, and it is moving to the edge.

Open-weight models, openly published models you can download and run on your own hardware, now do real workhorse tasks in the four to eight billion parameter range: summarising, drafting, and retrieval over your own data. Not frontier work. The routine volume that makes up most of what organisations actually need. And they run on machines you already own. The same force that pushed computing from mainframes to PCs to phones is now pushing inference out of the data centre and onto the device.

For an enterprise, this reframes the cost conversation. Not every workload needs a frontier model over an API. A significant slice of the routine work can run on small models on infrastructure you control, which means predictable cost instead of a metered bill, and sensitive data that never leaves the building. That last part quietly dissolves half the governance objections that stall pilots in regulated environments. Keep the frontier models for work that genuinely needs frontier reasoning. Route the rest local.

For individuals, the implication is more personal. The tools that matter are no longer gated behind a subscription and someone else’s terms of service. Private, local, and free is now a real configuration, not a hobbyist’s compromise.

The discipline that makes either version work is the one this whole essay argues for. Pick a small core set of tools and learn them properly, instead of chasing every launch. The person who has mastered one local model, one automation layer and one standard protocol will outbuild the person with forty browser tabs of hype every time. Shiny object syndrome scales down as well as up.

### Proof at kitchen-table

I know the local version works because I run it.

At home, old compute running, small open-weight models handle chat, summarisation and retrieval your own knowledge. A local coding agent works on projects. An automation layer watches for events and handles the infrastructure. The pieces talk to each other over MCP, the same open protocol the enterprises are converging on.

The compute bill is the electricity.

Is it fast? No. And that constraint turns out to be the best AI education you can have. When you cannot hide behind a frontier model’s brute intelligence, you learn what actually matters: which tasks genuinely need a big model, how retrieval quality changes everything, where small models fail and how to design around it. The constraint teaches the architecture. If a workflow holds up at seven tokens a second on a nine-year-old processor, it will fly in production.

This is the same lesson at every scale. A decade-old desktop running open models over an open protocol is the enterprise reference architecture in miniature. Models, retrieval, agents, automation, monitoring. Anyone can build it for the price of a second-hand office PC, and everything it teaches transfers directly to systems that serve thousands of users. You do not need a lab budget to learn this properly anymore. You need a spare weekend and a willingness to be bored by the right things.

### This is a boardroom decision

The missing layer is not an engineering problem. Engineers converge on standards naturally when they are allowed to. The reinvention of the wheel is justified elsewhere.

So the fix sits above the engineering too. Adopt the open standards instead of tolerating proprietary snowflakes. Demand reference architectures instead of hero builds. Fund evaluation the way you fund development, because a capability you cannot measure is a liability you have chosen not to look at.

There is a deadline on this, The Master Switch traces the same cycle through every information industry of the last century: radio, telephony, film, television. Each began open and chaotic, and each was eventually consolidated by whoever controlled the choke point, on their terms. The open phase does not last. If organisations spend it building snowflakes instead of backing open standards, the standardisation will still happen. It will just be done to them, by a vendor, with the lock-in priced accordingly.

The dot com survivors understood this instinctively. The AI winners will too.

### The sequel

My dissertation asked whether AI would make us more productive. Wrong question, or at least a premature one. The models were always going to be good enough.

The protocol layer settled faster than anyone expected. The compute is already migrating to wherever it is cheapest to run, including the desk in your spare room. The method layer is the one still up for grabs, and every month it stays unsettled, another few billion goes into pilots & tokens that were dead before they were greenlight.

Ninety two percent of orgs were investing before the technology had even matured. Powered by marketing. Ninety five percent of pilots returned nothing. The gap between those numbers is not a technology gap.

The models were the easy part. Agreement is the product.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=e3ad0f90a988)
