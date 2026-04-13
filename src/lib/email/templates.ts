// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Devy</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5F3EE;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#3A5C32;letter-spacing:-0.03em;">Devy</span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF;border-radius:16px;border:1px solid #E8E4DC;padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;font-size:12px;color:#9E9589;line-height:1.6;">
              Devy · Evidence-based support for every child<br/>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devy.ca'}/settings" style="color:#5C8651;text-decoration:none;">Manage your account</a>
              &nbsp;·&nbsp;
              <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devy.ca'}/privacy" style="color:#5C8651;text-decoration:none;">Privacy policy</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Subscription confirmed ───────────────────────────────────────────────────

export function subscriptionConfirmedEmail({
  name,
  planName,
  priceCAD,
  periodEnd,
}: {
  name: string
  planName: string
  priceCAD: number
  periodEnd: string | null
}) {
  const renewalLine = periodEnd
    ? `<p style="margin:0 0 8px;font-size:14px;color:#6B6560;">Your plan renews on <strong>${new Date(periodEnd).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>`
    : ''

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;font-weight:700;color:#1A1916;letter-spacing:-0.02em;">
      You're on ${planName} 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6560;line-height:1.6;">
      Hi ${name}, your subscription is confirmed. You now have full access to everything in the ${planName} plan.
    </p>

    <!-- Plan badge -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5FAF4;border:1px solid #C8DEC4;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#5C8651;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Active plan</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#1A1916;">${planName} — $${priceCAD} CAD/mo</p>
          ${renewalLine}
        </td>
      </tr>
    </table>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devy.ca'}/settings?tab=billing"
       style="display:inline-block;background:#5C8651;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:100px;">
      View billing details →
    </a>
  `
  return layout(body)
}

// ─── Payment failed ───────────────────────────────────────────────────────────

export function paymentFailedEmail({
  name,
  planName,
}: {
  name: string
  planName: string
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;font-weight:700;color:#1A1916;letter-spacing:-0.02em;">
      Payment failed
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6560;line-height:1.6;">
      Hi ${name}, we weren't able to process your payment for the ${planName} plan. Your account is currently at risk of downgrading to the Free plan.
    </p>

    <!-- Warning box -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFF8F0;border:1px solid #E8C4A0;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#B87333;">Action required</p>
          <p style="margin:0;font-size:14px;color:#7A5A2A;line-height:1.6;">
            Please update your payment method to keep your ${planName} access. Stripe will retry your payment automatically, but updating now avoids any interruption.
          </p>
        </td>
      </tr>
    </table>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devy.ca'}/settings?tab=billing"
       style="display:inline-block;background:#B87333;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:100px;">
      Update payment method →
    </a>
  `
  return layout(body)
}

// ─── Subscription canceled ────────────────────────────────────────────────────

export function subscriptionCanceledEmail({
  name,
  planName,
  canceledAt,
}: {
  name: string
  planName: string
  canceledAt: string | null
}) {
  const dateStr = canceledAt
    ? new Date(canceledAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'recently'

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;font-weight:700;color:#1A1916;letter-spacing:-0.02em;">
      Your subscription has ended
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6560;line-height:1.6;">
      Hi ${name}, your ${planName} subscription was canceled on ${dateStr}. Your account has been moved to the Free plan.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#6B6560;line-height:1.6;">
      Your existing child profiles and conversation history are preserved. You can reactivate your subscription anytime from Settings.
    </p>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://devy.ca'}/settings?tab=billing"
       style="display:inline-block;background:#5C8651;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:100px;">
      Reactivate subscription →
    </a>
  `
  return layout(body)
}
