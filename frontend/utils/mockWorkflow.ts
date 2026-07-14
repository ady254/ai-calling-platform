import { WorkflowStudioData, Workflow } from '@/types/workflow-studio';

const hoursAgo = (n: number) => new Date(Date.now() - n * 3600 * 1000).toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400 * 1000).toISOString();

const primaryWorkflow: Workflow = {
  id: 'wf-1',
  name: 'Appointment Confirmation Flow',
  description:
    'When a hospital confirms an appointment, send a WhatsApp confirmation, notify the receptionist, and schedule a reminder one day before.',
  status: 'active',
  runs: 3482,
  successRate: 98.7,
  avgDuration: '1.8s',
  createdBy: 'Adnan Ahmad',
  lastModified: hoursAgo(5),
  learnFromExecutions: true,
  nodes: [
    { id: 'n1', defId: 'trigger.appointment-booked', category: 'trigger', label: 'Appointment Booked', icon: 'calendar-check', subtitle: 'Hospital campaign' },
    { id: 'n2', defId: 'ai.sentiment', category: 'ai-logic', label: 'Sentiment', icon: 'smile', subtitle: 'Is Positive' },
    { id: 'n3', defId: 'action.whatsapp', category: 'action', label: 'Send WhatsApp', icon: 'message-circle', subtitle: 'Confirmation message' },
    { id: 'n4', defId: 'action.notify-slack', category: 'action', label: 'Notify Slack', icon: 'hash', subtitle: '#reception' },
    { id: 'n5', defId: 'utility.delay', category: 'utility', label: 'Delay', icon: 'clock', subtitle: 'Until 1 day before' },
    { id: 'n6', defId: 'action.schedule-followup', category: 'action', label: 'Schedule Follow-up', icon: 'calendar-plus', subtitle: 'Reminder call' },
  ],
  versions: [
    { id: 'v3', label: 'v3', date: hoursAgo(5), author: 'Adnan Ahmad', note: 'Added Slack notification to reception', current: true },
    { id: 'v2', label: 'v2', date: daysAgo(3), author: 'Adnan Ahmad', note: 'Switched email → WhatsApp confirmation' },
    { id: 'v1', label: 'v1', date: daysAgo(12), author: 'Sara Malik', note: 'Initial appointment confirmation flow' },
  ],
  memory: [
    { id: 'm1', source: 'Hospital A', observation: 'Customers usually answer after 5 PM', adaptation: 'Schedules reminder calls after 5 PM' },
    { id: 'm2', source: 'John Smith', observation: 'Prefers WhatsApp over email', adaptation: 'Uses WhatsApp for all follow-ups' },
    { id: 'm3', source: 'Real Estate segment', observation: 'Replies fastest within 3 hours', adaptation: 'Tightened follow-up window to 3 hours' },
  ],
};

export const mockWorkflowData: WorkflowStudioData = {
  kpis: [
    { id: 'active', label: 'Active Workflows', value: '18', hint: '3 added this week', icon: 'active' },
    { id: 'executions', label: 'Executions Today', value: '12,483', hint: '+8% vs yesterday', icon: 'executions' },
    { id: 'success', label: 'Successful Runs', value: '98.7%', hint: 'Last 24 hours', icon: 'success' },
    { id: 'failed', label: 'Failed Runs', value: '14', hint: 'Needs attention', icon: 'failed' },
    { id: 'time', label: 'Time Saved', value: '182 Hours', hint: 'This month', icon: 'time' },
    { id: 'followups', label: 'Automated Follow-ups', value: '1,482', hint: 'Sent this week', icon: 'followups' },
  ],

  templates: [
    { id: 't1', name: 'Appointment Booking', description: 'Confirm, remind and reschedule appointments automatically.', icon: 'calendar-check' },
    { id: 't2', name: 'Lead Qualification', description: 'Score inbound leads and route the best ones to sales.', icon: 'user-check' },
    { id: 't3', name: 'Customer Support', description: 'Triage requests and resolve or escalate in real time.', icon: 'headphones' },
    { id: 't4', name: 'Sales Follow-up', description: 'Nurture prospects with timed, personalized outreach.', icon: 'send' },
    { id: 't5', name: 'Missed Call Recovery', description: 'Instantly re-engage callers you couldn’t reach.', icon: 'phone-missed' },
    { id: 't6', name: 'Payment Reminder', description: 'Recover revenue with polite, automated reminders.', icon: 'receipt' },
    { id: 't7', name: 'Recruitment Screening', description: 'Pre-screen candidates before a human interview.', icon: 'clipboard-list' },
    { id: 't8', name: 'Patient Reminder', description: 'Reduce no-shows with reminders across channels.', icon: 'heart-pulse' },
    { id: 't9', name: 'Customer Feedback', description: 'Collect and route feedback after every conversation.', icon: 'message-square' },
  ],

  library: [
    {
      category: 'trigger',
      title: 'Triggers',
      nodes: [
        { id: 'trigger.campaign-started', category: 'trigger', label: 'Campaign Started', icon: 'play' },
        { id: 'trigger.call-completed', category: 'trigger', label: 'Call Completed', icon: 'phone-call' },
        { id: 'trigger.appointment-booked', category: 'trigger', label: 'Appointment Booked', icon: 'calendar-check' },
        { id: 'trigger.lead-qualified', category: 'trigger', label: 'Lead Qualified', icon: 'user-check' },
        { id: 'trigger.call-failed', category: 'trigger', label: 'Call Failed', icon: 'phone-off' },
        { id: 'trigger.customer-replied', category: 'trigger', label: 'Customer Replied', icon: 'message-square' },
        { id: 'trigger.meeting-scheduled', category: 'trigger', label: 'Meeting Scheduled', icon: 'calendar-clock' },
        { id: 'trigger.kb-updated', category: 'trigger', label: 'Knowledge Base Updated', icon: 'book-open' },
      ],
    },
    {
      category: 'ai-logic',
      title: 'AI Logic',
      nodes: [
        { id: 'ai.lead-score', category: 'ai-logic', label: 'Lead Score', icon: 'gauge' },
        { id: 'ai.sentiment', category: 'ai-logic', label: 'Sentiment', icon: 'smile' },
        { id: 'ai.buying-intent', category: 'ai-logic', label: 'Buying Intent', icon: 'trending-up' },
        { id: 'ai.industry', category: 'ai-logic', label: 'Customer Industry', icon: 'briefcase' },
        { id: 'ai.budget', category: 'ai-logic', label: 'Budget', icon: 'wallet' },
        { id: 'ai.language', category: 'ai-logic', label: 'Language', icon: 'languages' },
        { id: 'ai.decision-maker', category: 'ai-logic', label: 'Decision Maker', icon: 'user-cog' },
        { id: 'ai.outcome', category: 'ai-logic', label: 'Conversation Outcome', icon: 'git-branch' },
      ],
    },
    {
      category: 'action',
      title: 'Actions',
      nodes: [
        { id: 'action.send-email', category: 'action', label: 'Send Email', icon: 'mail' },
        { id: 'action.whatsapp', category: 'action', label: 'Send WhatsApp', icon: 'message-circle' },
        { id: 'action.schedule-followup', category: 'action', label: 'Schedule Follow-up', icon: 'calendar-plus' },
        { id: 'action.update-crm', category: 'action', label: 'Update CRM', icon: 'database' },
        { id: 'action.assign-salesperson', category: 'action', label: 'Assign Salesperson', icon: 'user-plus' },
        { id: 'action.notify-slack', category: 'action', label: 'Notify Slack', icon: 'hash' },
        { id: 'action.book-calendar', category: 'action', label: 'Book Calendar', icon: 'calendar' },
        { id: 'action.generate-proposal', category: 'action', label: 'Generate Proposal', icon: 'file-text' },
        { id: 'action.create-task', category: 'action', label: 'Create Task', icon: 'check-square' },
        { id: 'action.webhook', category: 'action', label: 'Webhook', icon: 'webhook' },
      ],
    },
    {
      category: 'utility',
      title: 'Utilities',
      nodes: [
        { id: 'utility.delay', category: 'utility', label: 'Delay', icon: 'clock' },
        { id: 'utility.wait-until', category: 'utility', label: 'Wait Until', icon: 'timer' },
        { id: 'utility.filter', category: 'utility', label: 'Filter', icon: 'filter' },
        { id: 'utility.merge', category: 'utility', label: 'Merge', icon: 'git-merge' },
        { id: 'utility.split', category: 'utility', label: 'Split', icon: 'split' },
        { id: 'utility.loop', category: 'utility', label: 'Loop', icon: 'repeat' },
      ],
    },
  ],

  workflows: [primaryWorkflow],

  executions: [
    { id: 'e1', workflowName: 'Appointment Confirmation Flow', status: 'success', executedAt: hoursAgo(0.1), duration: '1.4s', triggeredBy: 'Appointment Booked' },
    { id: 'e2', workflowName: 'Lead Qualification', status: 'success', executedAt: hoursAgo(0.4), duration: '2.1s', triggeredBy: 'Call Completed' },
    { id: 'e3', workflowName: 'Missed Call Recovery', status: 'running', executedAt: hoursAgo(0.5), duration: '—', triggeredBy: 'Call Failed' },
    { id: 'e4', workflowName: 'Sales Follow-up', status: 'success', executedAt: hoursAgo(1.2), duration: '1.7s', triggeredBy: 'Lead Qualified' },
    { id: 'e5', workflowName: 'Payment Reminder', status: 'failed', executedAt: hoursAgo(2.5), duration: '0.9s', triggeredBy: 'Webhook' },
    { id: 'e6', workflowName: 'Patient Reminder', status: 'success', executedAt: hoursAgo(3.1), duration: '1.5s', triggeredBy: 'Meeting Scheduled' },
  ],

  recommendations: [
    { id: 'r1', text: 'This workflow could be simplified by removing two unnecessary steps.' },
    { id: 'r2', text: 'Sending WhatsApp before email increases response rates by approximately 18%.' },
    { id: 'r3', text: 'Customers usually reply within three hours — consider adding an automatic follow-up.' },
    { id: 'r4', text: 'Enabling learning mode raised on-time answer rate by 12% last month.' },
  ],
};

export const emptyWorkflowData: WorkflowStudioData = {
  ...mockWorkflowData,
  workflows: [],
};
