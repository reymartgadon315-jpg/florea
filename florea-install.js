const installButton = document.getElementById('install-app-button');
const installDialog = document.getElementById('install-app-dialog');
const installIntro = document.getElementById('install-app-intro');
const installSteps = document.getElementById('install-app-steps');
const installNote = document.getElementById('install-app-note');
const closeInstallDialog = document.querySelector('.install-app-dialog__close');
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferredInstallPrompt = null;

if ('serviceWorker' in navigator && window.isSecureContext) {
    let hasController = Boolean(navigator.serviceWorker.controller);
    let isReloadingForUpdate = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hasController) {
            hasController = true;
            return;
        }
        if (isReloadingForUpdate) return;
        isReloadingForUpdate = true;
        window.location.reload();
    });

    navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
        .then(registration => {
            const checkForUpdates = () => {
                if (document.visibilityState !== 'visible') return;
                registration.update().catch(error => {
                    console.error('Unable to check for app updates.', error);
                });
            };

            checkForUpdates();
            document.addEventListener('visibilitychange', checkForUpdates);
        })
        .catch(error => {
            console.error('Unable to register service worker for app updates.', error);
        });
}

if (installButton && installDialog && installIntro && installSteps && installNote && closeInstallDialog) {
    const isInstalled = () =>
        window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

    if (isInstalled()) {
        installButton.hidden = true;
    }

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredInstallPrompt = event;
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        installButton.hidden = true;
    });

    installButton.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
            const promptEvent = deferredInstallPrompt;
            deferredInstallPrompt = null;
            await promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            if (outcome === 'accepted') installButton.hidden = true;
            return;
        }

        const intro = isIOS
            ? 'Add Floréa to your Home Screen for quick access:'
            : 'Install Floréa on your device for quick access:';
        const steps = isIOS
            ? [
                'Open this page in Safari.',
                'Tap the Share button.',
                'Scroll down, tap Add to Home Screen, then tap Add.'
            ]
            : [
                'Open your browser menu.',
                'Choose Install app or Add to Home screen.'
            ];
        const note = isIOS
            ? 'If this page opened inside another app, open it in Safari first.'
            : 'The exact option name may vary by browser.';

        installIntro.textContent = intro;
        installSteps.replaceChildren(...steps.map(step => {
            const item = document.createElement('li');
            item.textContent = step;
            return item;
        }));
        installNote.textContent = note;
        installDialog.showModal();
    });

    closeInstallDialog.addEventListener('click', () => installDialog.close());
    installDialog.addEventListener('click', event => {
        if (event.target === installDialog) installDialog.close();
    });
}
