import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Users, 
  Activity, 
  Download,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import roleService from '../../services/roleService';
import auditService from '../../services/auditService';

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditStats, setAuditStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    action: '',
    resource: '',
    success: '',
    startDate: '',
    endDate: ''
  });

  // Form state for role creation/editing
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {},
    isDefault: false
  });

  const modules = roleService.getAvailableModules();
  const actions = roleService.getAvailableActions();
  const moduleDescriptions = roleService.getModuleDescriptions();
  const actionDescriptions = roleService.getActionDescriptions();

  useEffect(() => {
    loadRoles();
    loadAuditLogs();
    loadAuditStats();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getRoles({ search: searchTerm });
      setRoles(response.data);
    } catch (error) {
      toast.error('Failed to load roles');
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.getAuditLogs(auditFilters);
      setAuditLogs(response.data);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      const response = await auditService.getAuditStats();
      setAuditStats(response.data);
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  };

  const handleCreateRole = async () => {
    try {
      setLoading(true);
      
      // Convert permissions object to array format
      const permissionsArray = Object.entries(roleForm.permissions)
        .filter(([module, actions]) => actions.length > 0)
        .map(([module, actions]) => ({
          module,
          actions: Array.from(actions)
        }));

      await roleService.createRole({
        ...roleForm,
        permissions: permissionsArray
      });

      toast.success('Role created successfully');
      setIsCreateDialogOpen(false);
      resetRoleForm();
      loadRoles();
    } catch (error) {
      toast.error('Failed to create role');
      console.error('Error creating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    try {
      setLoading(true);
      
      // Convert permissions object to array format
      const permissionsArray = Object.entries(roleForm.permissions)
        .filter(([module, actions]) => actions.length > 0)
        .map(([module, actions]) => ({
          module,
          actions: Array.from(actions)
        }));

      await roleService.updateRole(selectedRole._id, {
        ...roleForm,
        permissions: permissionsArray
      });

      toast.success('Role updated successfully');
      setIsEditDialogOpen(false);
      resetRoleForm();
      loadRoles();
    } catch (error) {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      setLoading(true);
      await roleService.deleteRole(roleId);
      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error) {
      toast.error('Failed to delete role');
      console.error('Error deleting role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    
    // Convert permissions array to object format for form
    const permissionsObj = {};
    role.permissions.forEach(perm => {
      permissionsObj[perm.module] = new Set(perm.actions);
    });

    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: permissionsObj,
      isDefault: role.isDefault
    });
    
    setIsEditDialogOpen(true);
  };

  const handleViewRole = (role) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: {},
      isDefault: false
    });
    setSelectedRole(null);
  };

  const handlePermissionChange = (module, action, checked) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked 
          ? [...(prev.permissions[module] || []), action]
          : (prev.permissions[module] || []).filter(a => a !== action)
      }
    }));
  };

  const handleExportAuditLogs = async () => {
    try {
      const blob = await auditService.exportAuditLogs(auditFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export audit logs');
      console.error('Error exporting audit logs:', error);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and view audit logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadRoles();
              loadAuditLogs();
              loadAuditStats();
            }}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Permissions Matrix
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Roles Management</CardTitle>
                  <CardDescription>
                    Create, edit, and manage user roles and their permissions
                  </CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Define a new role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                          id="name"
                          value={roleForm.name}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter role name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={roleForm.description}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter role description"
                        />
                      </div>
                      <div>
                        <Label>Permissions</Label>
                        <div className="border rounded-lg p-4 space-y-4">
                          {modules.map(module => (
                            <div key={module} className="space-y-2">
                              <div className="font-medium text-sm">
                                {module.charAt(0).toUpperCase() + module.slice(1)}
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {moduleDescriptions[module]}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {actions.map(action => (
                                  <div key={action} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${module}-${action}`}
                                      checked={(roleForm.permissions[module] || []).includes(action)}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(module, action, checked)
                                      }
                                    />
                                    <Label 
                                      htmlFor={`${module}-${action}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {action.charAt(0).toUpperCase() + action.slice(1)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isDefault"
                          checked={roleForm.isDefault}
                          onCheckedChange={(checked) => 
                            setRoleForm(prev => ({ ...prev, isDefault: checked }))
                          }
                        />
                        <Label htmlFor="isDefault">Default Role</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRole} disabled={loading}>
                        Create Role
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role._id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((perm, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {perm.module}: {perm.actions.length} actions
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isDefault ? "default" : "outline"}>
                          {role.isDefault ? "Default" : "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRole(role)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!role.isDefault && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRole(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRole(role._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>
                Overview of all roles and their permissions across modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      {modules.map(module => (
                        <TableHead key={module} className="text-center">
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        {modules.map(module => {
                          const permission = role.permissions.find(p => p.module === module);
                          const actionCount = permission ? permission.actions.length : 0;
                          return (
                            <TableCell key={module} className="text-center">
                              {actionCount > 0 ? (
                                <Badge variant="secondary">
                                  {actionCount} actions
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditStats.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{auditStats.successful || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{auditStats.failed || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditStats.successRate || 0}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>
                    Track all system activities and security events
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportAuditLogs}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select
                  value={auditFilters.action}
                  onValueChange={(value) => setAuditFilters(prev => ({ ...prev, action: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    {auditService.getAvailableActions().map(action => (
                      <SelectItem key={action} value={action}>
                        {action.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={auditFilters.resource}
                  onValueChange={(value) => setAuditFilters(prev => ({ ...prev, resource: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Resources</SelectItem>
                    {auditService.getAvailableResources().map(resource => (
                      <SelectItem key={resource} value={resource}>
                        {resource.charAt(0).toUpperCase() + resource.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={auditFilters.success}
                  onValueChange={(value) => setAuditFilters(prev => ({ ...prev, success: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Successful</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={loadAuditLogs}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        {auditService.formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {log.resource}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={log.success ? "default" : "destructive"}
                        >
                          {auditService.getStatusIcon(log.success)}
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Role Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Details: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              {selectedRole?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  {modules.map(module => {
                    const permission = selectedRole.permissions.find(p => p.module === module);
                    return (
                      <div key={module} className="space-y-2">
                        <div className="font-medium text-sm">
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                          <span className="text-muted-foreground ml-2 text-xs">
                            {moduleDescriptions[module]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {permission ? (
                            permission.actions.map(action => (
                              <Badge key={action} variant="secondary" className="text-xs">
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No permissions</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Modify role permissions and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="border rounded-lg p-4 space-y-4">
                {modules.map(module => (
                  <div key={module} className="space-y-2">
                    <div className="font-medium text-sm">
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                      <span className="text-muted-foreground ml-2 text-xs">
                        {moduleDescriptions[module]}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {actions.map(action => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${module}-${action}`}
                            checked={(roleForm.permissions[module] || []).includes(action)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module, action, checked)
                            }
                          />
                          <Label 
                            htmlFor={`edit-${module}-${action}`}
                            className="text-sm cursor-pointer"
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={loading}>
              Update Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPermissions; 