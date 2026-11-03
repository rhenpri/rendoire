export interface Book {
  title: string;
  author: string;
  publisher: 'oreilly' | 'manning' | 'independent';
  year: string;
  blurb: string;
  url: string;
  tag: string;
}

export interface Stage {
  id: string;
  label: string;
  title: string;
  why: string;
  bookTitles: string[];
}

export const books: Book[] = [
  {
    title: 'AI Engineering',
    author: 'Chip Huyen',
    publisher: 'oreilly',
    year: '2025',
    blurb: 'The definitive field guide to building applications on foundation models — evals, RAG, agents, and shipping. Start here for modern AI.',
    url: 'https://www.oreilly.com/library/view/ai-engineering/9781098166298/',
    tag: 'LLMs',
  },
  {
    title: 'Designing Machine Learning Systems',
    author: 'Chip Huyen',
    publisher: 'oreilly',
    year: '2022',
    blurb: 'ML from the production angle: data, training, deployment, monitoring. The book that teaches you the whole system, not just the model.',
    url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
    tag: 'ML systems',
  },
  {
    title: 'Hands-On Machine Learning',
    author: 'Aurélien Géron',
    publisher: 'oreilly',
    year: '2022',
    blurb: 'The best practical introduction to classic ML and deep learning with scikit-learn, Keras, and TensorFlow. Code-first from page one.',
    url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/',
    tag: 'Foundations',
  },
  {
    title: 'Fundamentals of Data Engineering',
    author: 'Joe Reis & Matt Housley',
    publisher: 'oreilly',
    year: '2022',
    blurb: 'How data actually moves through systems — pipelines, storage, orchestration. Essential context for anyone feeding models.',
    url: 'https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/',
    tag: 'Data',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    publisher: 'oreilly',
    year: '2017',
    blurb: 'The canonical tour of databases, replication, and distributed systems. Timeless, and every serious engineer should read it.',
    url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903100/',
    tag: 'Data',
  },
  {
    title: 'Generative Deep Learning',
    author: 'David Foster',
    publisher: 'oreilly',
    year: '2023',
    blurb: 'Build models that create — text, images, music. A clear path from theory to working generative models.',
    url: 'https://www.oreilly.com/library/view/generative-deep-learning/9781098134174/',
    tag: 'Generative',
  },
  {
    title: 'Prompt Engineering for Generative AI',
    author: 'Phoenix & Taylor',
    publisher: 'oreilly',
    year: '2024',
    blurb: 'Practical techniques for steering LLMs reliably — a hands-on cookbook for prompts, chains, and structured outputs.',
    url: 'https://www.oreilly.com/library/view/prompt-engineering-for/9781098153427/',
    tag: 'LLMs',
  },
  {
    title: 'Practical Statistics for Data Scientists',
    author: 'Bruce, Bruce & Gedeck',
    publisher: 'oreilly',
    year: '2020',
    blurb: 'The statistics you actually need, explained in code and plain language. Fills the math gap most self-taught builders have.',
    url: 'https://www.oreilly.com/library/view/practical-statistics-for/9781492072935/',
    tag: 'Math',
  },
  {
    title: 'Deep Learning with Python',
    author: 'François Chollet',
    publisher: 'manning',
    year: '2021',
    blurb: 'The clearest deep-learning book there is, from the creator of Keras. Build intuition through working code.',
    url: 'https://www.manning.com/books/deep-learning-with-python-second-edition',
    tag: 'Deep learning',
  },
  {
    title: 'The Hundred-Page Machine Learning Book',
    author: 'Andriy Burkov',
    publisher: 'independent',
    year: '2019',
    blurb: 'All of ML in a hundred dense pages. The best single-evening overview if you want the map before the journey.',
    url: 'https://themlbook.com',
    tag: 'Foundations',
  },
  {
    title: 'Feature Engineering for Machine Learning',
    author: 'Zheng & Casari',
    publisher: 'oreilly',
    year: '2018',
    blurb: 'The often-neglected craft of turning raw data into features models can actually learn from.',
    url: 'https://www.oreilly.com/library/view/feature-engineering-for/9781491953242/',
    tag: 'Foundations',
  },
  {
    title: 'Machine Learning Design Patterns',
    author: 'Lakshmanan, Robinson & Munn',
    publisher: 'oreilly',
    year: '2020',
    blurb: 'Reusable solutions to the problems that come up again and again when you ship ML.',
    url: 'https://www.oreilly.com/library/view/machine-learning-design/9781098115777/',
    tag: 'ML systems',
  },
  {
    title: 'Reliable Machine Learning',
    author: 'Chen, Murphy, Parisa et al.',
    publisher: 'oreilly',
    year: '2022',
    blurb: 'Monitoring, validation, and operating ML in production — the unglamorous stuff that keeps systems honest.',
    url: 'https://www.oreilly.com/library/view/reliable-machine-learning/9781098106218/',
    tag: 'ML systems',
  },
  {
    title: 'Deep Learning for Coders with fastai and PyTorch',
    author: 'Howard & Gugger',
    publisher: 'oreilly',
    year: '2020',
    blurb: 'Top-down deep learning from the fastai founders — build working models first, understand later.',
    url: 'https://www.oreilly.com/library/view/deep-learning-for/9781492045526/',
    tag: 'Deep learning',
  },
  {
    title: 'Natural Language Processing with Transformers',
    author: 'Tunstall, von Werra & Wolf',
    publisher: 'oreilly',
    year: '2022',
    blurb: 'The Hugging Face guide to transformers — fine-tuning, tokenization, and the models behind modern NLP.',
    url: 'https://www.oreilly.com/library/view/natural-language-processing/9781098136796/',
    tag: 'Deep learning',
  },
  {
    title: 'Hands-On Large Language Models',
    author: 'Alammar & Grootendorst',
    publisher: 'oreilly',
    year: '2024',
    blurb: 'Visual, code-first tour of how LLMs actually work — embeddings, attention, fine-tuning, and prompting.',
    url: 'https://www.oreilly.com/library/view/hands-on-large-language/9781098150952/',
    tag: 'LLMs',
  },
];

export const stages: Stage[] = [
  {
    id: 'foundations',
    label: '01',
    title: 'Foundations',
    why: 'Build the intuition and the math vocabulary you will lean on everywhere else. Do not skip this.',
    bookTitles: ['Practical Statistics for Data Scientists', 'The Hundred-Page Machine Learning Book', 'Feature Engineering for Machine Learning'],
  },
  {
    id: 'classic-ml',
    label: '02',
    title: 'Classical machine learning',
    why: 'Learn the algorithms that still power most of production ML, and how to build systems around them.',
    bookTitles: ['Hands-On Machine Learning', 'Designing Machine Learning Systems', 'Machine Learning Design Patterns'],
  },
  {
    id: 'deep-learning',
    label: '03',
    title: 'Deep learning',
    why: 'Neural networks, training, and generative models. The layer most people call "AI".',
    bookTitles: ['Deep Learning with Python', 'Deep Learning for Coders with fastai and PyTorch', 'Generative Deep Learning', 'Natural Language Processing with Transformers'],
  },
  {
    id: 'llms',
    label: '04',
    title: 'LLMs & agents',
    why: 'Foundation models, retrieval, evals, and agents — the modern stack and how to build on it.',
    bookTitles: ['AI Engineering', 'Hands-On Large Language Models', 'Prompt Engineering for Generative AI'],
  },
  {
    id: 'production',
    label: '05',
    title: 'Production & data systems',
    why: 'The unglamorous layer where real products live or die: data pipelines and distributed systems.',
    bookTitles: ['Designing Data-Intensive Applications', 'Fundamentals of Data Engineering', 'Reliable Machine Learning'],
  },
];

export interface Term {
  term: string;
  def: string;
  group: string;
  /** key into the MiniViz diagrams */
  viz: string;
}

export const glossary: Term[] = [
  { term: 'Machine learning', group: 'Core', viz: 'ml', def: 'Programs that improve with data instead of explicit rules — they learn a mapping from inputs to outputs by example.' },
  { term: 'Neural network', group: 'Core', viz: 'nn', def: 'A stack of connected layers of weighted neurons, trained to approximate a function. The building block of deep learning.' },
  { term: 'Deep learning', group: 'Core', viz: 'dl', def: 'Neural networks with many layers, which learn hierarchical features automatically from raw data.' },
  { term: 'Foundation model', group: 'Core', viz: 'foundation', def: 'A large model trained on broad data that can be adapted to many tasks — GPT and Llama are the obvious examples.' },
  { term: 'Large language model (LLM)', group: 'Core', viz: 'llm', def: 'A foundation model trained on text to predict the next token; with enough scale, this simple objective yields fluent reasoning.' },
  { term: 'Transformer', group: 'Architecture', viz: 'transformer', def: 'The attention-based architecture behind modern LLMs. Its self-attention lets each token weigh every other token in context.' },
  { term: 'Token', group: 'Architecture', viz: 'token', def: 'A chunk of text (a word or part of a word) that a model reads and writes. Billing and context windows are measured in tokens.' },
  { term: 'Embedding', group: 'Architecture', viz: 'embedding', def: 'A dense vector that represents a word, image, or passage in a space where similar things sit close together.' },
  { term: 'Context window', group: 'Architecture', viz: 'context', def: 'How much text a model can hold in working memory at once. Bigger windows mean more material in a single prompt.' },
  { term: 'Training vs inference', group: 'Ops', viz: 'train', def: 'Training updates the model weights (expensive, rare). Inference runs the trained model to produce output (cheap, frequent).' },
  { term: 'Fine-tuning', group: 'Ops', viz: 'finetune', def: 'Further training a base model on a smaller, targeted dataset to improve it on a specific task or style.' },
  { term: 'RAG', group: 'Ops', viz: 'rag', def: 'Retrieval-augmented generation — look up relevant documents at query time and feed them to the model, grounding its answer in your data.' },
  { term: 'Agent', group: 'Ops', viz: 'agent', def: 'An LLM given tools and a goal, allowed to plan and act over multiple steps instead of answering in one shot.' },
  { term: 'Model Context Protocol (MCP)', group: 'Ops', viz: 'mcp', def: 'An open standard for connecting models to tools and data — a common plug so integrations are written once and work everywhere.' },
  { term: 'Hallucination', group: 'Core', viz: 'hallucination', def: 'When a model produces fluent but false output. A reminder that LLMs predict text, not facts — which is why grounding matters.' },
  { term: 'Multimodal', group: 'Core', viz: 'multimodal', def: 'Models that handle more than one medium — text, images, audio — in a single system.' },
];
