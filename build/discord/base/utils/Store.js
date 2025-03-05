export class Store extends Map {
    clearTime;
    get defaultClearTime() {
        return this.clearTime;
    }
    constructor(options = {}) {
        super();
        this.clearTime = options.clearTime;
    }
    set(key, value, options = {}) {
        super.set(key, value);
        if (options.time ?? this.clearTime) {
            setTimeout(() => {
                if (!options.beforeEnd) {
                    this.delete(key);
                    return;
                }
                if (options.beforeEnd()) {
                    this.delete(key);
                    return;
                }
            }, options.time ?? this.clearTime);
        }
        return this;
    }
    get(key, fallback) {
        return super.get(key) ?? fallback;
    }
}
