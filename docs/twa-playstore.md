# App Android (TWA) e Play Store

O app Android abre o site `https://www.voofacil.online` em tela cheia, sem barra de endereço.

| Item | Valor |
| --- | --- |
| Application ID (pacote) | `online.voofacil.app` |
| Nome do app | `Voofacil` |
| Domínio | `www.voofacil.online` |
| Ícone | `https://www.voofacil.online/icons/icon-512.png` |
| Ícone de notificação | `https://www.voofacil.online/icon-monochrome.png` |

Importante: o Application ID não pode ser trocado depois que o app é publicado na Play Store.

## 1) Digital Asset Links

O site responde em `https://www.voofacil.online/.well-known/assetlinks.json` com o pacote
`online.voofacil.app` e a impressão digital SHA-256 da chave de assinatura.

- A impressão digital padrão está em `app/.well-known/assetlinks.json/route.ts`.
- Para acrescentar outras (por exemplo, a chave da Play App Signing), use a variável
  `ANDROID_SHA256_CERT_FINGERPRINTS` na Vercel, separadas por vírgula.
- `ANDROID_PACKAGE_NAME` só precisa ser definida se o pacote for diferente de `online.voofacil.app`.

## 2) Atualizar o projeto Android

O projeto em `twa/` já está configurado para Voofacil. Na primeira geração depois desta
mudança, o Bubblewrap pode perguntar se deseja regenerar o projeto porque o
`twa-manifest.json` mudou. Responda **sim**.

```bash
cd twa
npx @bubblewrap/cli update
```

## 3) Gerar o pacote assinado

```bash
cd twa
npx @bubblewrap/cli build
```

Quando pedir, informe o caminho, o alias e as senhas da keystore (`android.keystore`).
Use sempre a mesma keystore: a impressão digital dela precisa bater com a do `assetlinks.json`.

## 4) Play Console

1. Envie o arquivo `.aab`.
2. Preencha os formulários de Segurança dos dados e Conteúdo do app.
3. Se ativar a Play App Signing, copie a impressão digital SHA-256 da chave de assinatura
   do app (em Integridade do app) para `ANDROID_SHA256_CERT_FINGERPRINTS` na Vercel.
4. Confira o status de Deep Links e Digital Asset Links.
5. Comece por uma versão de teste interno.

## 5) Comando útil (impressão digital)

```bash
keytool -list -v -keystore <CAMINHO_DA_KEYSTORE> -alias <ALIAS>
```
