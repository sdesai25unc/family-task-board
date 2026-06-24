// Generates a VAPID key pair for Web Push, with zero external dependencies.
// Public key -> VITE_VAPID_PUBLIC_KEY (safe in browser).
// Private key -> VAPID_PRIVATE_KEY (server-only secret).
import { generateKeyPairSync } from 'node:crypto'

const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
const jwk = privateKey.export({ format: 'jwk' })

const x = Buffer.from(jwk.x, 'base64url')
const y = Buffer.from(jwk.y, 'base64url')
// Application server key = uncompressed EC point: 0x04 || X || Y, base64url.
const publicKey = Buffer.concat([Buffer.from([0x04]), x, y]).toString('base64url')
const privateK = jwk.d // already base64url, the 32-byte scalar

console.log('VITE_VAPID_PUBLIC_KEY=' + publicKey)
console.log('VAPID_PRIVATE_KEY=' + privateK)
