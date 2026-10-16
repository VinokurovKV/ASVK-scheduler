export type AppRole = 'GROUP_LEADER' | 'OWNER';

export interface UpdateUserAppRolesInput {
  appRoles: AppRole[];
}
