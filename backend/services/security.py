import hashlib
import hmac
import time
import os
import logging
from fastapi import Request, HTTPException
from collections import defaultdict

logger = logging.getLogger("wintercast.security")

# ── Blocked IPs store (in production use Redis) ──────────────────────────────
BLOCKED_IPS = set()
SUSPICIOUS_IPS = defaultdict(int)  # ip -> violation count
REQUEST_LOG = []  # in production use a proper DB

# ── API Key validation ────────────────────────────────────────────────────────
VALID_API_KEYS = set(
    k.strip() for k in os.environ.get("API_KEYS", "").split(",") if k.strip()
)

def validate_api_key(api_key: str | None, ip: str) -> bool:
    """Validate API key for authenticated endpoints."""
    if not VALID_API_KEYS:
        return True  # No keys configured = open (dev mode)
    if not api_key:
        log_security_event("MISSING_API_KEY", ip)
        return False
    if api_key not in VALID_API_KEYS:
        log_security_event("INVALID_API_KEY", ip, {"key_prefix": api_key[:8]})
        return False
    return True

# ── Honeypot ──────────────────────────────────────────────────────────────────
HONEYPOT_PATHS = {
    "/admin", "/wp-admin", "/wp-login.php", "/.env",
    "/api/v1/users", "/phpmyadmin", "/config", "/.git",
    "/api/admin", "/actuator", "/console", "/manager",
}

def check_honeypot(path: str, ip: str) -> bool:
    """Returns True if request hit a honeypot (should be blocked)."""
    clean_path = path.split("?")[0].lower()
    if clean_path in HONEYPOT_PATHS:
        SUSPICIOUS_IPS[ip] += 5  # High severity
        log_security_event("HONEYPOT_HIT", ip, {"path": path})
        if SUSPICIOUS_IPS[ip] >= 5:
            BLOCKED_IPS.add(ip)
            log_security_event("IP_BLOCKED", ip, {"reason": "honeypot"})
        return True
    return False

# ── Request logging ───────────────────────────────────────────────────────────
def log_request(request: Request, status: int, duration_ms: float):
    """Log every request for monitoring."""
    ip = get_client_ip(request)
    entry = {
        "timestamp": time.time(),
        "ip": ip,
        "method": request.method,
        "path": str(request.url.path),
        "status": status,
        "duration_ms": round(duration_ms, 2),
        "user_agent": request.headers.get("user-agent", "")[:100],
    }
    REQUEST_LOG.append(entry)
    if len(REQUEST_LOG) > 1000:
        REQUEST_LOG.pop(0)

    if status >= 400:
        logger.warning(f"[{status}] {ip} {request.method} {request.url.path} ({duration_ms:.0f}ms)")
    else:
        logger.info(f"[{status}] {ip} {request.method} {request.url.path} ({duration_ms:.0f}ms)")

def log_security_event(event: str, ip: str, details: dict = {}):
    """Log security events."""
    logger.warning(f"[SECURITY] {event} from {ip} | {details}")

# ── IP checks ─────────────────────────────────────────────────────────────────
def get_client_ip(request: Request) -> str:
    """Get real client IP, accounting for proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def check_blocked(ip: str):
    """Raise 403 if IP is blocked."""
    if ip in BLOCKED_IPS:
        raise HTTPException(status_code=403, detail="Access denied")

# ── Suspicious behaviour detection ───────────────────────────────────────────
def check_suspicious_headers(request: Request, ip: str):
    """Detect common attack patterns in headers."""
    ua = request.headers.get("user-agent", "").lower()
    suspicious_agents = ["sqlmap", "nikto", "nmap", "masscan", "zgrab", "nuclei"]
    for agent in suspicious_agents:
        if agent in ua:
            SUSPICIOUS_IPS[ip] += 3
            log_security_event("SUSPICIOUS_USER_AGENT", ip, {"agent": ua[:50]})
            BLOCKED_IPS.add(ip)
            raise HTTPException(status_code=403, detail="Access denied")
