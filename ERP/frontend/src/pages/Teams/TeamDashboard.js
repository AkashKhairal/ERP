import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const TeamDashboard = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Engineering Team',
      department: 'Engineering',
      status: 'active',
      memberCount: 8,
      lead: 'John Doe',
      description: 'Core development team for web applications',
      createdAt: '2023-01-15',
      projects: ['Mobile App', 'Dashboard Redesign']
    },
    {
      id: 2,
      name: 'Design Team',
      department: 'Design',
      status: 'active',
      memberCount: 5,
      lead: 'Sarah Wilson',
      description: 'UI/UX design and creative assets',
      createdAt: '2023-02-01',
      projects: ['Brand Redesign', 'Website UI']
    },
    {
      id: 3,
      name: 'Marketing Team',
      department: 'Marketing',
      status: 'active',
      memberCount: 4,
      lead: 'Mike Johnson',
      description: 'Digital marketing and content strategy',
      createdAt: '2023-03-10',
      projects: ['Q4 Campaign', 'Social Media']
    },
    {
      id: 4,
      name: 'Content Team',
      department: 'Content',
      status: 'active',
      memberCount: 3,
      lead: 'Emily Chen',
      description: 'Content creation and video production',
      createdAt: '2023-04-05',
      projects: ['YouTube Series', 'Blog Content']
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchTerm === '' || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.lead.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || team.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Handle team actions
  const handleEditTeam = (teamId) => {
    console.log('Edit team:', teamId);
    // TODO: Open edit modal or navigate to edit page
  };

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setTeams(prev => prev.filter(team => team.id !== teamId));
    }
  };

  const handleAddMember = (teamId) => {
    console.log('Add member to team:', teamId);
    // TODO: Open add member modal
  };

  const handleViewTeam = (teamId) => {
    console.log('View team details:', teamId);
    // TODO: Navigate to team details page
  };

  const departments = ['Engineering', 'Content', 'Design', 'Marketing', 'Sales', 'HR'];
  const statuses = ['active', 'inactive', 'archived'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Engineering': return 'text-blue-600 bg-blue-100';
      case 'Content': return 'text-purple-600 bg-purple-100';
      case 'Design': return 'text-pink-600 bg-pink-100';
      case 'Marketing': return 'text-green-600 bg-green-100';
      case 'Sales': return 'text-orange-600 bg-orange-100';
      case 'HR': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = {
    totalTeams: teams.length,
    activeTeams: teams.filter(team => team.status === 'active').length,
    totalMembers: teams.reduce((sum, team) => sum + team.memberCount, 0),
    departments: [...new Set(teams.map(team => team.department))].length
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
            <p className="text-muted-foreground">Organize your team structure and manage team assignments</p>
          </div>
          <Button asChild>
            <Link to="/app/teams/create">
              <Plus className="w-5 h-5 mr-2" />
              <span>New Team</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Teams</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Building className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-foreground">{stats.departments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              {/* Search icon removed as per new_code */}
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Filter icon removed as per new_code */}
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <Select onValueChange={(value) => setDepartmentFilter(value)} defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select onValueChange={(value) => setStatusFilter(value)} defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{team.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{team.description}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{team.department}</Badge>
                    <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                      {team.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {team.memberCount} members
                  </span>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {team.projects.length} projects
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Lead: {team.lead}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewTeam(team.id)}
                >
                  View Details
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddMember(team.id)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTeam(team.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Button asChild>
            <Link to="/app/teams/create">
              <Plus className="w-5 h-5 mr-2" />
              <span>Create New Team</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard; 