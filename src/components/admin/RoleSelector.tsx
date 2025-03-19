
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserRole } from '@/contexts/UserRoleContext';
import { getAllRoles, Role } from '@/utils/roles';

const RoleSelector = () => {
  const { currentRole, changeRole } = useUserRole();
  const allRoles = getAllRoles();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Role:</span>
      <Select value={currentRole} onValueChange={(value) => changeRole(value as Role)}>
        <SelectTrigger className="h-8 w-[180px]">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {allRoles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelector;
