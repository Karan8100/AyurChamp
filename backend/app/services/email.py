"""
Transactional email service powered by Resend.
Sends Ayurvedic-themed OTP verification emails for Ayushya.
"""

import resend

from app.core.config import settings


def _init_resend() -> None:
    """Lazily set the Resend API key from app settings."""
    if settings.resend_api_key:
        resend.api_key = settings.resend_api_key


def generate_otp_html(user_name: str, otp_code: str) -> str:
    """Generates an aesthetic, Ayurvedic-themed HTML email template for Ayushya OTP."""
    display_name = user_name or "Wellness Seeker"
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Ayushya Account</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F6F1E7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

                        <!-- Header Banner -->
                        <tr>
                            <td align="center" style="background-color: #2A4638; padding: 32px 20px;">
                                <h1 style="color: #F6F1E7; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 2px;">AYUSHYA</h1>
                                <p style="color: #C9A876; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Ayurveda, Personalized</p>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 36px 32px; color: #1F2A24;">
                                <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0; color: #2A4638;">Namaste {display_name},</h2>
                                <p style="font-size: 14px; line-height: 22px; color: #526257; margin: 0 0 24px 0;">
                                    Thank you for joining <strong>Ayushya</strong>. Use the verification code below to confirm your email and begin your personalized Prakruti assessment.
                                </p>

                                <!-- OTP Code Box -->
                                <div style="background-color: #F6F1E7; border: 1px dashed #2A4638; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2A4638; display: inline-block;">{otp_code}</span>
                                </div>

                                <p style="font-size: 12px; color: #7A8A80; margin: 0 0 20px 0; text-align: center;">
                                    This code is valid for <strong>5 minutes</strong>. Please do not share it with anyone.
                                </p>

                                <hr style="border: none; border-top: 1px solid #E8E2D5; margin: 24px 0;" />

                                <!-- Dosha Balance Footer Note -->
                                <p style="font-size: 11px; color: #8C9A90; text-align: center; line-height: 16px; margin: 0;">
                                    <span style="color: #6B8FB5;">&bull; Vata</span> &nbsp;
                                    <span style="color: #D89A4C;">&bull; Pitta</span> &nbsp;
                                    <span style="color: #6B9E6B;">&bull; Kapha</span><br/><br/>
                                    If you did not request this email, you can safely ignore it.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def send_otp_email(to_email: str, otp_code: str, user_name: str = "") -> dict:
    """Sends OTP verification email using Resend API.

    Works with the free onboarding domain (onboarding@resend.dev) until
    a custom domain is configured on the Resend dashboard.
    """
    _init_resend()

    if not settings.resend_api_key:
        print("[email] RESEND_API_KEY not set — skipping email send.")
        return {"skipped": True, "reason": "no_api_key"}

    try:
        params: resend.Emails.SendParams = {
            "from": "Ayushya Portal <onboarding@resend.dev>",
            "to": [to_email],
            "subject": f"{otp_code} is your Ayushya verification code",
            "html": generate_otp_html(user_name=user_name, otp_code=otp_code),
        }

        response = resend.Emails.send(params)
        print(f"[email] OTP email sent to {to_email} — id: {response}")
        return {"sent": True, "id": str(response)}
    except Exception as e:
        print(f"[email] Failed to send email via Resend: {e!s}")
        raise e
