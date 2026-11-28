---
title: "Nobody Budgets for Evals"
description: "Medicines are watched for side effects for years after approval. Most AI features get one good demo and then nobody looks again."
pubDate: 2026-11-28T12:30:00Z
tags: ["ai", "software"]
series: the-layer
cover: "../../assets/blog/nobody-budgets-for-evals/cover.webp"
draft: false
---

*A medicine is not finished when it is approved. It is watched for years afterwards. Most AI features get one good demo, and then nobody looks again.*

## The yellow card

In 1964, in the shadow of thalidomide, the UK set up the Yellow Card scheme. Any doctor who suspected a medicine had harmed someone could fill in a card and post it. It still runs. These days anyone can report.

The idea behind it is worth stealing. **Approval is not proof that something is safe.** It is proof that it looked safe, under test conditions, on the people who were tested. The real evidence arrives afterwards, from millions of uses nobody designed a trial for.

AI features skip that second half. There is a pilot, a demo and a slide with a satisfying percentage on it. Then the feature goes live and the measuring stops. Nobody budgeted for it, because nobody thought of it as a cost.

Earlier in this series I wrote about an MIT study finding 95% of generative AI pilots delivered no measurable impact. Read that again with the stress on *measurable*. Plenty of those pilots never had a way to measure anything.

## Read the thing

Before dashboards and scores, there is a step most teams skip because it feels too simple. Read the output. Not a chart of it. The actual answers, one at a time.

Shreya Shankar and Hamel Husain build their book *Evals for AI Engineers* on this. They call it error analysis. Take a sample of real conversations. Read each one. Write down, in plain words, what went wrong. Only then group the notes into types of failure and count them. Do it two or three times, because the first pass always misses things.

Two of their rules changed how I think about scoring.

First, make a yes-or-no call on each example. Acceptable or not. Not a score out of five. People argue forever about whether something is a three or a four. They agree far more often on whether it failed. Picking a side also forces you to decide what you actually mean by good.

Second, your idea of good will change, and that is fine. They call it criteria drift. The more examples you read, the sharper your standards get. Notion, one of their examples, runs evaluations across around seventy engineers and has a team whose whole job is to write down what good looks like for each AI feature. **If your definition of good has not changed since launch, you have probably stopped reading.**

## Three layers

When teams do measure, they usually measure whatever is easiest to reach.

There are three layers. Components: does retrieval find the right document, is the answer faithful to it, is the format right? Operations: what does each run cost, how many steps does it take, how often does a human step in? Outcomes: is the service actually better? Faster fixes, fewer repeat problems, less soul-destroying work.

![Three stacked layers of AI evaluation, widening downwards: Components (retrieval, faithfulness, format), Operations (cost per run, steps, human interventions) and Outcomes (faster fixes, fewer repeat problems, less toil). The outcomes layer is outlined in green and labelled as the one leadership pays for.](../../assets/blog/nobody-budgets-for-evals/three-layers.webp)

Engineers measure the first because it is interesting. Platform teams measure the second because it is on a dashboard. Leadership only ever pays for the third. **If your evaluation stops at "the answers look good", you have measured a component and called it a result.**

Watch for the vanity numbers. "Suggestions accepted": accepted, and then what? "Tickets touched by AI": touching is not helping. "Tokens saved": against what? And the satisfaction survey taken three weeks after launch, which mostly measures whether people like new things.

## Measure before you switch it on

The most valuable thing you can do costs nothing but patience. Measure the service before the AI arrives.

Four weeks is my minimum. Measure per type of problem, not in total, because totals lie. One bad month of volume and your averages tell you a story that is not true. Rates per type of problem do not.

Then fix your definitions and guard them. The quiet way AI projects inflate their results is by changing what counts as "resolved" after the tool turns up. If it meant a ticket closed and still closed a week later, it keeps meaning that.

If you can, start in shadow mode. The AI produces its answer, the people do the work the way they always have, and you compare. A clean before and after, and nobody's service at risk while you learn.

## Who judges the judge

Automated scoring is how evaluation scales. These days that usually means another model marking the first model's homework against a rubric. Useful. Also flawed in predictable ways.

Chip Huyen lists some in *AI Engineering*. Judge models tend to prefer whichever answer they read first. They tend to rate longer answers higher, whether or not the length helps.

So once a month, take a small random sample of real outputs and have a person mark them against the same short rubric: correct, safe, cited, useful. Compare the human marks with the machine's. When they drift apart, fix the judge first.

Shankar and Husain add two rules I now treat as non-negotiable. Test the judge against human-labelled examples it has never seen, so you know how often it is right. And pin the exact model version it runs on. Point it at a general alias and the provider can swap the model underneath you. **Your scores change overnight and nothing on your side did.**

## One page, one rule

All of this should fit on one page per feature, once a month. The outcomes against the baseline. The quality trend from the human samples. The cost per problem solved, not per call. Any change in what the AI is trusted to do, with the evidence.

![A mock one-page monthly scorecard for an AI feature, with illustrative numbers: time to first correct action down from 25 to 9 minutes against baseline, human-sampled quality at 94 percent, cost per problem solved 18 pence, incidents caused by the AI zero, and one autonomy change with evidence.](../../assets/blog/nobody-budgets-for-evals/one-page-scorecard.webp)

And one line that makes the whole page honest: **incidents the AI caused or made worse.** It should say zero, or explain why not. A scorecard that only reports wins is a brochure. Put the harms next to the wins and people start believing both.

## The cost of not counting

Here is why nobody budgets for this. In the business case, evaluation looks like overhead. Weeks of measuring before launch. Monthly reviews forever. Someone's time spent reading answers that are probably fine.

But that overhead is the product. Without it you cannot say the feature works, cannot tell when it stops, and cannot defend the money when someone asks. And the baseline you need most is the one you can only capture before you start.

Medicine learned this the hard way. The yellow card exists because approval was once treated as the end of the story.

We do not need our own thalidomide to learn it. We just need to keep reading after the demo.

---

*Further reading: Shreya Shankar and Hamel Husain, Evals for AI Engineers (O'Reilly, early release). Chip Huyen, AI Engineering (O'Reilly, 2025), chapters 3 and 4. Nicole Forsgren, Jez Humble and Gene Kim, Accelerate (IT Revolution, 2018). MHRA, [Yellow Card scheme](https://yellowcard.mhra.gov.uk/).*
