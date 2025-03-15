import { Interaction } from "discord.js";
import { db } from "#database";

export default class Staff {
    private interaction: Interaction
    constructor(interaction: Interaction) {
        this.interaction = interaction;
    }
    async hasPosition(id: string, options: { positionAbsolute?: boolean, positionChoiced: "owner" | "moderator" | "admin" | "superAdmin" } = { positionChoiced: "moderator" }): Promise<boolean> {
        const guildId = this.interaction.guildId;
        if (!guildId) return false;
    
        // Obter as roles do usuário
        const usersRoles = this.interaction.client.guilds.cache.get(guildId)?.members.cache.get(id)?.roles.cache.map(r => r.id) || [];
    
        // Carregar as roles do banco de dados
        const roles = {
            superAdminRoles: new Set(await db.guilds.get<string[]>("superAdminRoles") || []),
            adminRoles: new Set(await db.guilds.get<string[]>("adminRoles") || []),
            modRoles: new Set(await db.guilds.get<string[]>("modRoles") || [])
        };
    
        // Hierarquia de cargos (do mais alto para o mais baixo)
        const roleHierarchy = ["owner", "superAdmin", "admin", "moderator"];
    
        // Função auxiliar para verificar se o usuário tem uma role específica
        const hasRole = (roleSet: Set<string>, userRoles: string[]): boolean => {
            return userRoles.some(role => roleSet.has(role));
        };
        
        // throw new Error
    
        // Verificar se o usuário tem o cargo especificado ou superior
        if (options.positionAbsolute) {
            // Se positionAbsolute for true, verificar apenas o cargo especificado
            switch (options.positionChoiced) {
                case "owner":
                    // Verificar se o usuário é o dono do servidor
                    const isOwner = await db.guilds.get<string>("owner") || null;
                    return isOwner === id;
                case "superAdmin":
                    return hasRole(roles.superAdminRoles, usersRoles);
                case "admin":
                    return hasRole(roles.adminRoles, usersRoles);
                case "moderator":
                    return hasRole(roles.modRoles, usersRoles);
                default:
                    return false;
            }
        } else {
            // Se positionAbsolute for false, verificar o cargo especificado ou superior
            const positionIndex = roleHierarchy.indexOf(options.positionChoiced);
    
            // Verificar cada cargo na hierarquia, começando do mais alto
            for (let i = 0; i <= positionIndex; i++) {
                const role = roleHierarchy[i];
    
                switch (role) {
                    case "owner":
                        // Verificar se o usuário é o dono do servidor
                        const isOwner = await db.guilds.get<string>("owner") || null;
                        if(isOwner === id) return true
                        break;
                    case "superAdmin":
                        if (hasRole(roles.superAdminRoles, usersRoles)) return true;
                        break;
                    case "admin":
                        if (hasRole(roles.adminRoles, usersRoles)) return true;
                        break;
                    case "moderator":
                        if (hasRole(roles.modRoles, usersRoles)) return true;
                        break;
                }
            }
        }
    
        return false;
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