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

## 2) Chave de assinatura

O projeto espera a chave em `C:\voofacil05\twa\android.keystore` (alias `android`).
Ela não vai para o GitHub (`.gitignore`). Guarde uma cópia da chave e da senha em local
seguro: sem elas não é possível publicar atualizações do app.

Para criar uma chave nova (só antes da primeira publicação):

```powershell
cd C:\voofacil05\twa
$keytool = (Get-ChildItem $HOME\.bubblewrap\jdk -Recurse -Filter keytool.exe | Select-Object -First 1).FullName
& $keytool -genkeypair -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Voofacil, O=Voofacil, C=BR"
& $keytool -list -v -keystore android.keystore -alias android | Select-String SHA256
```

A impressão digital SHA-256 mostrada no último comando vai em `DEFAULT_FINGERPRINTS`
(`app/.well-known/assetlinks.json/route.ts`) ou em `ANDROID_SHA256_CERT_FINGERPRINTS` na Vercel.

## 3) Atualizar o projeto Android

O projeto em `twa/` já está configurado para Voofacil. Na primeira geração depois desta
mudança, o Bubblewrap pode perguntar se deseja regenerar o projeto porque o
`twa-manifest.json` mudou. Responda **sim**.

```bash
cd twa
npx @bubblewrap/cli update
```

## 4) Gerar o pacote assinado

```bash
cd twa
npx @bubblewrap/cli build
```

Quando pedir, informe o caminho, o alias e as senhas da keystore (`android.keystore`).
Use sempre a mesma keystore: a impressão digital dela precisa bater com a do `assetlinks.json`.

### Erros comuns no build

- `Could not reserve enough space for ... object heap`: falta memória para o Gradle.
  Em `twa/gradle.properties`, use `org.gradle.jvmargs=-Xmx1024m` (ou `-Xmx768m`).
  O `bubblewrap update` volta esse valor para 1536m, então confira depois de cada update.
- `minSdkVersion 21 cannot be smaller than version 24`: a biblioteca androidbrowserhelper exige
  Android 7.0. O projeto já usa `minSdkVersion 24`.

## 5) Play Console

1. Envie o arquivo `.aab`.
2. Preencha os formulários de Segurança dos dados e Conteúdo do app.
3. Se ativar a Play App Signing, copie a impressão digital SHA-256 da chave de assinatura
   do app (em Integridade do app) para `ANDROID_SHA256_CERT_FINGERPRINTS` na Vercel.
4. Confira o status de Deep Links e Digital Asset Links.
5. Comece por uma versão de teste interno.

## 6) Comando útil (impressão digital)

```bash
keytool -list -v -keystore <CAMINHO_DA_KEYSTORE> -alias <ALIAS>
```
