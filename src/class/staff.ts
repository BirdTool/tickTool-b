import { Interaction } from "discord.js";
import { db } from "#database";

export default class Staff {
    private interaction: Interaction
    constructor(interaction: Interaction) {
        this.interaction = interaction;
    }
    async hasPosition(id: string, options: { positionAbsolute?: boolean, positionChoiced: "owner" | "moderator" | "admin" | "superAdmin" } = { positionChoiced: "moderator" }): Promise<boolean> {
        const guildId = this.interaction.guildId;
        if (!guildId) {
            console.log("Guild ID não encontrado");
            return false;
        }
    
        // Verificar se o usuário é o dono do servidor
        const isOwner = await db.guilds.get<string>("owner") || null;
        
        if (isOwner === id) return true;
    
        // Obter as roles do usuário
        const member = this.interaction.client.guilds.cache.get(guildId)?.members.cache.get(id);
        const usersRoles = member?.roles.cache.map(r => r.id) || [];
    
        // Carregar as roles do banco de dados
        const superAdminRoles = await db.guilds.get<string[]>("superAdminRoles") || [];
        const adminRoles = await db.guilds.get<string[]>("adminRoles") || [];
        const modRoles = await db.guilds.get<string[]>("modRoles") || [];

        // Função auxiliar para verificar se o usuário tem uma role específica
        const hasRole = (roleArray: string[], userRoles: string[]): boolean => {
            const hasAny = userRoles.some(role => roleArray.includes(role));
            return hasAny;
        };
    
        let result = false;
    
        // Se positionAbsolute for true, verificar apenas o cargo especificado
        if (options.positionAbsolute) {
            switch (options.positionChoiced) {
                case "owner":
                    result = isOwner === id;
                    break;
                case "superAdmin":
                    result = hasRole(superAdminRoles, usersRoles);
                    break;
                case "admin":
                    result = hasRole(adminRoles, usersRoles);
                    break;
                case "moderator":
                    result = hasRole(modRoles, usersRoles);
                    break;
            }
        } else {
            // Se positionAbsolute for false, verificar o cargo especificado ou superior
            switch (options.positionChoiced) {
                case "moderator":
                    result = hasRole(modRoles, usersRoles) || 
                             hasRole(adminRoles, usersRoles) || 
                             hasRole(superAdminRoles, usersRoles);
                    break;
                case "admin":
                    result = hasRole(adminRoles, usersRoles) || 
                             hasRole(superAdminRoles, usersRoles);
                    break;
                case "superAdmin":
                    result = hasRole(superAdminRoles, usersRoles);
                    break;
                case "owner":
                    result = isOwner === id;
                    break;
            }
        }
        return result;
    }
     
    async getPosition(id: string): Promise<string | null> {
        // Carregar as roles uma vez
        const roles = {
            superAdminRoles: new Set(await db.guilds.get<string[]>("superAdminRoles") || []),
            adminRoles: new Set(await db.guilds.get<string[]>("adminRoles") || []),
            modRoles: new Set(await db.guilds.get<string[]>("modRoles") || [])
        };
    
        const guildId = this.interaction.guildId;
        if (!guildId) return null;
    
        // Obter as roles do usuário
        const usersRoles = this.interaction.client.guilds.cache.get(guildId)?.members.cache.get(id)?.roles.cache.map(r => r.id) || [];
    
        // Função auxiliar para verificar se o usuário tem uma role específica
        const hasRole = (roleSet: Set<string>, userRoles: string[]): boolean => {
            return userRoles.some(role => roleSet.has(role));
        };
    
        // Verificar as roles em ordem de prioridade
        if (hasRole(roles.superAdminRoles, usersRoles)) {
            return "superAdmin";
        } else if (hasRole(roles.adminRoles, usersRoles)) {
            return "admin";
        } else if (hasRole(roles.modRoles, usersRoles)) {
            return "mod";
        }
    
        return null;
    }
    async add(role: "superAdmin" | "admin" | "moderator", newRole: string) { // adicionar um ou vários staffs
        let roles: string[] = [];
        if (role === "superAdmin") roles = await db.guilds.get("superAdminRoles") || [];
        if (role === "admin") roles = await db.guilds.get("adminRoles") || [];
        if (role === "moderator") roles = await db.guilds.get("modRoles") || [];

        roles.push(newRole)

        db.guilds.set(role, roles);

        return "Staff added";
    }
    async remove(role: string) { // remover vários staffs
        const roles = {
            superAdminRoles: await db.guilds.get<string[]>("superAdminRoles") || [],
            adminRoles: await db.guilds.get<string[]>("adminRoles") || [],
            modRoles: await db.guilds.get<string[]>("modRoles") || []
        }

        roles.superAdminRoles = roles.superAdminRoles.filter(currentRole => currentRole !== role);
        roles.adminRoles = roles.adminRoles.filter(currentRole => currentRole !== role);
        roles.modRoles = roles.modRoles.filter(currentRole => currentRole !== role);

        db.guilds.set("superAdminRoles", roles.superAdminRoles);
        db.guilds.set("adminRoles", roles.adminRoles);
        db.guilds.set("modRoles", roles.modRoles);

        return "Staff removed";
    }
}

/* 
        const configPath = path.resolve(__dirname, '../discord/data/config.json');
        const config: ConfigJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (position === "botOwner") throw new Error("This position is not allowed to be added");
        // adicionar ao cargo escolhido
        if (position === "superAdmin") config.superAdmins.push(...idList);
        if (position === "admin") config.admins.push(...idList);
        if (position === "moderator") config.moderators.push(...idList);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4)); // salvar as alterações
        return "Staff added";
*/