---
title: "The Prompt Whisperer"
seoTitle: "The Prompt Whisperer: Dyslexic Thinking and AI Engineering"
description: "A sequel to Think Different. Prompting a language model is a systems problem, not a writing one, and that is exactly the kind of problem dyslexic thinking is built for. Mostly."
pubDate: 2026-11-28
tags: ["ai", "neurodiversity"]
cover: "../../assets/blog/the-prompt-whisperer/cover.webp"
draft: true
---

*A sequel to [Think Different](/blog/think-different-the-dyslexic-advantage-in-systems-thinking/). More specific this time, and more honest about where the advantage runs out.*

## Three framings before one word

Watch most people write a prompt and it goes in a line. Write what you want. See what comes back. Tweak the wording. Repeat. Clean, logical, and it works.

I come at it from the other end.

Before I type anything, I am already picturing what the answer has to look like. I am guessing which part of my instruction the model will grab instead of the part I care about. I am holding two or three ways of framing the whole thing at once. I am not doing this on purpose. It is just where my head goes.

For a long time I assumed it was a habit I had picked up. Then I went back to the research I wrote about in my first essay on dyslexia, and it stopped looking like a coincidence.

## Not a writing problem

Most prompting advice is about wording. Which phrases to use. How to ask the model to think step by step. Little tricks.

That is the surface. Underneath, prompting is a systems problem. You are dealing with something that has habits, blind spots and biases, and you cannot read its source code. **The job is not writing a good sentence. It is predicting how a black box will misread you.**

To do that you have to hold a lot at once. What the model is likely to take from your words. What shape of answer you actually need. Where it is confident and right, and where it is confident and wrong. How to lay out the context so it reads as signal, not noise.

That is not step-by-step reasoning. It is whole-system thinking, under uncertainty, about something that gives a different answer every time you ask.

## Built for exploring

Dr Helen Taylor at the University of Cambridge has argued that dyslexia is better understood as a specialisation in exploration than as a disorder. Her 2022 paper with Martin Vestergaard makes the case that dyslexic minds are tuned for searching the unknown: spotting patterns, seeing the big picture, working in conditions that keep changing. Not for rapidly processing predictable, rule-bound things. Like text.

And it is not just a set of learned workarounds. Researchers at MIT have found differences in brain structure in children at risk of dyslexia before they had even started learning to read.

Large language models are about as far from predictable and rule-bound as software gets. Same prompt, two runs, two answers. Reliable here, quietly wrong there. You cannot command them. You have to get a feel for them.

## Three habits

**Design the answer first.** The research describes dyslexic thinkers seeing the whole before the parts. So the first thing I write is not the instruction. It is the shape of the answer: the fields, the order, what "I don't have enough to go on" looks like. Then I write the instruction that produces it. In live service work we call that an output contract, and every operational prompt I write starts with one. A model told exactly what shape to fill is far more reliable than one told to be "detailed".

**Plan for failure first.** Before anything else, I ask what happens when the model does not know. Left alone, it invents a plausible answer, which in operations means a confident runbook step that does not exist. So one of the first lines I write is the exit: if nothing matches, say "not covered" and point to who to ask. It is the most important line in any operational prompt. It comes from always thinking about the edge of a system before its middle.

**Keep several answers alive.** I do not ask a model for *the* cause of a problem. I ask for up to three likely causes, ranked, with the evidence that would prove or rule out each one. It is a better prompt, because it turns a guess into a plan an engineer can work through. But it is also just how I think. Several explanations at once. Models, it turns out, do better work when you ask them to think that way too.

None of these are secret techniques. Other people get there by trial and error. **I got there before the errors.**

## When the superpower bites back

This is where I part ways with the "dyslexia is a superpower" essays that end on a high.

Thinking about everything at once is great when a problem needs complexity held in your head. It is a liability when the problem needs simplicity.

The best prompts are usually direct. One task. One format. Little room to interpret. My instinct is to front-load context, predict every failure, cover every edge case. The result is a prompt that is sophisticated and too complicated for the model to follow. It tries to honour everything and does none of it well.

Chip Huyen gives the cure in *AI Engineering*: break complex tasks into simpler steps, each with its own prompt, chained together. In her example, a customer support bot first works out what the customer wants, and only then answers. It is the opposite of my instinct, and it works better. She also cites research showing models follow instructions at the start and end of a prompt far better than ones buried in the middle. Which is exactly where my seventh caveat ends up.

So I have had to learn to override myself. Simple version first. Add complexity only when it fails, and only enough to fix that one failure.

I am also slower than plenty of colleagues at plenty of things. Long sequential work. Dense documents without visual structure. Anything that rewards reading fast and precisely. The advantage is real, but it is narrow.

## One different mind per team

The practical point is not "hire more dyslexic engineers", though I would not argue. It is about how teams get built.

Most AI teams aim for one way of doing things. One prompting style, one evaluation approach, one shared idea of good. That makes review easier. But the systems you are probing are not uniform, and their failures are surprising by definition. **A team where people think differently finds different failures.** That is a kind of robustness a uniform team cannot copy.

The people who catch what everyone else misses are not always the most qualified in the room. They are the ones who see the problem differently, expect it to break, and distrust any answer that looks too clean.

## The honest version

I am not claiming dyslexia makes me a better AI engineer across the board. I am claiming something narrower. The particular demands of this work, systems that are ambiguous, probabilistic and wrong in unexpected ways, suit a way of thinking that spent most of its history being called a deficit.

For most of school, the work did not fit my mind, and I learned to work around myself. College, and then work, was where it clicked. AI made it click harder. The job is now to picture the whole system, expect it to fail and hold several answers at once. I have always worked that way.

The work has finally caught up with the way I think. I would like the next dyslexic kid who is told they are behind to hear that early, not years later.

---

*Further reading: Helen Taylor and Martin D. Vestergaard, ["Developmental Dyslexia: Disorder or Specialization in Exploration?"](https://www.frontiersin.org/articles/10.3389/fpsyg.2022.889245/full), Frontiers in Psychology (2022). Chip Huyen, AI Engineering (O'Reilly, 2025), chapter 5. Daniel Kahneman, Thinking, Fast and Slow (2011).*
