import { QuickDB } from "quick.db";
const filePath = rootTo("localdb.sqlite");
const db = {
    guilds: new QuickDB({ filePath, table: "guilds" }),
    members: new QuickDB({ filePath, table: "members" })
};
export { db };
