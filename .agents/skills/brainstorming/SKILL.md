---
name: brainstorming
description: "Use before you design a new feature, or a behavior change big enough to need a plan. Explores user intent, requirements and design before implementation."
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design in short sections, checking after each section whether it looks right so far.

## The Process

**Understanding the idea:**
- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why
- When you are working on schemas or interfaces, don't feed decisions one-by-one. Propose the full schema, and highlight all the decisions/trade-offs in one go.

**Presenting the design:**
- Once you believe you understand what you're building, present the design
- Break it into short sections
- Ask after each section whether it looks right so far
- Cover: architecture, components, key interfaces and data structures, core algorithms, data flow, error handling, testing
    - Show the key interfaces, data structures, and core algorithms explicitly
- Be ready to go back and clarify if something doesn't make sense

## After the Design

**Documentation:**
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`, in plain language.
- Commit the design document to git

**Implementation (if continuing):**
- Ask: "Ready to set up for implementation?"
- Use writing-plans to create detailed implementation plan

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design in sections, validate each
- **Be flexible** - Go back and clarify when something doesn't make sense
- **Interfaces and data structures form the core of the design** - Always show the key interfaces and data structures explicitly/prominently
- **Domain modeling** - Model the domain in the business's ubiquitous language; `writing-plans` owns the domain-model and DDD guidance.
