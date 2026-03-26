type AudioHooks = {
  onUnfoldStart?: () => void;
  onUnfoldComplete?: () => void;
  onFoldStart?: () => void;
  onFoldComplete?: () => void;
  onSphereSplit?: () => void;
};

export class AudioManager {
  private readonly hooks: AudioHooks;

  constructor(hooks: AudioHooks = {}) {
    this.hooks = hooks;
  }

  // Placeholder: thay bằng phát file VO thực tế
  onUnfoldStart(): void {
    this.hooks.onUnfoldStart?.();
    // "Be xem nay, khoi tru dang mo ra nhe!"
  }

  // Placeholder: thay bằng phát file VO thực tế
  onUnfoldComplete(): void {
    this.hooks.onUnfoldComplete?.();
    // "Do! Khoi tru mo ra thanh 1 hinh chu nhat va 2 hinh tron!"
  }

  // Placeholder: thay bằng phát file VO thực tế
  onFoldStart(): void {
    this.hooks.onFoldStart?.();
    // "Gio minh cuon lai thanh khoi tru nhe!"
  }

  // Placeholder: thay bằng phát file VO thực tế
  onFoldComplete(): void {
    this.hooks.onFoldComplete?.();
    // "Khoi tru da cuon lai xong roi!"
  }

  // Placeholder: thay bằng phát file VO thực tế
  onSphereSplit(): void {
    this.hooks.onSphereSplit?.();
    // "Qua cau da duoc cat doi roi!"
  }
}
