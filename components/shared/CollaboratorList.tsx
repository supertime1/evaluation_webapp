'use client';

import React, { useState } from 'react';
import { Users, User, Crown, Calendar, MoreHorizontal, Mail, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Collaborator {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  lastActive?: string;
  isActive: boolean;
  contributionCount?: number;
}

interface CollaboratorListProps {
  collaborators: Collaborator[];
  currentUserId?: string;
  canManageCollaborators?: boolean;
  onInviteCollaborator?: () => void;
  onRemoveCollaborator?: (collaboratorId: string) => void;
  onChangeRole?: (collaboratorId: string, newRole: Collaborator['role']) => void;
  className?: string;
}

export function CollaboratorList({
  collaborators,
  currentUserId,
  canManageCollaborators = false,
  onInviteCollaborator,
  onRemoveCollaborator,
  onChangeRole,
  className = '',
}: CollaboratorListProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedCollaborators = showAll ? collaborators : collaborators.slice(0, 5);
  const remainingCount = collaborators.length - 5;

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case 'editor':
        return <Shield className="h-3 w-3 text-blue-600" />;
      case 'viewer':
        return <User className="h-3 w-3 text-slate-600" />;
    }
  };

  const getRoleBadgeVariant = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
    }
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (collaborators.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Collaborators</h3>
        <p className="text-slate-600 mb-4">
          This dataset doesn't have any collaborators yet.
        </p>
        {canManageCollaborators && onInviteCollaborator && (
          <Button onClick={onInviteCollaborator} className="gap-2">
            <Users className="h-4 w-4" />
            Invite Collaborators
          </Button>
        )}
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Collaborators ({collaborators.length})
            </h3>
          </div>
          
          {canManageCollaborators && onInviteCollaborator && (
            <Button variant="outline" onClick={onInviteCollaborator} size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Invite
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {displayedCollaborators.map(collaborator => (
            <div
              key={collaborator.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                collaborator.id === currentUserId 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-8 w-8 bg-slate-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  {collaborator.isActive && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 truncate">
                      {collaborator.name || collaborator.email}
                      {collaborator.id === currentUserId && (
                        <span className="text-blue-600 text-sm ml-1">(You)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(collaborator.role)}
                      <Badge variant={getRoleBadgeVariant(collaborator.role)} className="text-xs">
                        {collaborator.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {collaborator.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(collaborator.joinedAt).toLocaleDateString()}
                    </span>
                    {collaborator.contributionCount !== undefined && (
                      <span>{collaborator.contributionCount} contributions</span>
                    )}
                  </div>
                </div>

                {/* Last Active */}
                <div className="text-right">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="text-xs text-slate-500">
                        {formatLastActive(collaborator.lastActive)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last active: {collaborator.lastActive 
                        ? new Date(collaborator.lastActive).toLocaleString()
                        : 'Never'
                      }</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Actions */}
              {canManageCollaborators && collaborator.id !== currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onChangeRole && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => onChangeRole(collaborator.id, 'owner')}
                          disabled={collaborator.role === 'owner'}
                        >
                          Make Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onChangeRole(collaborator.id, 'editor')}
                          disabled={collaborator.role === 'editor'}
                        >
                          Make Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onChangeRole(collaborator.id, 'viewer')}
                          disabled={collaborator.role === 'viewer'}
                        >
                          Make Viewer
                        </DropdownMenuItem>
                      </>
                    )}
                    {onRemoveCollaborator && (
                      <DropdownMenuItem 
                        onClick={() => onRemoveCollaborator(collaborator.id)}
                        className="text-red-600"
                      >
                        Remove Access
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {collaborators.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              size="sm"
              className="text-slate-600"
            >
              {showAll 
                ? 'Show Less' 
                : `Show ${remainingCount} More Collaborator${remainingCount === 1 ? '' : 's'}`
              }
            </Button>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {collaborators.filter(c => c.isActive).length} active, {collaborators.length} total
            </span>
            <span>
              {collaborators.filter(c => c.role === 'owner').length} owner{collaborators.filter(c => c.role === 'owner').length !== 1 ? 's' : ''}, {' '}
              {collaborators.filter(c => c.role === 'editor').length} editor{collaborators.filter(c => c.role === 'editor').length !== 1 ? 's' : ''}, {' '}
              {collaborators.filter(c => c.role === 'viewer').length} viewer{collaborators.filter(c => c.role === 'viewer').length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
} 