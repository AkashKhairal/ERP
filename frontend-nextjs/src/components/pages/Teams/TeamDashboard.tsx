'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download,
  UserPlus,
  UserMinus,
  Building,
  MapPin,
  Calendar,
  Target,
  TrendingUp,
  UserCheck,
  Eye,
  Loader2,
  X,
  List,
  Grid
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import teamService, { type Team, type TeamMember, type TeamStats } from '@/services/teamService'

const TeamDashboard = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalTeams: 0,
    activeTeams: 0,
    totalMembers: 0,
    averageTeamSize: 0,
    teamsByDepartment: []
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards')

  // Form state for team creation/editing
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    department: '',
    teamLead: '',
    status: 'active' as 'active' | 'inactive' | 'archived'
  })

  const departments = teamService.getAvailableDepartments()
  const roles = teamService.getAvailableRoles()
  const departmentDescriptions = teamService.getDepartmentDescriptions()

  useEffect(() => {
    loadTeams()
    loadTeamStats()
  }, [])

  const loadTeams = async () => {
    try {
      setLoading(true)
      const response = await teamService.getTeams({ 
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined
      })
      if (response.success) {
        setTeams(response.data)
      } else {
        setTeams(getSampleTeams())
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      setTeams(getSampleTeams())
    } finally {
      setLoading(false)
    }
  }

  const loadTeamStats = async () => {
    try {
      const response = await teamService.getTeamStats()
      if (response.success) {
        setTeamStats(response.data)
      } else {
        setTeamStats(getSampleTeamStats())
      }
    } catch (error) {
      console.error('Error loading team stats:', error)
      setTeamStats(getSampleTeamStats())
    }
  }

  const handleCreateTeam = async () => {
    try {
      setLoading(true)
      const response = await teamService.createTeam(teamForm)
      if (response.success) {
        setIsCreateDialogOpen(false)
        resetTeamForm()
        loadTeams()
        loadTeamStats()
      } else {
        console.error('Failed to create team')
      }
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTeam = async () => {
    if (!selectedTeam?._id) return
    
    try {
      setLoading(true)
      const response = await teamService.updateTeam(selectedTeam._id, teamForm)
      if (response.success) {
        setIsEditDialogOpen(false)
        resetTeamForm()
        loadTeams()
        loadTeamStats()
      } else {
        console.error('Failed to update team')
      }
    } catch (error) {
      console.error('Error updating team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam?._id) return

    try {
      setLoading(true)
      const response = await teamService.deleteTeam(selectedTeam._id)
      if (response.success) {
        setIsDeleteDialogOpen(false)
        setSelectedTeam(null)
        loadTeams()
        loadTeamStats()
      } else {
        console.error('Failed to delete team')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team)
    setTeamForm({
      name: team.name,
      description: team.description,
      department: team.department,
      teamLead: team.teamLead,
      status: team.status
    })
    setIsEditDialogOpen(true)
  }

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team)
    setIsViewDialogOpen(true)
  }

  const handleAddMember = (team: Team) => {
    setSelectedTeam(team)
    setIsAddMemberDialogOpen(true)
  }

  const handleDeleteTeamClick = (team: Team) => {
    setSelectedTeam(team)
    setIsDeleteDialogOpen(true)
  }

  const resetTeamForm = () => {
    setTeamForm({
      name: '',
      description: '',
      department: '',
      teamLead: '',
      status: 'active'
    })
    setSelectedTeam(null)
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchTerm === '' || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || team.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Sample data functions
  const getSampleTeams = (): Team[] => [
    {
      _id: '1',
      name: 'Engineering Team',
      description: 'Core development team for web applications',
      department: 'engineering',
      teamLead: 'John Doe',
      status: 'active',
      members: [
        { user: 'user1', role: 'Team Lead', joinedDate: '2023-01-15', isActive: true },
        { user: 'user2', role: 'Senior Member', joinedDate: '2023-02-01', isActive: true },
        { user: 'user3', role: 'Member', joinedDate: '2023-03-01', isActive: true }
      ],
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z'
    },
    {
      _id: '2',
      name: 'Design Team',
      description: 'UI/UX design and creative assets',
      department: 'design',
      teamLead: 'Sarah Wilson',
      status: 'active',
      members: [
        { user: 'user4', role: 'Team Lead', joinedDate: '2023-02-01', isActive: true },
        { user: 'user5', role: 'Senior Member', joinedDate: '2023-02-15', isActive: true }
      ],
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z'
    },
    {
      _id: '3',
      name: 'Marketing Team',
      description: 'Digital marketing and content strategy',
      department: 'marketing',
      teamLead: 'Mike Johnson',
      status: 'active',
      members: [
        { user: 'user6', role: 'Team Lead', joinedDate: '2023-03-10', isActive: true },
        { user: 'user7', role: 'Member', joinedDate: '2023-03-20', isActive: true }
      ],
      createdAt: '2023-03-10T00:00:00Z',
      updatedAt: '2023-03-10T00:00:00Z'
    }
  ]

  const getSampleTeamStats = (): TeamStats => ({
    totalTeams: 3,
    activeTeams: 3,
    totalMembers: 7,
    averageTeamSize: 2.3,
    teamsByDepartment: [
      { department: 'engineering', count: 1 },
      { department: 'design', count: 1 },
      { department: 'marketing', count: 1 }
    ]
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'engineering':
        return 'bg-blue-100 text-blue-800'
      case 'design':
        return 'bg-purple-100 text-purple-800'
      case 'marketing':
        return 'bg-green-100 text-green-800'
      case 'content':
        return 'bg-orange-100 text-orange-800'
      case 'finance':
        return 'bg-yellow-100 text-yellow-800'
      case 'hr':
        return 'bg-pink-100 text-pink-800'
      case 'operations':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderTeamCard = (team: Team) => (
    <Card key={team._id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <CardDescription className="mt-1">
              {team.description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(team.status)}>
              {team.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Department</span>
            </div>
            <Badge className={getDepartmentColor(team.department)}>
              {team.department.charAt(0).toUpperCase() + team.department.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Team Lead</span>
            </div>
            <span className="text-sm text-muted-foreground">{team.teamLead}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Members</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {team.members.filter(m => m.isActive).length} members
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Created</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewTeam(team)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditTeam(team)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddMember(team)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteTeamClick(team)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage teams and team members
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a new team with members and assign a team lead
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={teamForm.description}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter team description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={teamForm.department} onValueChange={(value) => setTeamForm(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={teamForm.status} onValueChange={(value: 'active' | 'inactive' | 'archived') => setTeamForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="teamLead">Team Lead</Label>
                  <Input
                    id="teamLead"
                    value={teamForm.teamLead}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, teamLead: e.target.value }))}
                    placeholder="Enter team lead name or ID"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>
                {dept.charAt(0).toUpperCase() + dept.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
            className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-md transition-colors"
          >
            {viewMode === 'list' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            <span className="text-sm">
              {viewMode === 'list' ? 'List' : 'Cards'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              Active teams in the organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeTeams}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.averageTeamSize}</div>
            <p className="text-xs text-muted-foreground">
              Members per team
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Content */}
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Manage your organization's teams</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-gray-600">Loading teams...</p>
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDepartmentColor(team.department)}>
                        {team.department.charAt(0).toUpperCase() + team.department.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{team.teamLead}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{team.members.filter(m => m.isActive).length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(team.status)}>
                        {team.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTeam(team)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddMember(team)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTeamClick(team)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => renderTeamCard(team))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Team Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Details: {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              {selectedTeam?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTeam.department.charAt(0).toUpperCase() + selectedTeam.department.slice(1)}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedTeam.status)}>
                    {selectedTeam.status}
                  </Badge>
                </div>
                <div>
                  <Label>Team Lead</Label>
                  <p className="text-sm text-muted-foreground">{selectedTeam.teamLead}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTeam.createdAt ? new Date(selectedTeam.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Team Members ({selectedTeam.members.filter(m => m.isActive).length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedTeam.members.filter(m => m.isActive).map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">User {member.user}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="outline">
                        Joined {new Date(member.joinedDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team: {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Update team information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={teamForm.name}
                onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={teamForm.description}
                onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter team description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Select value={teamForm.department} onValueChange={(value) => setTeamForm(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={teamForm.status} onValueChange={(value: 'active' | 'inactive' | 'archived') => setTeamForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-teamLead">Team Lead</Label>
              <Input
                id="edit-teamLead"
                value={teamForm.teamLead}
                onChange={(e) => setTeamForm(prev => ({ ...prev, teamLead: e.target.value }))}
                placeholder="Enter team lead name or ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTeam} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Team'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTeam?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Team'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeamDashboard 