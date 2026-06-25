let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/** 新订单提示音：双音短促 beep */
export function playNewOrderSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const playTone = (frequency: number, startAt: number, duration = 0.16) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now);
    playTone(1175, now + 0.2, 0.18);
  } catch {
    // 浏览器可能拦截自动播放，静默失败
  }
}

/** 在用户首次交互时解锁 AudioContext（避免被 autoplay 策略拦截） */
export function unlockOrderNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
  } catch {
    // ignore
  }
}
