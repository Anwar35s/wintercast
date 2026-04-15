import re

def detect_chain(address: str) -> str:
    """
    Returns 'evm' or 'solana' based on address format.
    EVM addresses: 0x + 40 hex chars
    Solana addresses: base58, 32-44 chars
    """
    address = address.strip()

    if re.match(r'^0x[a-fA-F0-9]{40}$', address):
        return "evm"

    # Basic Solana check: base58 chars, 32-44 length
    base58_chars = set("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
    if 32 <= len(address) <= 44 and all(c in base58_chars for c in address):
        return "solana"

    raise ValueError(f"Unrecognised address format: {address}")
