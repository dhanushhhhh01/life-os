"""
Encryption at Rest
==================
AES-256 encryption for sensitive database fields.
Uses Fernet (symmetric encryption) from cryptography library.
"""

import os
from cryptography.fernet import Fernet
from sqlalchemy import TypeDecorator, Text


def get_encryption_key() -> bytes:
    """Get encryption key from environment. Generate one if not set (dev only!)."""
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # DEV ONLY: Generate and warn
        key = Fernet.generate_key().decode()
        print(f"⚠️  WARNING: No ENCRYPTION_KEY set. Using temporary key: {key}")
        print("   Set ENCRYPTION_KEY in .env for production!")
    return key.encode() if isinstance(key, str) else key


_fernet = Fernet(get_encryption_key())


class EncryptedString(TypeDecorator):
    """
    SQLAlchemy custom type for encrypted string fields.
    Transparently encrypts on write, decrypts on read.
    """
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """Encrypt before storing in database."""
        if value is None:
            return None
        if isinstance(value, str):
            value = value.encode()
        return _fernet.encrypt(value).decode('utf-8')

    def process_result_value(self, value, dialect):
        """Decrypt when reading from database."""
        if value is None:
            return None
        try:
            return _fernet.decrypt(value.encode()).decode('utf-8')
        except Exception:
            # If decryption fails (wrong key, corrupted data), return None
            return None
