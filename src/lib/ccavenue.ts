import crypto from 'crypto';

// 1. Get Algorithm based on key length (matches ccavutil.js logic)
// In the kit: if key length is 16 -> aes-128-cbc, if 32 -> aes-256-cbc.
// But the kit ALSO hashes the working key with MD5 first.
// MD5 always produces a 128-bit (16 byte) hash.
// So effectively it's always 'aes-128-cbc' if we follow their exact logic.
function getAlgorithm(keyBase64: Buffer) {
    const key = keyBase64;
    switch (key.length) {
        case 16:
            return 'aes-128-cbc';
        case 32:
            return 'aes-256-cbc';
        default:
            throw new Error('Invalid key length: ' + key.length);
    }
}

// 2. Encryption
export function encrypt(plainText: string, workingKey: string): string {
    // Generate MD5 hash for the working key
    const m = crypto.createHash('md5');
    m.update(workingKey);
    const key = m.digest(); // Buffer of 16 bytes

    // Initializing Vector (fixed as per their kit)
    const iv = Buffer.from([
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f
    ]);

    const algorithm = getAlgorithm(key);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// 3. Decryption
export function decrypt(encText: string, workingKey: string): string {
    // Generate MD5 hash for the working key
    const m = crypto.createHash('md5');
    m.update(workingKey);
    const key = m.digest(); // Buffer of 16 bytes

    // Initializing Vector
    const iv = Buffer.from([
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f
    ]);

    const algorithm = getAlgorithm(key);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
