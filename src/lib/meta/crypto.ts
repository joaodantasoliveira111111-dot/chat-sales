import crypto from 'crypto'

function getKey() {
  const secret = process.env.META_TRACKING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return crypto.createHash('sha256').update(secret || 'chatfy-meta-tracking').digest()
}

export function encryptSecret(value: string) {
  if (!value) return ''
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) return ''
  try {
    const [version, iv, tag, encrypted] = value.split('.')
    if (version !== 'v1' || !iv || !tag || !encrypted) return ''
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    return ''
  }
}
