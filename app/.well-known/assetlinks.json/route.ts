import { NextResponse } from "next/server";

const DEFAULT_FINGERPRINTS = [
  "4F:6F:57:99:A2:84:E8:B7:B2:AB:56:88:9E:01:8C:44:FA:9F:FE:10:56:EC:3A:E9:B8:A9:93:70:77:00:2B:9A",
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

