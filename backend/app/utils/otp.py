import secrets

def generate_otp() -> str:
    """
    Generates a cryptographically secure 6-digit OTP code as a string.
    """
    return "".join(secrets.choice("0123456789") for _ in range(6))
