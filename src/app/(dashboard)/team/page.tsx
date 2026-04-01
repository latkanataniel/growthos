'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import type { TeamMember, Project } from '@/types/database'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { toast } from 'sonner'

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [memberFormOpen, setMemberFormOpen] = useState(false)
  const [projectFormOpen, setProjectFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'member' | 'project'; id: string } | null>(null)
  const [memberForm, setMemberForm] = useState({ name: '', role: '', skills: '', email: '', department: '', notes: '' })
  const [projectForm, setProjectForm] = useState({ name: '', description: '', status: 'active' })
  const supabase = createClient()

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [m, p] = await Promise.all([
      supabase.from('team_members').select('*').eq('user_id', user.id).order('name'),
      supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    setMembers(m.data || [])
    setProjects(p.data || [])
    setLoading(false)
  }

  const handleSaveMember = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const data = {
      name: memberForm.name,
      role: memberForm.role || null,
      skills: memberForm.skills ? memberForm.skills.split(',').map(s => s.trim()) : [],
      email: memberForm.email || null,
      department: memberForm.department || null,
      notes: memberForm.notes || null,
    }

    if (editingMember) {
      await supabase.from('team_members').update(data).eq('id', editingMember.id)
      toast.success('Zaktualizowano')
    } else {
      await supabase.from('team_members').insert({ ...data, user_id: user.id })
      toast.success('Dodano członka zespołu')
    }
    setMemberFormOpen(false)
    setEditingMember(null)
    setMemberForm({ name: '', role: '', skills: '', email: '', department: '', notes: '' })
    load()
  }

  const handleSaveProject = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (editingProject) {
      await supabase.from('projects').update(projectForm).eq('id', editingProject.id)
      toast.success('Zaktualizowano')
    } else {
      await supabase.from('projects').insert({ ...projectForm, user_id: user.id })
      toast.success('Dodano projekt')
    }
    setProjectFormOpen(false)
    setEditingProject(null)
    setProjectForm({ name: '', description: '', status: 'active' })
    load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'member') {
      await supabase.from('team_members').delete().eq('id', deleteTarget.id)
    } else {
      await supabase.from('projects').delete().eq('id', deleteTarget.id)
    }
    setDeleteTarget(null)
    toast.success('Usunięto')
    load()
  }

  const openEditMember = (m: TeamMember) => {
    setEditingMember(m)
    setMemberForm({
      name: m.name,
      role: m.role || '',
      skills: m.skills?.join(', ') || '',
      email: m.email || '',
      department: m.department || '',
      notes: m.notes || '',
    })
    setMemberFormOpen(true)
  }

  const openEditProject = (p: Project) => {
    setEditingProject(p)
    setProjectForm({ name: p.name, description: p.description || '', status: p.status || 'active' })
    setProjectFormOpen(true)
  }

  if (loading) return <LoadingSkeleton variant="list" count={4} />

  return (
    <div className="space-y-8 py-6">
      {/* Team Members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Zespół</h1>
          <Button onClick={() => { setEditingMember(null); setMemberForm({ name: '', role: '', skills: '', email: '', department: '', notes: '' }); setMemberFormOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj osobę
          </Button>
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="Brak członków zespołu"
            description="Dodaj osoby z zespołu, aby AI mogło sugerować delegowanie zadań."
            action={{ label: 'Dodaj osobę', onClick: () => setMemberFormOpen(true) }}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {members.map(m => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{m.name}</h3>
                    {m.role && <p className="text-sm text-muted-foreground">{m.role}</p>}
                    {m.department && <p className="text-xs text-muted-foreground">{m.department}</p>}
                    {m.skills && m.skills.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {m.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditMember(m)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: 'member', id: m.id })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Projekty</h2>
          <Button variant="outline" onClick={() => { setEditingProject(null); setProjectForm({ name: '', description: '', status: 'active' }); setProjectFormOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Nowy projekt
          </Button>
        </div>

        {projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">Brak projektów</p>
        ) : (
          <div className="grid gap-3">
            {projects.map(p => (
              <Card key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{p.status}</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProject(p)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: 'project', id: p.id })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Member Form Dialog */}
      <Dialog open={memberFormOpen} onOpenChange={setMemberFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edytuj osobę' : 'Dodaj osobę'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Imię i nazwisko *</Label><Input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} /></div>
            <div><Label>Rola</Label><Input value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} /></div>
            <div><Label>Umiejętności (oddzielone przecinkami)</Label><Input value={memberForm.skills} onChange={e => setMemberForm({ ...memberForm, skills: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} /></div>
            <div><Label>Dział</Label><Input value={memberForm.department} onChange={e => setMemberForm({ ...memberForm, department: e.target.value })} /></div>
            <div><Label>Notatki</Label><Textarea value={memberForm.notes} onChange={e => setMemberForm({ ...memberForm, notes: e.target.value })} rows={2} /></div>
            <Button onClick={handleSaveMember} disabled={!memberForm.name} className="w-full">
              {editingMember ? 'Zapisz' : 'Dodaj'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Form Dialog */}
      <Dialog open={projectFormOpen} onOpenChange={setProjectFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edytuj projekt' : 'Nowy projekt'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nazwa *</Label><Input value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} /></div>
            <div><Label>Opis</Label><Textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} /></div>
            <Button onClick={handleSaveProject} disabled={!projectForm.name} className="w-full">
              {editingProject ? 'Zapisz' : 'Utwórz'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Potwierdź usunięcie"
        description="Czy na pewno chcesz usunąć ten element?"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
