import { join } from "node:path";
Object.assign(globalThis, Object.freeze({
    animated: true,
    withResponse: true,
    flags: ["Ephemeral"],
    required: true,
    inline: true,
    disabled: true,
    __rootname: process.cwd(),
    rootTo(...path) {
        return join(process.cwd(), ...path);
    }
}));
