#!/usr/bin/env python3
"""Ask the user to approve each gh command that posts to a pull request.

CLAUDE.md permits a comment, reply, review, or reaction on a pull request only
after the user approves its exact text. As guidance an agent can read a general
approval, such as "ok make those changes", as approval for a post. This hook
makes the requirement mechanical. It returns "ask", so Claude Code shows the
command in a permission prompt that only the user can answer.

The gate has no bypass. A bypass that the agent can type defeats the gate.
"""

import json
import os
import re
import shlex
import sys

POST_COMMANDS = {("pr", "comment"), ("pr", "review"), ("issue", "comment")}
# These commands post a comment only with --comment.
CLOSE_COMMANDS = {
    ("pr", "close"),
    ("pr", "reopen"),
    ("issue", "close"),
    ("issue", "reopen"),
}

# The gh api flags that take the next token as their value.
API_VALUE_FLAGS = {
    "-X",
    "--method",
    "-H",
    "--header",
    "-f",
    "--raw-field",
    "-F",
    "--field",
    "--input",
    "-p",
    "--preview",
    "-q",
    "--jq",
    "-t",
    "--template",
    "--cache",
    "--hostname",
}
FIELD_FLAGS = {"-f", "--raw-field", "-F", "--field"}
WRITE_METHODS = {"POST", "PATCH", "PUT", "DELETE"}
POST_ENDPOINT = re.compile(r"(?:^|/)(?:comments|replies|reviews|reactions)(?:/|\?|$)")

CONTROL_TOKEN = re.compile(r"^[();<>|&]+$")
FALLBACK_TOKEN = re.compile(r"[();<>|&]+|[^\s();<>|&'\"]+")

ASK_REASON = (
    "This command writes a comment, reply, review, or reaction on GitHub under "
    "your account. Approve it only if you already approved this exact text."
)
ERROR_REASON = (
    "The PR post gate could not read this gh command. Approve it only if it "
    "does not post to GitHub, or if you already approved the post."
)
BYPASS_REASON = (
    "This command writes a comment, reply, review, or reaction on GitHub under "
    "the user's account. In bypassPermissions mode nobody can approve the post, "
    "so the gate blocks it. Show the user the exact text instead."
)


def tokenize(command):
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=True)
        lexer.whitespace_split = True
        return list(lexer)
    except ValueError:
        # An unbalanced quote, as in a heredoc with an apostrophe. The rough
        # split keeps the flags and the endpoint, so a post still gets a prompt.
        return FALLBACK_TOKEN.findall(command)


def is_gh(token):
    return os.path.basename(token.strip("`")) == "gh"


def gh_invocations(command):
    """Yield the arguments of each gh call in a shell command."""
    segment = []
    for token in tokenize(command) + [";"]:
        if not CONTROL_TOKEN.match(token):
            segment.append(token)
            continue
        starts = [index for index, word in enumerate(segment) if is_gh(word)]
        # shlex reads a newline as a space, so the next gh call on a new line
        # ends the arguments of the call before it.
        for start, end in zip(starts, starts[1:] + [len(segment)]):
            yield segment[start + 1 : end]
        segment = []


def split_flag(token):
    """Return the flag and its attached value, as in -XPOST or --method=POST."""
    if token.startswith("--"):
        name, separator, value = token.partition("=")
        return name, value if separator else None
    if token.startswith("-") and len(token) > 2:
        return token[:2], token[2:]
    return token, None


def api_posts(args):
    method = None
    field_values = []
    has_input = False
    positionals = []
    index = 0
    while index < len(args):
        name, value = split_flag(args[index])
        if name in API_VALUE_FLAGS:
            if value is None:
                index += 1
                value = args[index] if index < len(args) else ""
            if name in ("-X", "--method"):
                method = value.upper()
            elif name in FIELD_FLAGS:
                field_values.append(value)
            elif name == "--input":
                has_input = True
        elif not name.startswith("-"):
            positionals.append(args[index])
        index += 1

    if not positionals:
        return False
    endpoint = positionals[0]
    if endpoint == "graphql":
        # A query from a file or stdin can hold a mutation that the gate
        # cannot see.
        return has_input or any(
            "mutation" in value or "=@" in value for value in field_values
        )
    if method is None:
        # gh api sends a POST when the call has fields or input.
        method = "POST" if field_values or has_input else "GET"
    return method in WRITE_METHODS and bool(POST_ENDPOINT.search(endpoint))


def posts(args):
    pair = tuple(args[:2])
    if pair in POST_COMMANDS:
        return True
    if pair in CLOSE_COMMANDS:
        return any(split_flag(arg)[0] in ("-c", "--comment") for arg in args[2:])
    if args[:1] == ["api"]:
        return api_posts(args[1:])
    return False


def respond(decision, reason):
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": decision,
                    "permissionDecisionReason": reason,
                }
            }
        )
    )


def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except ValueError:
        return
    command = str((payload.get("tool_input") or {}).get("command", ""))
    try:
        is_post = any(posts(args) for args in gh_invocations(command))
        reason = ASK_REASON
    except Exception:
        # A parser bug must not let a post through, so the gate fails toward
        # a prompt.
        is_post, reason = True, ERROR_REASON
    if not is_post:
        return
    if payload.get("permission_mode") == "bypassPermissions":
        # The Claude Code docs do not say if this mode shows a prompt for an
        # "ask" from a hook. Unattended runs use this mode, and they must
        # never post.
        respond("deny", BYPASS_REASON)
    else:
        respond("ask", reason)


if __name__ == "__main__":
    main()
