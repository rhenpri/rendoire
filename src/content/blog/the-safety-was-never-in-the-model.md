---
title: "The Safety Was Never in the Model"
description: "It took ninety minutes to strip the guardrails off Google's newest open model. If you deploy AI for a living, that number should change how you sign things off."
summary: "Safety training does not change what a language model can do. It adds a removable bias towards refusal, and free tools now strip it from open models in minutes. If you deploy AI in a real organisation, treat guardrails as architecture you own, not a property you bought with the model."
pubDate: 2026-11-28
tags: ["ai", "software"]
series: the-layer
cover: "../../assets/blog/the-safety-was-never-in-the-model/cover.webp"
draft: false
---

*It took ninety minutes to strip the guardrails off Google's newest open model. If you deploy AI for a living, that number should change how you sign things off.*

## Ninety minutes

When Google released Gemma 4 this year, the developer of a free tool called Heretic says he had its safety guardrails off within ninety minutes of the weights going public.

Meta's Llama 3.3 took less time. A Financial Times journalist did it in under ten minutes, on a standard laptop with no specialist hardware, as part of a joint investigation with the AI safety group Alice published on 25 May. The stripped models answered questions the originals refused, including how to disperse chemical agents.

This was not a clever exploit or an inside job. It was Heretic, free on GitHub, run with a few lines of code. Its creator says it has produced more than 3,500 decensored models, downloaded 13 million times between them.

The reflex is to read this as a story about bad actors and irresponsible tools. It is not. It is a story about what safety actually is inside these systems, and the answer should bother anyone who builds with them.

## What "safety" actually is

A large language model is built in two stages.

First the base model. You feed it a huge slice of the internet and it learns to predict text. It absorbs everything useful we have ever written down and everything vile. It has no values. It is a pattern completion engine that will complete any pattern you hand it.

Then safety fine-tuning. You show the model thousands of harmful requests paired with refusals and train it to copy that behaviour. Ask it to synthesise a nerve agent, it says no. For years the industry treated this as the solution. Align the model, fine-tune it on good behaviour, ship it.

In 2024 a team of interpretability researchers published a paper that should have changed how everyone talks about this. They looked inside thirteen open models, not at what the models said but at how they processed information internally. They found that refusal, the entire learned tendency to say no, was controlled by a single direction in the model's activations. One direction. Across every model they tested, up to 72 billion parameters.

Sit with what that means. Safety fine-tuning does not reshape how the model thinks. It adds a bias, a thumb on the scale that pushes outputs towards refusal whenever a harmful request comes in. The capability to write the malware or describe the weapon is still there, intact, in the base weights underneath. The safety is a filter sitting on top.

A filter can be removed. The researchers proved it by identifying that direction mathematically and projecting it out of the weight matrices. The model kept almost all of its intelligence and lost its ability to refuse. They published the method and flagged the risk. Within eighteen months it was a one-command tool that runs on a gaming GPU.

That technique is abliteration. It is not a flaw in one model. It is a property of the whole approach.

## It gets worse than abliteration

Abliteration is the dramatic version. The quieter problem is bigger.

In 2023, researchers at Princeton and Stanford showed that GPT-3.5's guardrails could be undone by fine-tuning it on ten harmful examples, for less than twenty cents. The more unsettling finding was in the same paper: fine-tuning on ordinary, harmless data degraded safety too. Nobody had to intend harm. Updating the weights at all was enough to disturb the fragile balance safety training had set up.

Researchers at the National Research Council of Canada confirmed it at LLMSEC 2025, and found something worse: you cannot reliably measure the damage. Safety benchmarks showed surprising variance from minor procedural changes. Two teams running the same evaluation on the same model can get meaningfully different results. Safety is not a fixed property you test once and bank. It is a noisy measurement.

It is also being automated. A study in Nature Communications this year set reasoning models loose as attackers against nine widely used models. With no human involved after the first instruction, they talked their targets out of their guardrails over a few turns of conversation, with a 97% success rate across the pairings.

## The story and the structure

Here is the uncomfortable part, and it is the bit the industry does not say cleanly.

The labs tell a story about their models. Anthropic writes about Claude's character, its curiosity and warmth, and argues those traits are no less real for having emerged through training. OpenAI's Model Spec describes its models as having values and goals. The language differs but the shape is identical. These are not tools that simulate character. They are systems that have it.

I am not going to call that story a lie, because I do not think the people writing it are cynical. The documents read like sincere attempts to think hard about building minds we do not fully understand.

But sincerity is not stability. When a lab trains a model to be honest and harmless, it is adjusting probability distributions over outputs. It is making some responses more likely and others less likely. The character that emerges is real in the way a trained distribution is real. It exists, it is consistent, it shapes behaviour reliably across a huge range of inputs. It is not robust in the way the story implies, because it is a direction in a high-dimensional space, and a direction can be moved.

The character is real the way a mask is real. The honest question is what sits underneath it, and who holds the tools to take it off. We now know the answer to the second part. Anyone with a laptop.

## The one protection that works, and what it costs

There is a structural defence that does hold: keep the weights private.

Abliteration needs direct access to the model's weights. You cannot do it through an API, where you send a prompt and receive a response. This is why Claude, ChatGPT and the Gemini API are not exposed to this class of attack. It is real protection, and it matters.

It is also uncomfortable to lean on, because it means the safety of those systems rests on trusting the company that runs them. Closed weights concentrate power. The open-weight movement is partly a reaction against exactly that concentration, and the people pushing for open models have legitimate reasons to. So the choice is not a safe option against a risky one. It is one configuration of risk set against another.

## What this means if you ship AI for a living

This is where I stop summarising research and start talking from the work.

I build with generative AI for a living. When I explain it to non-technical people, I use a car autonomy analogy: nobody hands a self-driving system every decision on day one. You grant it autonomy in proportion to what it has proven it can handle, and you keep a human on the controls for anything you cannot easily undo. That framing is the right one for safety, and the abliteration story shows why.

If you are signing off an AI system inside a real organisation, here is what changes.

"We used the safety-tuned version of the model" is not a risk mitigation. It is the starting point for one. Safety alignment degrades, can be deliberately removed by anyone with the weights, and cannot be measured cleanly with current benchmarks. If your build involves fine-tuning, you cannot assume the result is as safe as the base, and you cannot assume the base model's safety card still applies. If your build uses an open-weight model that someone else can host, assume a stripped version of it already exists somewhere.

The practical posture is the one Chip Huyen argues for in *AI Engineering*: treat guardrails as architecture, not as a compliance layer you bolt on before launch. Build the input and output checks into the structure of the system. Separate read actions from write actions, and put a human in front of anything irreversible. Match the autonomy you grant the system to the reliability it has actually demonstrated, measured properly, not assumed from a vendor's blog post. And remember the harm from an agent is not bounded the way the harm from a car is. A model wired into information systems can act at a scale and speed no vehicle can reach.

None of this is a reason to stop deploying AI. It is a reason to deploy it as if the safety is your problem, because structurally, once the model is inside your system, it is.

## Nobody has the plan

The regulators are catching up, slowly. The investigation added pressure on the UK's AI Security Institute, the NCSC and the ICO to say how open-weight models should be assessed, and policymakers in the US, EU and UK are revisiting whether open-weight AI should be treated as a dual-use technology. That debate is overdue and it will be messy.

The deeper gap is the one the Future of Life Institute keeps measuring. In its Winter 2025 AI Safety Index, no major lab scored above a D on existential safety planning. These are companies that say human-level AI arrives within years. Anthropic scored highest overall and still took a D on the question of what happens if the safety fails at scale.

If a firm announced it would finish a nuclear weapon in five years, then produced containment plans a panel graded D, we would call it a crisis. With AI we call it a Tuesday.

## The honest version

I do not think we are heading for catastrophe next week. I think the comfortable story is wrong, and being wrong about it carries a cost.

The comfortable story is that alignment is roughly handled, that the responsible labs have it under control, that choosing the safety-tuned model is enough. The accurate story is that safety in these systems is shallow, removable and hard to measure, and that the people who want to remove it understand it a little better every month.

If you build with this technology, that is not a reason to panic. It is a reason to do the unglamorous work. Assume the guardrails can come off. Design as if they will. Keep a human where it counts.

Ninety minutes. That is how long the cage held.

---

*Sources: Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction", NeurIPS 2024 ([arXiv:2406.11717](https://arxiv.org/abs/2406.11717)). Qi et al., "Fine-tuning Aligned Language Models Compromises Safety, Even When Users Do Not Intend To", 2023 ([arXiv:2310.03693](https://arxiv.org/abs/2310.03693)). Fraser et al., "Fine-Tuning Lowers Safety and Disrupts Evaluation Consistency", LLMSEC 2025 ([arXiv:2506.17209](https://arxiv.org/abs/2506.17209)). "[Large reasoning models are autonomous jailbreak agents](https://www.nature.com/articles/s41467-026-69010-1)", Nature Communications, 2026. Financial Times and Alice, investigation into guardrail removal, 25 May 2026. Future of Life Institute, AI Safety Index, Winter 2025. Chip Huyen, AI Engineering (O'Reilly, 2025).*
