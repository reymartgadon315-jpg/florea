import path from 'node:path';
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
    ConsoleLog,
    TwaGenerator,
    TwaManifest
} from '@bubblewrap/core';

const execFileAsync = promisify(execFile);

const root = path.resolve(process.cwd());
const targetDirectory = path.join(root, 'android-twa');
const keystorePath = 'C:\\Users\\THIS PC\\Documents\\florea-android.keystore';
const keystorePassword = process.env.FLOREA_ANDROID_KEYSTORE_PASSWORD;
if (!keystorePassword || keystorePassword.length < 6) {
    throw new Error('Set FLOREA_ANDROID_KEYSTORE_PASSWORD to a password of at least 6 characters.');
}

const manifest = await TwaManifest.fromWebManifest(
    'https://florea.onrender.com/site.webmanifest'
);

manifest.packageId = 'com.florea.customer';
manifest.host = 'florea.onrender.com';
manifest.name = 'Floréa';
manifest.launcherName = 'Floréa';
manifest.themeColor = '#F8F6F0';
manifest.themeColorDark = '#F8F6F0';
manifest.navigationColor = '#F8F6F0';
manifest.navigationColorDark = '#F8F6F0';
manifest.navigationDividerColor = '#F8F6F0';
manifest.navigationDividerColorDark = '#F8F6F0';
manifest.startUrl = '/?view=customer';
manifest.appVersionName = '1.0.1';
manifest.appVersionCode = 2;
manifest.orientation = 'portrait';
manifest.minSdkVersion = 24;
manifest.signingKey = {
    path: keystorePath,
    alias: 'android'
};
manifest.enableNotifications = true;

await fs.mkdir(targetDirectory, { recursive: true });
await manifest.saveToFile(path.join(targetDirectory, 'twa-manifest.json'));

const log = new ConsoleLog('Floréa TWA');
await new TwaGenerator().createTwaProject(targetDirectory, manifest, log);

const keytoolPath = 'C:\\Users\\THIS PC\\AppData\\Local\\bubblewrap-jdk17\\bin\\keytool.exe';
try {
    await fs.access(keystorePath);
} catch {
    await execFileAsync(keytoolPath, [
        '-genkeypair',
        '-dname', 'cn=Reymart G Gamos, ou=Development, o=Floréa, c=PH',
        '-alias', 'android',
        `-keypass`, keystorePassword,
        '-keystore', keystorePath,
        '-storepass', keystorePassword,
        '-validity', '20000',
        '-keyalg', 'RSA'
    ]);
}

console.log(`TWA project created at ${targetDirectory}`);
console.log(`Signing keystore: ${keystorePath}`);
