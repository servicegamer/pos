import * as Crypto from 'expo-crypto';

export async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const hashedPlainPassword = await hashPassword(plainPassword);
  return hashedPlainPassword === hashedPassword;
}
