import { createContext, useContext } from "react";

/* Roles:
   - "admin"     → full access
   - "ecommerce" → Dashboard, Orders, Profile only
*/
export const AdminContext = createContext({ profile: null, role: "admin" });

export const useAdmin = () => useContext(AdminContext);

/* Which roles may see each admin section. Absent = everyone. */
export const SECTION_ROLES = {
  merchandise: ["admin"],
  awards:      ["admin"],
  events:      ["admin"],
  flash:       ["admin"],
  users:       ["admin"],
};

export const canAccess = (section, role) =>
  !SECTION_ROLES[section] || SECTION_ROLES[section].includes(role);
