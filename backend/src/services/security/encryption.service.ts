import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
  algorithm: string;
  keyVersion: number;
}

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly saltLength = 64; // 512 bits
  private masterKey: Buffer;
  private currentKeyVersion: number = 1;

  constructor(private configService: ConfigService) {
    this.initializeMasterKey();
  }

  private initializeMasterKey(): void {
    const masterKeyBase64 = this.configService.get<string>('MASTER_ENCRYPTION_KEY');
    if (!masterKeyBase64) {
      throw new Error('Master encryption key not configured');
    }
    this.masterKey = Buffer.from(masterKeyBase64, 'base64');
    if (this.masterKey.length !== this.keyLength) {
      throw new Error('Invalid master key length');
    }
  }

  /**
   * Derives a field-specific encryption key using HKDF
   */
  private deriveFieldKey(fieldName: string, salt: Buffer): Buffer {
    const info = Buffer.from(`hr-of-one-${fieldName}-v${this.currentKeyVersion}`, 'utf8');
    return crypto.hkdfSync('sha256', this.masterKey, salt, info, this.keyLength);
  }

  /**
   * Encrypts sensitive data with field-level encryption
   */
  async encryptField(data: string, fieldName: string): Promise<EncryptedData> {
    try {
      // Generate random IV and salt
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);
      
      // Derive field-specific key
      const fieldKey = this.deriveFieldKey(fieldName, salt);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, fieldKey, iv);
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final()
      ]);
      
      // Get auth tag
      const authTag = cipher.getAuthTag();
      
      // Combine salt with encrypted data
      const combined = Buffer.concat([salt, encrypted]);
      
      return {
        encrypted: combined.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        algorithm: this.algorithm,
        keyVersion: this.currentKeyVersion
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts field-level encrypted data
   */
  async decryptField(encryptedData: EncryptedData, fieldName: string): Promise<string> {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedData.encrypted, 'base64');
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const authTag = Buffer.from(encryptedData.authTag, 'base64');
      
      // Extract salt and encrypted data
      const salt = combined.slice(0, this.saltLength);
      const encrypted = combined.slice(this.saltLength);
      
      // Derive field-specific key
      const fieldKey = this.deriveFieldKey(fieldName, salt);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, fieldKey, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypts an entire object with field-level encryption
   */
  async encryptObject(obj: Record<string, any>, sensitiveFields: string[]): Promise<Record<string, any>> {
    const encrypted = { ...obj };
    
    for (const field of sensitiveFields) {
      if (obj[field] !== undefined && obj[field] !== null) {
        encrypted[field] = await this.encryptField(
          typeof obj[field] === 'string' ? obj[field] : JSON.stringify(obj[field]),
          field
        );
      }
    }
    
    return encrypted;
  }

  /**
   * Decrypts an object with encrypted fields
   */
  async decryptObject(obj: Record<string, any>, sensitiveFields: string[]): Promise<Record<string, any>> {
    const decrypted = { ...obj };
    
    for (const field of sensitiveFields) {
      if (obj[field] && typeof obj[field] === 'object' && obj[field].encrypted) {
        const decryptedValue = await this.decryptField(obj[field], field);
        try {
          // Try to parse as JSON first
          decrypted[field] = JSON.parse(decryptedValue);
        } catch {
          // If not JSON, return as string
          decrypted[field] = decryptedValue;
        }
      }
    }
    
    return decrypted;
  }

  /**
   * Generates a secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Hashes sensitive data for indexing/searching
   */
  hashForIndex(data: string, salt?: string): string {
    const actualSalt = salt || this.configService.get<string>('INDEX_SALT');
    return crypto
      .createHmac('sha256', actualSalt)
      .update(data)
      .digest('base64url');
  }

  /**
   * Rotates encryption keys
   */
  async rotateKeys(newMasterKey: string): Promise<void> {
    // This would implement key rotation logic
    // Including re-encryption of existing data
    this.currentKeyVersion++;
    this.masterKey = Buffer.from(newMasterKey, 'base64');
  }

  /**
   * Validates data integrity
   */
  validateIntegrity(data: string, signature: string, key: string): boolean {
    const computedSignature = crypto
      .createHmac('sha256', key)
      .update(data)
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(computedSignature, 'base64')
    );
  }
}