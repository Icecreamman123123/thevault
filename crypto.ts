// ============================================================
// VaultGuard Crypto Module
// Uses Web Crypto API for AES-256-GCM encryption and PBKDF2
// key derivation. No external crypto libraries needed.
// ============================================================

const PBKDF2_ITERATIONS = 600_000; // OWASP recommended minimum
const SALT_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM
const KEY_LENGTH = 256; // AES-256

// ---- Helpers ----

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// ---- Key Derivation (PBKDF2) ----

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey', 'deriveBits']
  );
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await getKeyMaterial(password);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Derive a separate verification hash so we can check the master password
// without ever storing the password itself
async function deriveVerificationHash(password: string, salt: Uint8Array): Promise<string> {
  const keyMaterial = await getKeyMaterial(password);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS + 1, // different iteration count for separation
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return arrayBufferToBase64(bits);
}

// ---- AES-256-GCM Encrypt / Decrypt ----

async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = generateRandomBytes(IV_LENGTH);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    encoder.encode(plaintext)
  );
  // Prepend IV to ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), iv.length);
  return arrayBufferToBase64(combined.buffer as ArrayBuffer);
}

async function decrypt(ciphertextB64: string, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(base64ToArrayBuffer(ciphertextB64));
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    ciphertext
  );
  const decoder = new TextDecoder();
  return decoder.decode(plainBuffer);
}

// ---- Vault Types ----

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultData {
  entries: PasswordEntry[];
  version: number;
}

interface StoredVault {
  salt: string;
  verificationHash: string;
  encryptedData: string;
}

const STORAGE_KEY = 'vaultguard_vault';

// ---- Public API ----

export function isVaultInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export async function initializeVault(masterPassword: string): Promise<CryptoKey> {
  const salt = generateRandomBytes(SALT_LENGTH);
  const key = await deriveKey(masterPassword, salt);
  const verificationHash = await deriveVerificationHash(masterPassword, salt);

  const emptyVault: VaultData = { entries: [], version: 1 };
  const encryptedData = await encrypt(JSON.stringify(emptyVault), key);

  const stored: StoredVault = {
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    verificationHash,
    encryptedData,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return key;
}

export async function unlockVault(masterPassword: string): Promise<{ key: CryptoKey; data: VaultData }> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('No vault found');

  const stored: StoredVault = JSON.parse(raw);
  const salt = new Uint8Array(base64ToArrayBuffer(stored.salt));

  // Verify password
  const verificationHash = await deriveVerificationHash(masterPassword, salt);
  if (verificationHash !== stored.verificationHash) {
    throw new Error('Invalid master password');
  }

  const key = await deriveKey(masterPassword, salt);
  const decrypted = await decrypt(stored.encryptedData, key);
  const data: VaultData = JSON.parse(decrypted);
  return { key, data };
}

export async function saveVault(key: CryptoKey, data: VaultData): Promise<void> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('No vault found');

  const stored: StoredVault = JSON.parse(raw);
  const encryptedData = await encrypt(JSON.stringify(data), key);
  stored.encryptedData = encryptedData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export async function changeMasterPassword(
  currentPassword: string,
  newPassword: string
): Promise<CryptoKey> {
  const { data } = await unlockVault(currentPassword);
  
  // Re-encrypt with new password
  const newSalt = generateRandomBytes(SALT_LENGTH);
  const newKey = await deriveKey(newPassword, newSalt);
  const newVerificationHash = await deriveVerificationHash(newPassword, newSalt);
  const encryptedData = await encrypt(JSON.stringify(data), newKey);

  const stored: StoredVault = {
    salt: arrayBufferToBase64(newSalt.buffer as ArrayBuffer),
    verificationHash: newVerificationHash,
    encryptedData,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return newKey;
}

export function deleteVault(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Password Generator ----

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function generatePassword(options: GeneratorOptions): string {
  const ambiguousChars = 'Il1O0';
  let charset = '';
  if (options.uppercase) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.excludeAmbiguous) chars = chars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    charset += chars;
  }
  if (options.lowercase) {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (options.excludeAmbiguous) chars = chars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    charset += chars;
  }
  if (options.numbers) {
    let chars = '0123456789';
    if (options.excludeAmbiguous) chars = chars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    charset += chars;
  }
  if (options.symbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (charset.length === 0) charset = 'abcdefghijklmnopqrstuvwxyz';

  const randomValues = generateRandomBytes(options.length);
  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

export function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const maxScore = 8;
  const normalized = Math.min(score / maxScore, 1);

  if (normalized < 0.3) return { score: normalized, label: 'Weak', color: 'bg-red-500' };
  if (normalized < 0.5) return { score: normalized, label: 'Fair', color: 'bg-orange-500' };
  if (normalized < 0.75) return { score: normalized, label: 'Good', color: 'bg-yellow-500' };
  return { score: normalized, label: 'Strong', color: 'bg-green-500' };
}

export function generateId(): string {
  return arrayBufferToBase64(generateRandomBytes(16).buffer as ArrayBuffer)
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 20);
}
