import type { Enums, Tables } from "./db.generated";

// Core entity types

export type TeamMembership = Tables<"team_memberships"> & {
  user: Tables<"users">;
};

export type User = Tables<"users">;
export type Team = Tables<"teams">;
export type TeamMemberRoleType = Enums<"team_role">;
export type TeamInvitation = Tables<"team_invitations">;

export type {
  Database,
  Tables,
  TablesUpdate,
  Enums,
  Json,
} from "./db.generated";
