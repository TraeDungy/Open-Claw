#!/usr/bin/env node
/**
 * sync-gateway-device-keys.mjs
 *
 * Ensures every openclaw_gateway Paperclip agent has its Ed25519 public key
 * registered on the VPS. Skips agents that are already synced.
 *
 * Run anytime you add a new gateway agent, or run on a schedule.
 *
 * Usage:
 *   node scripts/sync-gateway-device-keys.mjs
 *
 * Requirements:
 *   - Paperclip running at http://localhost:3100
 *   - SSH key at ~/.ssh/id_ed25519_hetzner
 *   - openssl in PATH
 */

import { spawnSync } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const PAPERCLIP_URL = 'http://localhost:3100'
const VPS_HOST = 'root@5.78.44.176'
const VPS_SSH_KEY = `${process.env.HOME}/.ssh/id_ed25519_hetzner`
const VPS_DEVICES_DIR = '/root/.openclaw/paperclip-devices'
const GATEWAY_URL = 'ws://5.78.44.176/'

function ssh(cmd) {
  const result = spawnSync('ssh', ['-i', VPS_SSH_KEY, '-o', 'StrictHostKeyChecking=no', VPS_HOST, cmd], {
    encoding: 'utf8',
    timeout: 15000,
  })
  if (result.status !== 0) throw new Error(`SSH failed: ${result.stderr}`)
  return result.stdout.trim()
}

async function getAgents() {
  const res = await fetch(`${PAPERCLIP_URL}/api/companies`)
  const companies = await res.json()
  const companyId = companies[0]?.id
  if (!companyId) throw new Error('No Paperclip company found')

  const agentsRes = await fetch(`${PAPERCLIP_URL}/api/companies/${companyId}/agents`)
  return agentsRes.json()
}

function extractPublicKey(privateKeyPem) {
  const tmpPriv = join(tmpdir(), `paperclip-priv-${Date.now()}.pem`)
  const tmpPub = join(tmpdir(), `paperclip-pub-${Date.now()}.pem`)
  try {
    writeFileSync(tmpPriv, privateKeyPem, { mode: 0o600 })
    // Use /usr/local/bin/openssl (Homebrew) — macOS system LibreSSL doesn't support Ed25519
    const opensslBin = existsSync('/usr/local/bin/openssl') ? '/usr/local/bin/openssl' : 'openssl'
    const result = spawnSync(opensslBin, ['pkey', '-in', tmpPriv, '-pubout', '-out', tmpPub], {
      encoding: 'utf8',
      timeout: 5000,
    })
    if (result.status !== 0) throw new Error(`openssl failed: ${result.stderr}`)
    return readFileSync(tmpPub, 'utf8')
  } finally {
    try { unlinkSync(tmpPriv) } catch {}
    try { unlinkSync(tmpPub) } catch {}
  }
}

function getAgentIdFromSessionKey(sessionKey) {
  // Format: "agent:{agentId}:main"
  const match = sessionKey?.match(/^agent:(.+):main$/)
  return match?.[1] ?? null
}

async function main() {
  console.log('🔍 Fetching Paperclip agents...')
  const agents = await getAgents()

  // Find all gateway agents (those with devicePrivateKeyPem + pointing at VPS)
  const gatewayAgents = agents.filter(a => {
    const ac = a.adapterConfig ?? {}
    return ac.devicePrivateKeyPem && ac.url === GATEWAY_URL
  })

  if (gatewayAgents.length === 0) {
    console.log('ℹ️  No openclaw_gateway agents with device keys found.')
    return
  }

  console.log(`Found ${gatewayAgents.length} gateway agent(s): ${gatewayAgents.map(a => a.name).join(', ')}`)

  // Get existing VPS device keys
  let existingKeys = []
  try {
    const lsOut = ssh(`ls ${VPS_DEVICES_DIR}/`)
    existingKeys = lsOut.split('\n').filter(Boolean).map(f => f.replace('.pem', ''))
  } catch (e) {
    console.error('❌ Could not list VPS device keys:', e.message)
    process.exit(1)
  }

  console.log(`VPS has keys for: ${existingKeys.join(', ') || '(none)'}`)

  let synced = 0
  let skipped = 0
  let failed = 0

  for (const agent of gatewayAgents) {
    const ac = agent.adapterConfig
    const agentId = getAgentIdFromSessionKey(ac.sessionKey) ?? agent.name.toLowerCase().replace(/\s+/g, '-')
    const pemName = `${agentId}`

    if (existingKeys.includes(pemName)) {
      console.log(`  ✓ ${agent.name} (${agentId}) — already registered`)
      skipped++
      continue
    }

    console.log(`  ⬆️  ${agent.name} (${agentId}) — registering...`)
    try {
      const pubKey = await extractPublicKey(ac.devicePrivateKeyPem)

      // Write pub key to temp file and scp to VPS
      const tmpPub = join(tmpdir(), `${agentId}-pub-${Date.now()}.pem`)
      writeFileSync(tmpPub, pubKey, { mode: 0o600 })

      const scp = spawnSync('scp', [
        '-i', VPS_SSH_KEY,
        '-o', 'StrictHostKeyChecking=no',
        tmpPub,
        `${VPS_HOST}:${VPS_DEVICES_DIR}/${pemName}.pem`,
      ], { encoding: 'utf8', timeout: 15000 })

      try { unlinkSync(tmpPub) } catch {}

      if (scp.status !== 0) throw new Error(scp.stderr)

      ssh(`chmod 600 ${VPS_DEVICES_DIR}/${pemName}.pem`)
      console.log(`  ✅ ${agent.name} registered successfully`)
      synced++
    } catch (e) {
      console.error(`  ❌ ${agent.name} failed: ${e.message}`)
      failed++
    }
  }

  console.log(`\nSummary: ${synced} synced, ${skipped} already registered, ${failed} failed`)

  if (synced > 0) {
    console.log('\n🔄 Reloading openclaw gateway on VPS...')
    try {
      // Kill existing gateway and restart — NEVER use SIGHUP (it kills the process)
      ssh(`pkill -f openclaw-gateway 2>/dev/null || true; sleep 1; openclaw gateway start --daemon`)
      console.log('✅ Gateway restarted successfully')
    } catch (e) {
      console.warn('⚠️  Gateway restart failed (may need manual restart):', e.message)
      console.warn('   Run: ssh -i ~/.ssh/id_ed25519_hetzner root@5.78.44.176 "openclaw gateway start --daemon"')
    }
  } else {
    console.log('ℹ️  No new keys registered — gateway restart not needed')
  }
}

main().catch(e => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
