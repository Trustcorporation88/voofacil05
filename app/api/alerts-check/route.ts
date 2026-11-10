export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import webpush from "web-push";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails("mailto:contato@vooscortex.com.br", publicKey, privateKey);
  return true;
}

async function sendAlertEmail(toEmail: string, origin: string, destination: string, price: number, targetPrice: number) {
  try {
    const client = getResendClient();
    if (!client) return;

    await client.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: toEmail,
      subject: `✈️ Voofacil: Preço baixou! ${origin} → ${destination} por R$${Math.round(price)}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#1a56db;margin-bottom:8px">✈️ Alerta de Preço - Voofacil</h2>
          <p style="font-size:18px;font-weight:bold;color:#111">
            ${origin} → ${destination}
          </p>
          <p style="font-size:32px;font-weight:bold;color:#16a34a">R$ ${Math.round(price)}</p>
          <p style="color:#555">Seu alvo era <strong>R$ ${targetPrice}</strong> — o preço chegou lá!</p>
          <a href="https://www.voofacil.online" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Ver passagem agora
          </a>
          <p style="font-size:12px;color:#999;margin-top:24px">Voofacil · voofacil.online</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Resend email error:", err);
  }
}

export async function GET(request: Request) {
  // Se CRON_SECRET estiver definido na Vercel, o cron envia este cabecalho
  // e chamadas externas sao recusadas.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const webPushConfigured = configureWebPush();
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        isActive: true,
        OR: [
          { lastChecked: null },
          { lastChecked: { lte: new Date(Date.now() - 30 * 60 * 1000) } },
        ],
      },
      include: { user: true },
      take: 20,
    });

    const results = [];
    let notificationsCreated = 0;
    let pushesSent = 0;

    for (const alert of activeAlerts) {
      try {
        const token = process.env.TRAVELPAYOUTS_TOKEN;
        if (!token) continue;

        const url = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
        url.searchParams.append("origin", alert.origin);
        url.searchParams.append("destination", alert.destination);
        url.searchParams.append("currency", alert.currency);
        url.searchParams.append("token", token);
        url.searchParams.append("limit", "5");
        url.searchParams.append("sorting", "price");

        const res = await fetch(url.toString(), {
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const lowestPrice = Math.min(
              ...data.data.map((f: any) => f.value || f.price || Infinity)
            );

            await prisma.priceAlert.update({
              where: { id: alert.id },
              data: { lastChecked: new Date(), lastPrice: lowestPrice },
            });

            if (lowestPrice <= alert.targetPrice) {
              await prisma.priceAlert.update({
                where: { id: alert.id },
                data: { isActive: false },
              });

              const msg = `Preço caiu! ${alert.origin} → ${alert.destination}: R$${lowestPrice?.toFixed(0) || "?"} (alvo: R$${alert.targetPrice})`;
              await prisma.notification.create({
                data: {
                  userId: alert.userId,
                  alertId: alert.id,
                  message: msg,
                },
              });
              notificationsCreated++;

              const pushSub = await prisma.pushSubscription.findUnique({
                where: { userId: alert.userId },
              });

              if (webPushConfigured && pushSub?.endpoint) {
                try {
                  await webpush.sendNotification(
                    {
                      endpoint: pushSub.endpoint,
                      keys: { p256dh: pushSub.p256dh, auth: pushSub.auth },
                    },
                    JSON.stringify({
                      title: "✈️ Preço Baixou!",
                      body: `${alert.origin} → ${alert.destination}: R$${Math.round(lowestPrice)} (alvo: R$${alert.targetPrice})`,
                      tag: `alert-${alert.id}`,
                      url: "https://www.voofacil.online",
                    })
                  );
                  pushesSent++;
                } catch (pushErr: any) {
                  if (pushErr.statusCode === 410) {
                    await prisma.pushSubscription.delete({
                      where: { userId: alert.userId },
                    });
                  }
                }
              }

              // Send email to user
              const userEmail = alert.user?.email || process.env.ALERT_EMAIL_FALLBACK;
              if (userEmail) {
                await sendAlertEmail(userEmail, alert.origin, alert.destination, lowestPrice, alert.targetPrice);
              }

              results.push({
                alertId: alert.id,
                route: `${alert.origin} → ${alert.destination}`,
                targetPrice: alert.targetPrice,
                currentPrice: lowestPrice,
                triggered: true,
                pushSent: !!pushSub?.endpoint,
              });
            } else {
              results.push({
                alertId: alert.id,
                route: `${alert.origin} → ${alert.destination}`,
                targetPrice: alert.targetPrice,
                currentPrice: lowestPrice,
                triggered: false,
              });
            }
          }
        }
      } catch (err) {
        console.error(`Erro ao verificar alerta ${alert.id}:`, err);
      }
    }

    return NextResponse.json({
      checked: activeAlerts.length,
      notificationsCreated,
      pushesSent,
      results,
    });
  } catch (error) {
    console.error("Erro ao verificar alertas:", error);
    return NextResponse.json({ error: "Erro ao verificar alertas" }, { status: 500 });
  }
}

