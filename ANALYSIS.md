# Open-Claw: VPS Setup & Paperclip Setup Analysis

## Repository Overview

The Open-Claw repository contains a single file: `install.sh` (682 lines).
It is a cross-platform installer for the OpenClaw AI CLI tool.

---

## VPS Setup Analysis

**Status: Not Present**

There is no VPS or server deployment configuration in this repository:

- No Dockerfiles or container configurations
- No nginx, Apache, or reverse proxy configs
- No deployment scripts or CI/CD pipelines
- No Terraform, Ansible, or infrastructure-as-code files
- No cloud provider integrations (AWS, DigitalOcean, Linode, etc.)
- No environment variable templates (.env.example)
- No systemd service files or process manager configs (PM2, supervisor)
- No database configuration or migration files

The `install.sh` script is a **client-side installer** designed to run on
end-user machines (macOS, Linux, Windows), not on servers or VPS instances.

---

## Paperclip Setup Analysis

**Status: Not Present**

There is no Paperclip (Ruby file attachment library) or equivalent file
attachment/upload system:

- No Gemfile or Ruby dependencies
- No `has_attached_file` declarations
- No S3 or cloud storage configuration
- No file upload middleware or handlers
- No models, migrations, or Rails application code
- No package.json or any application framework

---

## What `install.sh` Does

The installer handles five concerns:

### 1. SSL/TLS Compatibility (`find_working_curl`, `check_ssl`)
- Resolves curl SSL errors on older macOS (10.12 Sierra and below)
- Tries system curl with `--tlsv1.2`, then Homebrew curl, MacPorts curl
- Falls back to wget if curl is unavailable
- Provides detailed remediation steps on failure

### 2. OS/Architecture Detection (`detect_os`)
- Detects macOS, Linux, or Windows (MINGW/MSYS/Cygwin)
- Captures macOS version for compatibility gating
- Detects CPU architecture (x86_64, arm64, aarch64)

### 3. Node.js Installation (`install_node`)
- Requires Node.js v22+ (LTS fallback: v22.14.0)
- Four installation methods in order of preference:
  1. **Homebrew** — requires macOS 10.13+
  2. **MacPorts** — `sudo port install nodejs22`
  3. **nvm** — downloads and installs nvm, then installs Node 22
  4. **Direct binary** — downloads from nodejs.org and extracts to `/usr/local`

### 4. OpenClaw npm Install (`install_openclaw`)
- Runs `npm install -g openclaw` (or specific version)
- Retries with `sudo` if initial install fails

### 5. Verification
- Confirms `openclaw` command is available in PATH
- Reports installed version
- Provides PATH troubleshooting if command not found

---

## Key Configuration Constants

| Variable | Default | Purpose |
|----------|---------|---------|
| `OPENCLAW_VERSION` | `latest` | Version to install |
| `MIN_NODE_MAJOR` | `22` | Minimum Node.js major version |
| `NODE_FALLBACK_VERSION` | `22.14.0` | LTS version for direct download |
| `INSTALL_DIR` | `/usr/local` | Binary installation directory |
| `MIN_MACOS_HOMEBREW` | `10.13` | Minimum macOS for Homebrew |
| `MIN_MACOS_NODE22` | `11.0` | Minimum macOS for Node 22 official support |
| `MIN_MACOS_NODE18` | `10.15` | Minimum macOS for Node 18 support |

---

## Recommendations

1. **VPS Deployment**: If server deployment is needed, infrastructure must be
   built from scratch (Dockerfile, nginx config, systemd service, deployment
   scripts, etc.)

2. **File Attachments**: If Paperclip-style file handling is needed, an
   application framework and storage layer must be selected and implemented.

3. **Documentation**: The repository lacks a README.md explaining the project's
   purpose, usage, and contribution guidelines.

4. **Testing**: No test suite exists for the installer script. Consider adding
   shellcheck linting and bats tests.
