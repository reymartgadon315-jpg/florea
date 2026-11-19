(function() {
    let audioContext = null;
    let enabled = false;

    function updateButton(button, label, isEnabled) {
        button.textContent = label;
        button.setAttribute('aria-pressed', String(isEnabled));
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
            gain.connect(audioContext.destination);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.9);
        });
    }

    function play() {
        if (!enabled || !audioContext || audioContext.state !== 'running') return;
        const now = audioContext.currentTime;
        playBellNote(1046.5, now, 0.13);
        playBellNote(1318.5, now + 0.16, 0.1);
    }

    window.toggleCashierBell = async function(button) {
        if (enabled) {
            enabled = false;
            updateButton(button, '🔕 Bell off', false);
            return;
        }

        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) {
            updateButton(button, 'Sound unavailable', false);
            return;
        }

        try {
            audioContext = audioContext || new AudioContextConstructor();
            await audioContext.resume();
            enabled = audioContext.state === 'running';
            updateButton(button, enabled ? '🔔 Bell on' : '🔔 Enable bell', enabled);
            if (enabled) play();
        } catch (error) {
            console.error('Unable to enable the cashier order bell.', error);
            updateButton(button, '🔔 Enable bell', false);
        }
    };

    window.FloreaCashierSound = { play };
})();