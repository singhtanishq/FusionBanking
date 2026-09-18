import { useState } from 'react'
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { formatDateTime } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  assigned_admin_id: number | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  closed_at: string | null
}

interface Message {
  id: string
  ticket_id: string
  sender_type: string
  sender_id: number
  message: string
  is_internal: boolean
  created_at: string
  sender: {
    full_name: string
  }
}

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['general', 'account', 'transfer', 'loan', 'fd', 'kyc', 'technical', 'security', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
})

type TicketForm = z.infer<typeof ticketSchema>

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
})

type MessageForm = z.infer<typeof messageSchema>

export function SupportPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const { data: tickets } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const response = await api.get('/customer/support/tickets')
      return response.data.data as Ticket[]
    },
  })

  const createTicketMutation = useMutation({
    mutationFn: (data: TicketForm) => api.post('/customer/support/tickets', data),
    onSuccess: () => {
      toast.success('Support ticket created successfully')
      setShowCreateModal(false)
      setActiveTab('list')
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
    onError: () => {
      toast.error('Failed to create ticket')
    },
  })

  const addMessageMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) => 
      api.post(`/customer/support/tickets/${ticketId}/messages`, { message }),
    onSuccess: () => {
      toast.success('Message sent')
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', selectedTicket?.id] })
    },
    onError: () => {
      toast.error('Failed to send message')
    },
  })

  const form = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'normal',
    },
  })

  const messageForm = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
  })

  const handleSubmit = (data: TicketForm) => {
    createTicketMutation.mutate(data)
  }

  const getStatusVariant = (status: string): 'primary' | 'info' | 'warning' | 'success' | 'gray' => {
    switch (status) {
      case 'open': return 'primary'
      case 'assigned': return 'info'
      case 'in_progress': return 'warning'
      case 'waiting_customer': return 'info'
      case 'resolved': return 'success'
      case 'closed': return 'gray'
      default: return 'gray'
    }
  }

  const getPriorityVariant = (priority: string): 'danger' | 'warning' | 'info' | 'gray' => {
    switch (priority) {
      case 'urgent': return 'danger'
      case 'high': return 'warning'
      case 'normal': return 'info'
      default: return 'gray'
    }
  }

  if (activeTab === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setActiveTab('list')}>
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Create Support Ticket</h1>
            <p className="text-navy-600">Get help from our support team</p>
          </div>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Alert variant="info" className="text-sm">
                <p>Our support team typically responds within 24 hours. For urgent issues, select "High" or "Urgent" priority.</p>
              </Alert>

              <Input
                {...form.register('subject')}
                label="Subject"
                placeholder="Brief summary of your issue"
                error={form.formState.errors.subject?.message}
              />
              <Textarea
                {...form.register('description')}
                label="Description"
                placeholder="Describe your issue in detail..."
                rows={6}
                error={form.formState.errors.description?.message}
              />
              <div className="grid sm:grid-cols-2 gap-6">
                <Select
                  {...form.register('category')}
                  label="Category"
                  error={form.formState.errors.category?.message}
                  options={[
                    { value: 'general', label: 'General Inquiry' },
                    { value: 'account', label: 'Account Issues' },
                    { value: 'transfer', label: 'Transfer Problems' },
                    { value: 'loan', label: 'Loan Queries' },
                    { value: 'fd', label: 'Fixed Deposit Issues' },
                    { value: 'kyc', label: 'KYC/Document Issues' },
                    { value: 'technical', label: 'Technical Problems' },
                    { value: 'security', label: 'Security Concerns' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <Select
                  {...form.register('priority')}
                  label="Priority"
                  error={form.formState.errors.priority?.message}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-navy-100">
                <Button type="button" variant="outline" onClick={() => { setActiveTab('list'); form.reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" loading={createTicketMutation.isPending}>
                  Submit Ticket
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-900">{selectedTicket.ticket_number}</h1>
              <Badge variant={getStatusVariant(selectedTicket.status)}>{selectedTicket.status.replace('_', ' ')}</Badge>
              <Badge variant={getPriorityVariant(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
            </div>
            <p className="text-navy-600 mt-1">{selectedTicket.subject}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader title="Description" />
          <CardContent>
            <p className="text-navy-600 whitespace-pre-wrap">{selectedTicket.description}</p>
            <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-navy-500">Category: </span>
                <span className="font-medium capitalize">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-navy-500">Created: </span>
                <span className="font-medium">{formatDateTime(selectedTicket.created_at)}</span>
              </div>
              <div>
                <span className="text-navy-500">Updated: </span>
                <span className="font-medium">{formatDateTime(selectedTicket.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Messages" />
          <CardContent>
            <TicketMessages ticketId={selectedTicket.id} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Support Center</h1>
          <p className="text-navy-600">Get help with your FusionBanking account</p>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <PlusIcon className="h-5 w-5" />
          Create Ticket
        </Button>
      </div>

      {/* Quick Help */}
      <Card className="mb-6">
        <CardHeader title="Quick Help" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
                <InformationCircleIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-navy-900 mb-1">FAQs</h3>
              <p className="text-sm text-navy-600">Browse common questions</p>
            </div>
            <div className="p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-medium text-navy-900 mb-1">Live Chat</h3>
              <p className="text-sm text-navy-600">Chat with support (9AM-6PM)</p>
            </div>
            <div className="p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                <PhoneIcon className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-navy-900 mb-1">Call Us</h3>
              <p className="text-sm text-navy-600">1800-XXX-XXXX (Toll Free)</p>
            </div>
            <div className="p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                <EnvelopeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-navy-900 mb-1">Email</h3>
              <p className="text-sm text-navy-600">support@fusionbanking.local</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader 
          title="Your Tickets" 
          action={
            <Button variant="outline" onClick={() => setActiveTab('create')}>
              <PlusIcon className="h-5 w-5" />
              New Ticket
            </Button>
          }
        />
        <CardContent>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-navy-100 hover:bg-navy-50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <div className="flex items-start gap-4 mb-2 sm:mb-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-navy-900">{ticket.ticket_number}</p>
                        <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-navy-600 mt-1 truncate max-w-md">{ticket.subject}</p>
                      <p className="text-xs text-navy-500 mt-1">{formatDateTime(ticket.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <ArrowRightIcon className="h-5 w-5 text-navy-400" />
                    <span className="text-sm text-navy-500">View Details</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-12 pb-12 text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 mb-2">No Support Tickets</h3>
              <p className="text-navy-600 mb-6">You haven't created any support tickets yet.</p>
              <Button onClick={() => setActiveTab('create')}>
                <PlusIcon className="h-5 w-5" />
                Create Your First Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TicketMessages({ ticketId }: { ticketId: string }) {
  const queryClient = useQueryClient()
  const messageForm = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
  })

  const addMessageMutation = useMutation({
    mutationFn: (message: string) => api.post(`/customer/support/tickets/${ticketId}/messages`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
      messageForm.reset()
    },
    onError: () => {
      toast.error('Failed to send message')
    },
  })

  const { data: messages } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async () => {
      const response = await api.get(`/customer/support/tickets/${ticketId}`)
      return response.data.data.messages as Message[]
    },
    enabled: !!ticketId,
  })

  const handleSubmit = (data: MessageForm) => {
    addMessageMutation.mutate(data.message)
  }

  return (
    <div className="space-y-4">
      {messages && messages.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender_type === 'customer' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender_type === 'customer' ? 'bg-primary-100' : 'bg-navy-100'}`}>
                {message.sender_type === 'customer' ? (
                  <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                ) : (
                  <InformationCircleIcon className="h-5 w-5 text-navy-600" />
                )}
              </div>
              <div className={`flex-1 ${message.sender_type === 'customer' ? 'text-right' : ''}`}>
                <div className={`p-3 rounded-lg ${message.sender_type === 'customer' ? 'bg-primary-50' : 'bg-navy-50'}`}>
                  <p className="text-sm text-navy-900">{message.message}</p>
                </div>
                <p className="text-xs text-navy-500 mt-1 text-right">
                  {message.sender.full_name} • {formatDateTime(message.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-navy-500">No messages yet. Start the conversation below.</p>
      )}

      <div className="pt-4 border-t border-navy-100">
        <form onSubmit={messageForm.handleSubmit(handleSubmit)} className="flex gap-3">
          <Input
            {...messageForm.register('message')}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" loading={addMessageMutation.isPending}>
            Send
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}