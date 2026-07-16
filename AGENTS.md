# AGENTS — Agent governance and onboarding

Summary
This document defines agent roles, required behaviors, security constraints, and the onboarding process for adding automation agents to this repository. It is normative: CI and code owners should treat these rules as enforceable policy.

Agent entry template (required)
- name: short unique id (kebab-case)
- display_name: human-friendly name
- role: one of [human-review, ci-bot, deploy-bot, infra-bot, security-bot]
- scope: file paths or folders the agent may modify (e.g., "ci/**", "deploy/**")
- identity: webhook URL, service account name, or GitHub App id
- owner: team or person responsible
- contact: email or Slack/Matrix handle
- allowed_auto_merge: boolean (default: false)
- changelog: brief list of behaviors and commands the agent performs

Agent JSON Schema (for validation)
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name","display_name","role","scope","identity","owner","contact"],
  "properties": {
    "name": {"type":"string", "pattern":"^[a-z0-9-]+$"},
    "display_name": {"type":"string"},
    "role": {"type":"string", "enum":["human-review","ci-bot","deploy-bot","infra-bot","security-bot"]},
    "scope": {"type":"string"},
    "identity": {"type":"string"},
    "owner": {"type":"string"},
    "contact": {"type":"string"},
    "allowed_auto_merge": {"type":"boolean"},
    "changelog": {"type":"string"}
  },
  "additionalProperties": false
}

Minimum rules (enforced)
1. Audit: Every agent action that opens/edits a PR or commits must add an audit comment on the PR and include an audit footer in commit messages:
   Agent: <name>
   Agent-Action: <description>
   Agent-Run-ID: <unique-id>
2. Human review: Agents may not merge changes unless allowed_auto_merge is true AND a code owner has approved, or a designated emergency approval process is used.
3. Secrets: Agents must never insert secrets into the repo. All credentials must be stored in a secrets manager (GitHub Secrets, Vault). PRs that add credentials must be blocked.
4. Config changes: Any agent-initiated change to infra/CI/deploy/config files must include label `agent:config-change` and notify the owner in the PR description.
5. Least privilege: Scope must be as narrow as possible. Wide-scoped agents require explicit senior-owner approval recorded in the PR.
6. Tests: Agents that modify code must attach or reference tests demonstrating expected behavior.

CONTRIBUTING — how to add a new agent (checklist)
- Fork or create branch `add-agent/<name>` from default branch.
- Add an entry to AGENTS.md using the Agent entry template.
- If agent will run automated changes, add tests and a sample run or dry-run logs.
- Add a GitHub Actions workflow or configuration that enforces the JSON Schema (optional but recommended).
- Open a PR and assign the owner; request at least one code-owner review and one security review.
- On approval, merge according to repository policy.

Enforcement recommendations (CI)
- Add a workflow step that validates new/changed AGENTS.md entries against the JSON Schema.
- Add a job that fails if new commit diffs include plaintext secrets (use truffleHog, detect-secrets or similar), and require manual override.
- Add label automation to mark PRs that appear to be agent-driven (e.g., if author is a bot account).

Rollback and emergency
- Describe emergency process in a separate EMERGENCY.md if the repo has autopilot agents allowed to merge.

Contact & owner
- Repo owner / team: Ai-Iq-Menja-nica team
- Security contact: security@spaja86.dev

(End)
