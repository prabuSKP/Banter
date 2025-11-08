// backend/src/config/coturn.ts
/**
 * COTURN TURN/STUN Server Configuration
 *
 * Production-grade configuration for COTURN server
 * Used for NAT traversal in WebRTC connections
 *
 * COTURN provides:
 * - STUN server for discovering public IP addresses
 * - TURN server for relaying media when direct connection fails
 * - Secure authentication using static secrets
 *
 * @see https://github.com/coturn/coturn
 */

import env from './env';
import logger from './logger';

/**
 * ICE Server Configuration
 * Used by LiveKit clients to establish connections
 */
export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

/**
 * COTURN Server Configuration
 */
export interface CoturnConfig {
  stunServers: IceServer[];
  turnServers: IceServer[];
  allServers: IceServer[];
}

/**
 * Generate TURN credentials using time-limited authentication
 *
 * This implements the TURN REST API authentication mechanism
 * where credentials are valid for a limited time period
 *
 * @param username - Username to generate credentials for
 * @param secret - Shared secret with COTURN server
 * @param ttl - Time to live in seconds (default: 24 hours)
 * @returns TURN credentials
 */
export function generateTurnCredentials(
  username: string,
  secret: string,
  ttl: number = 86400 // 24 hours
): { username: string; credential: string } {
  const crypto = require('crypto');

  // Calculate expiry timestamp
  const expiry = Math.floor(Date.now() / 1000) + ttl;

  // Generate username with expiry (format: timestamp:username)
  const turnUsername = `${expiry}:${username}`;

  // Generate HMAC-SHA1 credential
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(turnUsername);
  const credential = hmac.digest('base64');

  logger.debug('Generated TURN credentials', {
    username: turnUsername,
    expiresAt: new Date(expiry * 1000).toISOString(),
  });

  return {
    username: turnUsername,
    credential,
  };
}

/**
 * Get COTURN Configuration
 *
 * Returns ICE servers configuration for WebRTC clients
 * Includes both STUN and TURN servers
 *
 * @param username - Username for TURN authentication
 * @returns ICE servers configuration
 */
export function getCoturnConfig(username?: string): CoturnConfig {
  try {
    const coturnHost = env.COTURN_HOST || 'turn.banter.app';
    const coturnPort = parseInt(env.COTURN_PORT || '3478');
    const coturnTlsPort = parseInt(env.COTURN_TLS_PORT || '5349');
    const coturnSecret = env.COTURN_SECRET;

    // STUN servers (no authentication required)
    const stunServers: IceServer[] = [
      {
        urls: `stun:${coturnHost}:${coturnPort}`,
      },
      {
        urls: `stun:stun.l.google.com:19302`, // Fallback public STUN
      },
    ];

    // TURN servers (require authentication)
    const turnServers: IceServer[] = [];

    if (coturnSecret && username) {
      const { username: turnUsername, credential } = generateTurnCredentials(
        username,
        coturnSecret
      );

      // UDP TURN
      turnServers.push({
        urls: `turn:${coturnHost}:${coturnPort}?transport=udp`,
        username: turnUsername,
        credential,
      });

      // TCP TURN
      turnServers.push({
        urls: `turn:${coturnHost}:${coturnPort}?transport=tcp`,
        username: turnUsername,
        credential,
      });

      // TLS TURN (secure)
      turnServers.push({
        urls: `turns:${coturnHost}:${coturnTlsPort}?transport=tcp`,
        username: turnUsername,
        credential,
      });
    } else {
      logger.warn('COTURN secret not configured, TURN servers will not be available');
    }

    const config: CoturnConfig = {
      stunServers,
      turnServers,
      allServers: [...stunServers, ...turnServers],
    };

    logger.info('COTURN configuration generated', {
      stunCount: stunServers.length,
      turnCount: turnServers.length,
      totalServers: config.allServers.length,
    });

    return config;
  } catch (error) {
    logger.error('Error generating COTURN config:', error);
    throw error;
  }
}

/**
 * Validate COTURN Configuration
 *
 * Checks if required environment variables are set
 *
 * @returns true if valid, false otherwise
 */
export function validateCoturnConfig(): boolean {
  const required = ['COTURN_HOST', 'COTURN_SECRET'];
  const missing = required.filter(key => !env[key]);

  if (missing.length > 0) {
    logger.warn('COTURN configuration incomplete', {
      missing,
      message: 'TURN servers will not be available',
    });
    return false;
  }

  return true;
}

/**
 * COTURN Server Deployment Configuration
 *
 * This is a reference configuration for deploying COTURN server
 * Save this as /etc/turnserver.conf on your COTURN server
 */
export const COTURN_SERVER_CONFIG = `
# COTURN Server Configuration for Banter
# Production-grade setup for WebRTC TURN/STUN

# Listening ports
listening-port=3478
tls-listening-port=5349

# Relay ports for media
min-port=49152
max-port=65535

# Listening IPs (bind to all interfaces)
listening-ip=0.0.0.0
relay-ip=0.0.0.0

# External IP (set to your server's public IP)
external-ip=YOUR_PUBLIC_IP

# Authentication
use-auth-secret
static-auth-secret=YOUR_TURN_SECRET
realm=banter

# SSL/TLS certificates (required for TURNS)
cert=/path/to/fullchain.pem
pkey=/path/to/privkey.pem

# Logging
log-file=/var/log/turnserver.log
verbose

# Performance and security
total-quota=100
user-quota=12
max-bps=64000

# Fingerprint for security
fingerprint

# Long-term credentials mechanism
lt-cred-mech

# Disable UDP/TCP relay endpoints for specific addresses
no-loopback-peers
no-multicast-peers

# Enable prometheus metrics (optional)
prometheus

# Database for persistent storage (optional)
# userdb=/var/db/turndb
`;

// Export default configuration getter
export default {
  getCoturnConfig,
  generateTurnCredentials,
  validateCoturnConfig,
  COTURN_SERVER_CONFIG,
};
