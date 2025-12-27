import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTeams } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Users as UsersIcon } from 'lucide-react';

export default function Teams() {
  const { data: teams = [] } = useTeams();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter teams based on search
  const filteredTeams = teams.filter(team => 
    searchQuery === '' || 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground mt-1">{filteredTeams.length} total teams</p>
          </div>
          <Button asChild>
            <Link to="/teams/new">
              <Plus className="w-4 h-4 mr-2" />
              New Team
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teams by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Team Name</TableHead>
                  <TableHead className="font-semibold">Team Members</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No teams found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeams.map((team) => (
                    <TableRow 
                      key={team.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-muted-foreground" />
                          {team.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        No members assigned
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        My Company (San Francisco)
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
