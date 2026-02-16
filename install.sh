#!/usr/bin/env bash
# OpenClaw AI Installer
# Handles SSL/TLS compatibility for older macOS versions (10.12.6 Sierra and below)
# and provides fallback installation methods when Homebrew is unavailable.

set -euo pipefail

# ── Globals ──────────────────────────────────────────────────────────────────
OPENCLAW_VERSION="${OPENCLAW_VERSION:-latest}"
VERBOSE="${VERBOSE:-0}"
MIN_NODE_MAJOR=22
NODE_FALLBACK_VERSION="22.14.0"  # LTS version for direct download fallback
INSTALL_DIR="${OPENCLAW_INSTALL_DIR:-/usr/local}"

# macOS version thresholds
MIN_MACOS_HOMEBREW="10.13"   # Homebrew requires High Sierra+
MIN_MACOS_NODE22="11.0"      # Node 22 officially supports macOS 11+
MIN_MACOS_NODE18="10.15"     # Node 18 supports macOS 10.15+

# ── Colors / Symbols ────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

success() { printf "  ${GREEN}✓${NC} %s\n" "$*"; }
failure() { printf "  ${RED}✗${NC} %s\n" "$*"; }
info()    { printf "  ${BLUE}·${NC} %s\n" "$*"; }
warn()    { printf "  ${YELLOW}!${NC} %s\n" "$*"; }

banner() {
  printf "\n"
  printf "  ${BOLD}🦞 OpenClaw Installer${NC}\n"
  printf "  Siri's competent cousin.\n"
  printf "\n"
}

# ── Logging ──────────────────────────────────────────────────────────────────
log_verbose() {
  if [[ "$VERBOSE" == "1" ]]; then
    printf "  [verbose] %s\n" "$*"
  fi
}

# ── SSL-Safe curl wrapper ────────────────────────────────────────────────────
# Addresses: curl: (35) Unknown SSL protocol error in connection to github.com
#
# On older macOS (10.12 and below), the system curl links against an outdated
# LibreSSL (2.2.x) that cannot negotiate TLS 1.2/1.3 with GitHub and other
# hosts that have disabled TLS 1.0/1.1.
#
# This wrapper:
#   1. Forces TLS 1.2 minimum (--tlsv1.2)
#   2. Falls back to a Homebrew/MacPorts curl if available
#   3. Falls back to wget if curl is completely broken
#   4. Provides a clear error message with remediation steps
# ─────────────────────────────────────────────────────────────────────────────
CURL_CMD=""

find_working_curl() {
  local test_url="https://github.com"

  # 1. Try system curl with --tlsv1.2
  if command -v curl &>/dev/null; then
    if curl --tlsv1.2 -fsSL --max-time 10 -o /dev/null "$test_url" 2>/dev/null; then
      CURL_CMD="curl --tlsv1.2"
      log_verbose "Using system curl with --tlsv1.2"
      return 0
    fi
    log_verbose "System curl with --tlsv1.2 failed"
  fi

  # 2. Try Homebrew curl (often has newer TLS)
  local brew_curl="/usr/local/opt/curl/bin/curl"
  if [[ -x "$brew_curl" ]]; then
    if "$brew_curl" --tlsv1.2 -fsSL --max-time 10 -o /dev/null "$test_url" 2>/dev/null; then
      CURL_CMD="$brew_curl --tlsv1.2"
      log_verbose "Using Homebrew curl"
      return 0
    fi
  fi

  # 3. Try MacPorts curl
  local port_curl="/opt/local/bin/curl"
  if [[ -x "$port_curl" ]]; then
    if "$port_curl" --tlsv1.2 -fsSL --max-time 10 -o /dev/null "$test_url" 2>/dev/null; then
      CURL_CMD="$port_curl --tlsv1.2"
      log_verbose "Using MacPorts curl"
      return 0
    fi
  fi

  # 4. Try system curl without --tlsv1.2 flag (some builds don't support the flag)
  if command -v curl &>/dev/null; then
    if curl -fsSL --max-time 10 -o /dev/null "$test_url" 2>/dev/null; then
      CURL_CMD="curl"
      log_verbose "Using system curl without TLS flag"
      return 0
    fi
  fi

  CURL_CMD=""
  return 1
}

# Download a file using the best available method
# Usage: safe_download URL OUTPUT_PATH
safe_download() {
  local url="$1"
  local output="$2"
  local retries=3
  local attempt=0

  while (( attempt < retries )); do
    attempt=$((attempt + 1))

    if [[ -n "$CURL_CMD" ]]; then
      if $CURL_CMD -fsSL -o "$output" "$url" 2>/dev/null; then
        return 0
      fi
    fi

    # Fallback to wget
    if command -v wget &>/dev/null; then
      if wget --secure-protocol=TLSv1_2 -q -O "$output" "$url" 2>/dev/null; then
        return 0
      fi
      # Try wget without TLS flag
      if wget -q -O "$output" "$url" 2>/dev/null; then
        return 0
      fi
    fi

    if (( attempt < retries )); then
      log_verbose "Download attempt $attempt failed, retrying in ${attempt}s..."
      sleep "$attempt"
    fi
  done

  return 1
}

# Download content to stdout
# Usage: safe_download_stdout URL
safe_download_stdout() {
  local url="$1"

  if [[ -n "$CURL_CMD" ]]; then
    if $CURL_CMD -fsSL "$url" 2>/dev/null; then
      return 0
    fi
  fi

  if command -v wget &>/dev/null; then
    if wget --secure-protocol=TLSv1_2 -q -O - "$url" 2>/dev/null; then
      return 0
    fi
    if wget -q -O - "$url" 2>/dev/null; then
      return 0
    fi
  fi

  return 1
}

# ── OS / Version Detection ───────────────────────────────────────────────────
DETECTED_OS=""
MACOS_VERSION=""
MACOS_MAJOR=""
MACOS_MINOR=""
ARCH=""

detect_os() {
  local uname_s
  uname_s="$(uname -s)"
  ARCH="$(uname -m)"

  case "$uname_s" in
    Darwin)
      DETECTED_OS="macos"
      MACOS_VERSION="$(sw_vers -productVersion 2>/dev/null || echo "0.0.0")"
      MACOS_MAJOR="$(echo "$MACOS_VERSION" | cut -d. -f1)"
      MACOS_MINOR="$(echo "$MACOS_VERSION" | cut -d. -f2)"
      ;;
    Linux)
      DETECTED_OS="linux"
      ;;
    MINGW*|MSYS*|CYGWIN*)
      DETECTED_OS="windows"
      ;;
    *)
      DETECTED_OS="unknown"
      ;;
  esac
}

# Compare version strings: returns 0 if $1 >= $2
version_gte() {
  local v1="$1" v2="$2"
  # Use sort -V if available, otherwise do manual comparison
  if echo "" | sort -V &>/dev/null; then
    [[ "$(printf '%s\n%s' "$v1" "$v2" | sort -V | head -n1)" == "$v2" ]]
  else
    # Manual major.minor comparison
    local v1_major v1_minor v2_major v2_minor
    v1_major="$(echo "$v1" | cut -d. -f1)"
    v1_minor="$(echo "$v1" | cut -d. -f2)"
    v2_major="$(echo "$v2" | cut -d. -f1)"
    v2_minor="$(echo "$v2" | cut -d. -f2)"
    v1_minor="${v1_minor:-0}"
    v2_minor="${v2_minor:-0}"

    if (( v1_major > v2_major )); then
      return 0
    elif (( v1_major == v2_major )) && (( v1_minor >= v2_minor )); then
      return 0
    else
      return 1
    fi
  fi
}

# ── macOS Version Checks ────────────────────────────────────────────────────
check_macos_compat() {
  if [[ "$DETECTED_OS" != "macos" ]]; then
    return 0
  fi

  info "macOS version: $MACOS_VERSION"

  # Check if macOS is too old for everything
  if ! version_gte "$MACOS_VERSION" "10.13"; then
    warn "macOS $MACOS_VERSION is below the Homebrew minimum (10.13+)"
    warn "The installer will use alternative installation methods"

    if ! version_gte "$MACOS_VERSION" "10.15"; then
      printf "\n"
      warn "${BOLD}Important: macOS $MACOS_VERSION Compatibility${NC}"
      warn "Your macOS version is quite old. Here are your options:"
      printf "\n"
      warn "  1. ${BOLD}Upgrade macOS${NC} (recommended) — macOS 10.15+ is ideal"
      warn "  2. ${BOLD}Use MacPorts${NC} — https://www.macports.org"
      warn "     Run: sudo port install nodejs22 npm10"
      warn "  3. ${BOLD}Use nvm${NC} — https://github.com/nvm-sh/nvm"
      warn "     (The installer will attempt this automatically)"
      warn "  4. ${BOLD}Direct binary download${NC}"
      warn "     (The installer will attempt this as a last resort)"
      printf "\n"
    fi
  fi
}

# ── SSL Diagnostics ─────────────────────────────────────────────────────────
check_ssl() {
  info "Checking SSL/TLS connectivity..."

  if find_working_curl; then
    success "SSL/TLS connection to GitHub verified"
    return 0
  fi

  printf "\n"
  failure "Cannot establish a secure connection to GitHub"
  printf "\n"
  warn "Your system's SSL/TLS libraries are too old to connect to GitHub."
  warn "GitHub requires TLS 1.2 or higher."
  printf "\n"

  if [[ "$DETECTED_OS" == "macos" ]]; then
    # Show the system's LibreSSL / OpenSSL version for diagnostics
    local ssl_version
    ssl_version="$(curl --version 2>/dev/null | head -1 || echo "unknown")"
    info "System curl: $ssl_version"
    printf "\n"

    warn "${BOLD}To fix this SSL error, try one of these:${NC}"
    printf "\n"
    warn "  Option A — Install a newer curl via MacPorts:"
    warn "    1. Install MacPorts from https://www.macports.org"
    warn "    2. Run: sudo port install curl"
    warn "    3. Re-run this installer"
    printf "\n"
    warn "  Option B — Upgrade macOS:"
    warn "    macOS 10.13 (High Sierra) or later includes TLS 1.2 support"
    printf "\n"
    warn "  Option C — Install curl from source with OpenSSL:"
    warn "    This is advanced — see https://curl.se/docs/install.html"
    printf "\n"
  else
    warn "Please update your system's curl and OpenSSL packages."
    warn "  On Debian/Ubuntu: sudo apt-get update && sudo apt-get install curl"
    warn "  On RHEL/CentOS:   sudo yum update curl"
  fi

  return 1
}

# ── Node.js Detection & Installation ────────────────────────────────────────
NODE_CMD=""

detect_node() {
  # Try to find a working node binary
  local candidates=(
    "node"
    "/usr/local/bin/node"
    "$HOME/.nvm/versions/node/*/bin/node"
    "/opt/local/bin/node"           # MacPorts
    "$HOME/.local/bin/node"
  )

  for candidate in "${candidates[@]}"; do
    # Handle glob expansion
    for bin in $candidate; do
      if [[ -x "$bin" ]] 2>/dev/null; then
        # Verify it actually runs (catches dyld errors)
        local ver
        if ver="$("$bin" --version 2>/dev/null)"; then
          local major
          major="$(echo "$ver" | sed 's/^v//' | cut -d. -f1)"
          if (( major >= MIN_NODE_MAJOR )); then
            NODE_CMD="$bin"
            success "Node.js $ver found at $bin"
            return 0
          else
            info "Node.js $ver found at $bin (need v${MIN_NODE_MAJOR}+, will upgrade)"
          fi
        else
          log_verbose "Node binary at $bin exists but cannot execute (dyld error?)"
        fi
      fi
    done
  done

  return 1
}

install_node_homebrew() {
  if ! version_gte "$MACOS_VERSION" "$MIN_MACOS_HOMEBREW"; then
    log_verbose "macOS $MACOS_VERSION too old for Homebrew, skipping"
    return 1
  fi

  if ! command -v brew &>/dev/null; then
    log_verbose "Homebrew not installed, skipping"
    return 1
  fi

  info "Installing Node.js v${MIN_NODE_MAJOR} via Homebrew..."
  if brew install "node@${MIN_NODE_MAJOR}" 2>/dev/null; then
    brew link --force --overwrite "node@${MIN_NODE_MAJOR}" 2>/dev/null || true
    success "Node.js installed via Homebrew"
    return 0
  fi

  failure "Homebrew node installation failed"
  return 1
}

install_node_macports() {
  if ! command -v port &>/dev/null; then
    log_verbose "MacPorts not installed, skipping"
    return 1
  fi

  info "Installing Node.js via MacPorts..."
  if sudo port install nodejs22 2>/dev/null; then
    success "Node.js installed via MacPorts"
    return 0
  fi

  failure "MacPorts node installation failed"
  return 1
}

install_node_nvm() {
  info "Attempting Node.js installation via nvm..."

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

  # Install nvm if not present
  if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    info "Installing nvm..."
    local nvm_install_url="https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh"
    local tmp_script
    tmp_script="$(mktemp)"

    if safe_download "$nvm_install_url" "$tmp_script"; then
      bash "$tmp_script" 2>/dev/null
      rm -f "$tmp_script"
    else
      rm -f "$tmp_script"
      failure "Could not download nvm installer (SSL error?)"
      return 1
    fi
  fi

  # Load nvm
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck disable=SC1091
    source "$NVM_DIR/nvm.sh"
  else
    failure "nvm installation not found"
    return 1
  fi

  if nvm install "$MIN_NODE_MAJOR" 2>/dev/null; then
    nvm use "$MIN_NODE_MAJOR" 2>/dev/null
    success "Node.js installed via nvm"
    return 0
  fi

  failure "nvm node installation failed"
  return 1
}

install_node_direct() {
  info "Attempting direct Node.js binary download..."

  local node_arch=""
  case "$ARCH" in
    x86_64)  node_arch="x64" ;;
    arm64)   node_arch="arm64" ;;
    aarch64) node_arch="arm64" ;;
    *)
      failure "Unsupported architecture: $ARCH"
      return 1
      ;;
  esac

  local platform=""
  case "$DETECTED_OS" in
    macos) platform="darwin" ;;
    linux) platform="linux" ;;
    *)
      failure "Direct download not supported on $DETECTED_OS"
      return 1
      ;;
  esac

  local filename="node-v${NODE_FALLBACK_VERSION}-${platform}-${node_arch}.tar.gz"
  local download_url="https://nodejs.org/dist/v${NODE_FALLBACK_VERSION}/${filename}"
  local tmp_dir
  tmp_dir="$(mktemp -d)"

  info "Downloading Node.js v${NODE_FALLBACK_VERSION}..."

  if safe_download "$download_url" "$tmp_dir/$filename"; then
    info "Extracting..."
    tar -xzf "$tmp_dir/$filename" -C "$tmp_dir" 2>/dev/null

    local extracted_dir="$tmp_dir/node-v${NODE_FALLBACK_VERSION}-${platform}-${node_arch}"

    if [[ -d "$extracted_dir" ]]; then
      # Install to /usr/local or user-local directory
      local target_dir="$INSTALL_DIR"
      if [[ -w "$target_dir/bin" ]]; then
        cp -f "$extracted_dir/bin/node" "$target_dir/bin/"
        cp -f "$extracted_dir/bin/npm" "$target_dir/bin/" 2>/dev/null || true
        cp -f "$extracted_dir/bin/npx" "$target_dir/bin/" 2>/dev/null || true
        cp -rf "$extracted_dir/lib/node_modules" "$target_dir/lib/" 2>/dev/null || true
      else
        info "Need sudo to install to $target_dir"
        sudo cp -f "$extracted_dir/bin/node" "$target_dir/bin/"
        sudo cp -f "$extracted_dir/bin/npm" "$target_dir/bin/" 2>/dev/null || true
        sudo cp -f "$extracted_dir/bin/npx" "$target_dir/bin/" 2>/dev/null || true
        sudo cp -rf "$extracted_dir/lib/node_modules" "$target_dir/lib/" 2>/dev/null || true
      fi

      rm -rf "$tmp_dir"
      success "Node.js v${NODE_FALLBACK_VERSION} installed to $target_dir"
      return 0
    fi
  fi

  rm -rf "$tmp_dir"
  failure "Direct Node.js download failed"
  return 1
}

install_node() {
  info "Node.js v${MIN_NODE_MAJOR}+ required, installing..."

  # Try methods in order of preference
  if [[ "$DETECTED_OS" == "macos" ]]; then
    install_node_homebrew && return 0
    install_node_macports && return 0
    install_node_nvm && return 0
    install_node_direct && return 0
  elif [[ "$DETECTED_OS" == "linux" ]]; then
    install_node_nvm && return 0
    install_node_direct && return 0
  fi

  printf "\n"
  failure "Could not install Node.js automatically"
  printf "\n"
  warn "Please install Node.js v${MIN_NODE_MAJOR}+ manually:"
  warn "  https://nodejs.org/en/download/"
  warn ""
  warn "Or use a version manager:"
  warn "  nvm:  https://github.com/nvm-sh/nvm"
  warn "  fnm:  https://github.com/Schniz/fnm"
  printf "\n"
  return 1
}

# ── gum (optional pretty output) ────────────────────────────────────────────
install_gum() {
  if command -v gum &>/dev/null; then
    log_verbose "gum already available"
    return 0
  fi

  local gum_url="https://github.com/charmbracelet/gum/releases/latest/download/gum_$(uname -s)_$(uname -m).tar.gz"
  local tmp_dir
  tmp_dir="$(mktemp -d)"

  if safe_download "$gum_url" "$tmp_dir/gum.tar.gz" 2>/dev/null; then
    tar -xzf "$tmp_dir/gum.tar.gz" -C "$tmp_dir" 2>/dev/null
    if [[ -f "$tmp_dir/gum" ]]; then
      chmod +x "$tmp_dir/gum"
      if [[ -w "/usr/local/bin" ]]; then
        mv "$tmp_dir/gum" /usr/local/bin/gum
      fi
      success "gum installed"
    fi
  else
    info "gum skipped (download failed — non-critical)"
  fi

  rm -rf "$tmp_dir"
}

# ── OpenClaw Installation ───────────────────────────────────────────────────
install_openclaw() {
  local npm_cmd=""

  # Find npm
  for candidate in npm /usr/local/bin/npm "$HOME/.nvm/versions/node/*/bin/npm" /opt/local/bin/npm; do
    for bin in $candidate; do
      if [[ -x "$bin" ]] 2>/dev/null && "$bin" --version &>/dev/null; then
        npm_cmd="$bin"
        break 2
      fi
    done
  done

  if [[ -z "$npm_cmd" ]]; then
    failure "npm not found — cannot install OpenClaw"
    return 1
  fi

  info "Installing OpenClaw via npm..."

  local pkg="openclaw"
  if [[ "$OPENCLAW_VERSION" != "latest" ]]; then
    pkg="openclaw@${OPENCLAW_VERSION}"
  fi

  if $npm_cmd install -g "$pkg" 2>&1; then
    success "OpenClaw installed successfully!"
    return 0
  fi

  # Try with sudo
  info "Retrying with sudo..."
  if sudo $npm_cmd install -g "$pkg" 2>&1; then
    success "OpenClaw installed successfully!"
    return 0
  fi

  failure "OpenClaw installation failed"
  return 1
}

# ── Parse arguments ─────────────────────────────────────────────────────────
parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --verbose|-v)
        VERBOSE=1
        ;;
      --version)
        shift
        OPENCLAW_VERSION="${1:-latest}"
        ;;
      --help|-h)
        printf "Usage: install.sh [options]\n"
        printf "\n"
        printf "Options:\n"
        printf "  --verbose, -v     Show detailed output\n"
        printf "  --version VER     Install a specific version (default: latest)\n"
        printf "  --help, -h        Show this help message\n"
        printf "\n"
        printf "Environment variables:\n"
        printf "  OPENCLAW_VERSION       Version to install (default: latest)\n"
        printf "  OPENCLAW_INSTALL_DIR   Installation directory (default: /usr/local)\n"
        printf "\n"
        exit 0
        ;;
      *)
        warn "Unknown option: $1"
        ;;
    esac
    shift
  done
}

# ── Main ─────────────────────────────────────────────────────────────────────
main() {
  parse_args "$@"
  banner

  # Step 0: Detect environment
  detect_os
  success "Detected: $DETECTED_OS"
  if [[ "$DETECTED_OS" == "macos" ]]; then
    check_macos_compat
  fi

  # Step 1: Verify SSL connectivity
  if ! check_ssl; then
    exit 1
  fi

  # Show install plan
  printf "\n"
  printf "  ${BOLD}Install plan${NC}\n"
  printf "  OS: %s" "$DETECTED_OS"
  if [[ -n "$MACOS_VERSION" ]]; then
    printf " (%s)" "$MACOS_VERSION"
  fi
  printf "\n"
  printf "  Arch: %s\n" "$ARCH"
  printf "  Install method: npm\n"
  printf "  Requested version: %s\n" "$OPENCLAW_VERSION"
  printf "\n"

  # Step 2: Try optional gum
  install_gum

  # Step 3: Ensure Node.js
  printf "\n  ${BOLD}[1/3] Preparing environment${NC}\n"

  if ! detect_node; then
    if ! install_node; then
      exit 1
    fi
    # Re-detect after install
    if ! detect_node; then
      failure "Node.js installation succeeded but node binary not found in PATH"
      warn "Try opening a new terminal and re-running the installer"
      exit 1
    fi
  fi

  # Step 4: Install OpenClaw
  printf "\n  ${BOLD}[2/3] Installing OpenClaw${NC}\n"
  if ! install_openclaw; then
    exit 1
  fi

  # Step 5: Verify
  printf "\n  ${BOLD}[3/3] Verifying installation${NC}\n"
  if command -v openclaw &>/dev/null; then
    local installed_ver
    installed_ver="$(openclaw --version 2>/dev/null || echo "unknown")"
    success "OpenClaw $installed_ver is ready!"
  else
    warn "openclaw command not found in PATH"
    warn "You may need to open a new terminal or add npm's global bin to your PATH"
    info "Try: export PATH=\"\$(npm config get prefix)/bin:\$PATH\""
  fi

  printf "\n"
  success "Installation complete! Run 'openclaw' to get started."
  printf "\n"
}

main "$@"
