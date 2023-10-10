<img alt="Demo medical bot app powered by GPT-4" src="https://www.medibot.chat /opengraph-image.png">
<h1 align="center">Demo AI Medical Chatbot</h1>

<p align="center">
  An open-source demo AI chatbot built with Next.js, the Vercel AI SDK, OpenAI (GPT-4), upstash and Clerk.
</p>

This app was inspired by this video [I built an AI doctor with ChatGPT - Full Clinical Experience](https://www.youtube.com/watch?v=EAger7jOrsA&t=1s) by David Shapiro and his open source code that can be found [here](https://github.com/daveshap/Medical_Intake). This just puts a nice UI on top of it and adds a few more minor UX improvements.

The app is purely for demo purposes and is not intended to be used in a real medical setting as the data is stored in plain text! So **do not** add real data.

## upstash

You will need to set up an upstash account and create a Redis Database. Only takes a few clicks!

Remember to update your environment variables (`UPSTASH_URL`, `UPSTASH_KEY`) in the `.env` file with the appropriate credentials provided during the setup process.

## Clerk

You will need to set up a Clerk account and create a Clerk application. This also only takes a few clicks!

Remember to update your environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) in the `.env` file with the appropriate credentials provided during the setup process.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary.

```bash
pnpm install
pnpm dev
```

Medi bot should now be running on [localhost:3000](http://localhost:3000/).

## Credits

This template is a fork of [this one](https://github.com/garmeeh/ai-chatbot) which adds upstash and clerk on top of the [main AI Chatbot from the Vercel](https://github.com/vercel-labs/ai-chatbot) team and other contributors.
