(function() {
    let audioContext = null;
    let outputGain = null;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    let enabled = Boolean(AudioContextConstructor);

    function updateButton(button, label, isEnabled) {
        if (!button) return;
        button.textContent = label;
        button.setAttribute('aria-pressed', String(isEnabled));
    }

    function getAudioContext() {
        if (!AudioContextConstructor) return null;
        if (!audioContext) {
            audioContext = new AudioContextConstructor();
            outputGain = audioContext.createGain();
            outputGain.gain.setValueAtTime(1, audioContext.currentTime);
            outputGain.connect(audioContext.destination);
        }
        return audioContext;
    }

    function setSoundUnavailable(error) {
        console.error('Unable to enable the cashier order bell.', error);
        enabled = false;
        updateButton(document.querySelector('.cashier-bell-toggle'), '🔔 Enable bell', false);
    }

    function resumeAudioFromGesture() {
        if (!enabled || !AudioContextConstructor) return;
        try {
            const context = getAudioContext();
            if (context.state !== 'running') {
                context.resume().catch(setSoundUnavailable);
            }
        } catch (error) {
            setSoundUnavailable(error);
        }
    }

    function playBellNote(frequency, startTime, volume) {
        const partials = [
            { multiplier: 1, gain: volume },
            { multiplier: 2.4, gain: volume * 0.32 },
            { multiplier: 3.8, gain: volume * 0.12 }
        ];

        partials.forEach(partial => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency * partial.multiplier, startTime);
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(partial.gain, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.85);
            oscillator.connect(gain);
            gain.connect(outputGain);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.9);
        });
    }

    function play() {
        if (!enabled || !audioContext || audioContext.state !== 'running') return;
        const now = audioContext.currentTime;
        playBellNote(1046.5, now, 0.65);
        playBellNote(1318.5, now + 0.16, 0.55);
    }

    document.querySelectorAll('.cashier-bell-toggle').forEach(button => {
        updateButton(button, enabled ? '🔔 Bell on' : 'Sound unavailable', enabled);
    });
    document.addEventListener('pointerdown', resumeAudioFromGesture, true);
    document.addEventListener('keydown', resumeAudioFromGesture, true);

    window.toggleCashierBell = async function(button) {
        if (enabled) {
            enabled = false;
            updateButton(button, '🔕 Bell off', false);
            return;
        }

        if (!AudioContextConstructor) {
            updateButton(button, 'Sound unavailable', false);
            return;
        }

        try {
            const context = getAudioContext();
            await context.resume();
            enabled = context.state === 'running';
            updateButton(button, enabled ? '🔔 Bell on' : '🔔 Enable bell', enabled);
            if (enabled) play();
        } catch (error) {
            setSoundUnavailable(error);
        }
    };

    window.FloreaCashierSound = { play };
})();