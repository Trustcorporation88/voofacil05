import { NextResponse } from "next/server";

const DEFAULT_FINGERPRINTS = [
  // Chave de assinatura online.voofacil.app criada em 10/11/2026 (C:\voofacil05\twa\android.keystore).
  "13:E6:BD:8D:58:48:1D:DD:25:C6:D5:66:8B:6A:23:17:38:A6:1A:90:CB:EC:03:66:91:51:DC:DA:B3:66:4B:DE",
];

function getFingerprints() {
  const raw = process.env.ANDROID_SHA256_CERT_FINGERPRINTS ?? "";
  const list = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_FINGERPRINTS, ...list])];
}

export async function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME ?? "online.voofacil.app";

  const payload = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: getFingerprints(),
      },
    },
  ];

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

