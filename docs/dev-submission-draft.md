---
title: I Spent 47 Hours Turning "Hello, World" Into an Enterprise Platform
published: false
tags: devchallenge, aprilfools, googleai, htcpcp
description: I turned Hello World into a nine-service, six-language, Gemini-powered enterprise incident factory with a ceremonial teapot.
---

Some people write:

```js
console.log("Hello, World");
```

I wrote a Vercel frontend that calls an API gateway, which consults feature flags, asks Gemini whether the vibes support `"Hello"` or `"Greetings"`, A/B tests punctuation, routes through Java to capitalize the first letter, uses C# to concatenate strings, lets Rust add punctuation safely, and then checks with a teapot before showing two words on screen.

This solved no user problems.

It did, however, create a platform.

## What I Built

I built **HelloWorld Enterprise Edition**, a delightfully useless web app that displays `Hello World` with the kind of architectural seriousness normally reserved for payment rails, spacecraft, or the LinkedIn feed.

From the outside, it looks like a polished internal dashboard.  
From the inside, it is a cry for help with very good typography.

Behind one greeting, there are:

- 9 microservices
- 6 programming languages
- a Gemini-powered Chief Greeting Officer
- feature flags
- A/B testing for punctuation
- 47 Architecture Decision Records
- incident reports for greeting-related disasters
- a teapot service that refuses coffee on standards-compliant principle

The app does not merely display `Hello World`.

It **orchestrates** `Hello World`.

**Live demo:** https://helloworld-enterprise.vercel.app  
**GitHub repo:** https://github.com/CodeExplorerRay/hello-world-enterprise  
**GitLab mirror:** https://gitlab.com/CodeExplorerRay/hello-world-enterprise

## Demo

Here is what the demo actually does:

1. You open the site and are greeted by an unnecessarily dramatic loading screen.
2. The UI cycles through deeply reassuring enterprise status messages like:
   - `Consulting feature flags...`
   - `Checking the moon phase and the vibes...`
   - `Reviewing Architecture Decision Record #47...`
3. The backend assembles your greeting through a distributed system that absolutely should not exist.
4. The frontend presents the result like a real observability dashboard, including:
   - routing authority
   - latency
   - token usage
   - feature-flag posture
   - teapot status
   - cost-per-greeting
   - whether any of this was worth it

There is also an April 1st override that can replace the normal output with `APRIL FOOLS`, because governance never sleeps.

## Code

The full repo is here:

- GitHub: https://github.com/CodeExplorerRay/hello-world-enterprise
- GitLab: https://gitlab.com/CodeExplorerRay/hello-world-enterprise

Some of my favorite receipts:

### Gemini really is in the loop

```js
const { GoogleGenAI } = require("@google/genai");
const MODEL_NAME = "gemini-flash-lite-latest";
```

Yes, I genuinely wired Google AI into the critical business decision of whether the app should say `Hello`, `Hi`, `Hey`, or `Greetings`.

### The teapot really does exist

```go
http.HandleFunc("/brew", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusTeapot)
    fmt.Fprintf(w, "Still a teapot. Nice try though.")
})
```

This project contains a real Go microservice dedicated to the proposition that some servers simply are not meant to brew coffee.

### We wrote incident reports for greeting drift

One of the incident reports is literally about a user receiving `Hi World!` instead of `Hello World!`.

Severity: **P0**  
Users impacted: **1**  
Institutional dignity impacted: **all of it**

## The Architecture (A Cry for Help)

```text
User
  -> Next.js frontend on Vercel
  -> API Gateway (Node.js/Express)
  -> Feature Flag Service
  -> AI Decision Engine (Gemini)
  -> A/B Testing Service
  -> Capitalization Service (Spring Boot)
  -> Concatenation Service (.NET)
  -> Punctuation Service (Rust)
  -> Teapot Service (Go)
  -> back to the frontend so it can present two words with executive confidence
```

If you are wondering whether this could have been one function:

Yes.

If you are wondering whether I chose peace:

No.

## How I Built It

### Frontend

The frontend is built with **Next.js 14, React, TypeScript, and CSS Modules**.

I wanted it to look less like a joke landing page and more like a beautifully overfunded internal control room. Instead of a basic `Hello World`, the UI renders:

- a loading experience with orchestration stages
- status badges for live AI, fallback, or policy-driven routing
- a service-flow visualization
- narrative and experiment panels
- teapot protocol reporting
- a raw metadata drawer for people who enjoy opening JSON and making eye contact with their own bad decisions

### Backend

The backend is a proper federation of nonsense:

1. **API Gateway** in Node.js/Express receives the request.
2. **Feature flags** decide whether AI is enabled and which greeting word is approved.
3. **Gemini Flash-Lite** acts as the Chief Greeting Officer when AI routing is enabled.
4. **Python/Flask** A/B tests whether your punctuation should be enthusiastic or professionally dead inside.
5. **Java/Spring Boot** capitalizes the greeting because apparently title case is an enterprise concern.
6. **C#/.NET** concatenates strings with Microsoft-grade ceremony.
7. **Rust** appends punctuation with the kind of memory safety usually reserved for nuclear facilities.
8. **Go** powers the teapot service, because it felt spiritually correct.

### Deployment

The live shape of the project is:

- **Vercel** for the frontend
- **Railway** for the backend services
- **Docker Compose** for local multi-service development

And because restraint is for other people, I also documented a **Google Cloud Run + Cloud Build** deployment path for the backend.

### Governance, for a two-word app

This repo includes:

- **47 ADRs**
- a changelog
- monitoring assets
- an API specification
- a runbook
- incident reports

I did not stop when the joke was clearly already working.  
I continued until the joke had compliance overhead.

## Why Google AI Is Here

This project is not using AI as a sticker.

Gemini is directly part of the bit.

The AI decision engine helps choose the greeting word and generate the reasoning around that decision. In other words, I used a modern generative model to answer one of the least urgent questions in software history:

> Should this website say "Hello" or "Greetings" today?

The answer depends on rollout policy, request context, and whether the AI layer feels emotionally aligned with the moment.

That is the most serious misuse of useful technology I have produced all year.

## Ode to Larry Masinter

I also feel morally obligated to mention the teapot.

The project includes a dedicated **HTCPCP-inspired teapot service** with:

- a `/brew` endpoint that returns `418 I'm a Teapot`
- a `/brew/additions` endpoint with `Accept-Additions`
- philosophical teapot musings
- a sincere dedication to Larry Masinter

Even better: the `/health` payload reports the teapot's `418` identity in JSON, because returning an actual `418` for health checks made load balancers behave like cowards.

This may be the most emotionally complete microservice I have ever written.

## Favorite Internal Lore

My favorite part of this repo is that it has canon.

Examples:

- There is an incident report for the time the greeting said `Hi` instead of `Hello`.
- There is an ADR defending the use of microservices for `Hello World`.
- There is a formal decision around using HTTP 418 as a health check identity.
- The system keeps track of whether all this was worth it.
- The answer is usually `false`.

## Prize Category

**Best Google AI Usage**

I’m choosing this because Gemini is not just mentioned in the README. It is actually wired into the product experience as the Chief Greeting Officer and materially affects the greeting path, the returned reasoning, and the metadata exposed by the system.

That said, I would also like to submit this spiritually for **Best Ode to Larry Masinter**, because the teapot service is one of the most important and least employable components in the stack.

## Final Thoughts

I started with `Hello World` and accidentally built a tiny enterprise.

If your app currently has too many services, too many dashboards, too many committees, or too much AI, I hope this post makes you feel seen.

And if not, I hope it at least makes you feel better about your architecture.

What is the most over-engineered thing *you* have ever built?
