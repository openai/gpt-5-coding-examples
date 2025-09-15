# GPT-5 Coding Examples

This repository contains a curated collection of demo applications **generated entirely in a single [GPT-5](https://platform.openai.com/docs/models/gpt-5) prompt**, without writing any code by hand.

These demos were selected to showcase the model’s strengths in coding — especially quickly scaffolding websites, front-end applications, games, and interactive UIs from natural-language descriptions. They’re intended as inspiration for you to build your own ideas.

## Explore Examples

You can explore the demos by cloning this repo and running it locally.

```
cd front-end
npm install
npm run dev
```

The app will be available at `localhost:3000`.

You can also visit the [hosted version](https://gpt5-coding-examples.vercel.app/).

From there, you can view any example, see the zero-shot prompt that created the code, and remix it for your own ideas.

## Build with GPT-5

If you want to experiment with similar prompts, you can try GPT-5 in your preferred coding environment:

- **[Codex CLI](https://github.com/openai/codex)** – A lightweight coding agent that runs in your terminal.
- **Your favorite IDE or coding tool** – Use GPT-5 within your existing workflow to generate and refine code.
- **[ChatGPT](https://chatgpt.com)** – Open ChatGPT and choose GPT-5 to generate and preview code in the browser.

Choose an example, copy its prompt for inspiration, and adapt it to your own needs.
Let GPT-5 build your idea, then iterate on the prompt or code to explore variations.

### For Developers: Codex CLI

We recommend using the [**Codex CLI**](https://github.com/openai/codex) with GPT-5 for a seamless coding experience.

The Codex CLI runs in your terminal: given a prompt, it will generate code, execute it in a sandbox, and even preview the results live.

Example:

```bash
codex --model gpt-5 --full-auto "Build a simple photobooth application with camera access in a single HTML file"
```

GPT-5 will scaffold the app, write files, install dependencies as needed, and show a live preview. This is the **go-to solution** for developers who want to bootstrap apps or add features quickly.

You can also use GPT-5 with any other AI coding tool that supports the model.

### For Non-Developers: ChatGPT

If you don’t have a coding environment, you can use [**ChatGPT**](https://chatgpt.com) (with GPT-5) to build and preview apps entirely in the browser:

1. Copy an example’s prompt for inspiration and customize it to make it your own.
2. Let GPT-5 generate the code (HTML/CSS/JavaScript).
3. Open it in **Canvas** preview to see it run live.
4. Download or copy the output HTML for real-world use.

With this method, _anyone_ can create a working single-page app — no local setup required.

> [!NOTE]
> We are not accepting contributions at this time.
> This repo is for **reference and inspiration only**. If you’d like to build on these ideas, please fork the repo for your own experiments.


---
*Documentation formatting improved for better readability.*