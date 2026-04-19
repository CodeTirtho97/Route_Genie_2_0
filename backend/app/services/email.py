import resend
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_DEV = settings.ENVIRONMENT == "development"


def _reset_html(reset_url: str, name: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Plus Jakarta Sans', sans-serif; background: #12100A; color: #E8D5B4; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #1C1710; border-radius: 16px; border: 1px solid rgba(245,158,11,0.15); padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: Georgia, serif; color: #F59E0B; font-size: 1.5rem; margin: 0;">RouteGenie</h1>
    </div>
    <h2 style="color: #E8D5B4; font-size: 1.2rem; margin-bottom: 8px;">Reset your password</h2>
    <p style="color: #A08060; font-size: 0.9rem; line-height: 1.6; margin-bottom: 28px;">
      Hi {name}, we received a request to reset your RouteGenie password.
      Click the button below — this link expires in <strong style="color: #E8D5B4;">15 minutes</strong>.
    </p>
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="{reset_url}" style="display: inline-block; background: #F59E0B; color: #12100A; font-weight: 700; font-size: 0.9rem; text-decoration: none; padding: 12px 32px; border-radius: 8px;">
        Reset password
      </a>
    </div>
    <p style="color: #6B4F2C; font-size: 0.78rem; line-height: 1.6; margin: 0;">
      If you didn't request this, you can safely ignore this email. Your password won't change.
    </p>
  </div>
</body>
</html>
"""


async def send_password_reset(email: str, name: str, token: str) -> None:
    reset_url = f"{settings.APP_URL}/reset-password?token={token}"

    if _DEV or not settings.RESEND_API_KEY:
        logger.info("DEV — password reset link", email=email, url=reset_url)
        return

    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send({
        "from":    "RouteGenie <noreply@routegenie.app>",
        "to":      email,
        "subject": "Reset your RouteGenie password",
        "html":    _reset_html(reset_url, name),
    })
    logger.info("Password reset email sent", email=email)
