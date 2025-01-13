import { EmbedLimit } from "@magicyan/discord";
export class URLStore {
    url = new URL("https://discord.com");
    get lengthLimit() {
        return EmbedLimit.URL;
    }
    constructor(url) {
        if (url && url.length <= this.lengthLimit) {
            this.url = new URL(url);
        }
    }
    get length() {
        return this.toString().length;
    }
    get record() {
        return Array.from(this.url.searchParams.entries())
            .reduce((params, [key, value]) => Object.assign(params, { [key]: value }), {});
    }
    get(key) {
        return this.url.searchParams.get(key) ?? undefined;
    }
    canBeSet(key, value) {
        const mock = new URL(this.url.toString());
        mock.searchParams.set(key, value);
        return mock.toString().length <= this.lengthLimit;
    }
    set(key, value) {
        const canBeSet = this.canBeSet(key, value.toString());
        if (canBeSet) {
            this.url.searchParams.set(key, value.toString());
        }
        return canBeSet;
    }
    has(key, value) {
        return this.url.searchParams.has(key, value);
    }
    delete(key, value) {
        this.url.searchParams.delete(key, value);
    }
    toString() {
        return this.url.toString();
    }
    toMap() {
        return new Map(this.url.searchParams.entries());
    }
    keys() {
        return this.url.searchParams.keys();
    }
    values() {
        return this.url.searchParams.values();
    }
}
