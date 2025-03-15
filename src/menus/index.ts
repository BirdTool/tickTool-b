import { createEmbedMenu, manageFieldsMenu } from "./createEmbed.js";
import { dashboardMenu } from "./dashboard.js";
import { manageEmbedsMenu } from "./manageEmbeds.js";
import { addRoleStaffMenu } from "./manageStaffs/addRoleStaff.js";
import { manageStaffMenu } from "./manageStaffs/manageStaff.js";
import { removeRoleStaffMenu } from "./manageStaffs/removeRoleStaff.js";
import { ticketAddMenu } from "./tickets/ticketAdd.js";
import { ticketsMenu } from "./tickets/tickets.js";
import { tutorialMenu } from "./tutorial.js";

export const menus = {
    createEmbed : createEmbedMenu,
    manageFields: manageFieldsMenu,
    manageEmbeds: manageEmbedsMenu,
    dashBoard: dashboardMenu,
    tickets: ticketsMenu,
    ticketsAdd: ticketAddMenu,
    tutorial: tutorialMenu,
    manageStaffs: manageStaffMenu,
    addStaff: addRoleStaffMenu,
    removeStaff: removeRoleStaffMenu
}