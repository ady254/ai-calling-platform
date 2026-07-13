import { CallDetailData } from '@/types/call-details';

export const mockCallDetail: CallDetailData = {
  header: {
    customerName: 'John Smith',
    company: 'ABC Hospital',
    phone: '+1 415 555 0142',
    campaign: 'Hospital Appointment Reminder',
    status: 'completed',
    durationLabel: '2m 18s',
    date: '2026-07-13T16:22:00Z',
  },

  kpis: [
    { id: 'lead-score', label: 'Lead Score', value: '92 / 100', hint: 'Top decile', tone: 'accent', icon: 'lead-score' },
    { id: 'buying-intent', label: 'Buying Intent', value: 'High', hint: 'Strong signals', tone: 'positive', icon: 'buying-intent' },
    { id: 'sentiment', label: 'Sentiment', value: 'Positive', hint: '94% confidence', tone: 'positive', icon: 'sentiment' },
    { id: 'decision-maker', label: 'Decision Maker', value: 'Yes', hint: 'Operations Manager', tone: 'positive', icon: 'decision-maker' },
    { id: 'appointment', label: 'Appointment', value: 'Booked', hint: 'Friday, 11:00 AM', tone: 'positive', icon: 'appointment' },
    { id: 'next-action', label: 'Next Action', value: 'Follow-up Tomorrow', hint: 'Send proposal', tone: 'neutral', icon: 'next-action' },
  ],

  recording: { url: null, durationSeconds: 138 },

  summary: [
    'Customer confirmed interest in automating appointment reminders across four hospital branches.',
    'Current system relies on manual phone calls handled by front-desk staff.',
    'Budget discussion was positive — comfortable in the $1,500/month range.',
    'Requested a formal proposal to review with management next week.',
    'Meeting scheduled for Friday to walk through implementation.',
  ],

  intelligence: [
    { id: 'i-lead', label: 'Lead Score', value: '92', tone: 'accent', progress: 92, hint: 'Qualified' },
    { id: 'i-intent', label: 'Buying Intent', value: 'High', tone: 'positive' },
    { id: 'i-budget', label: 'Estimated Budget', value: '$1,500/month', tone: 'neutral' },
    { id: 'i-dm', label: 'Decision Maker', value: 'Confirmed', tone: 'positive' },
    { id: 'i-timeline', label: 'Expected Closing', value: 'Within 2 weeks', tone: 'neutral' },
    { id: 'i-risk', label: 'Risk Level', value: 'Low', tone: 'positive' },
    { id: 'i-quality', label: 'Conversation Quality', value: '94%', tone: 'accent', progress: 94 },
  ],

  transcript: [
    { id: 's1', speaker: 'ai', timestamp: 2, text: "Hi, this is the assistant calling from your appointment reminder service. Am I speaking with John?" },
    { id: 's2', speaker: 'customer', timestamp: 7, text: "Yes, this is John. What is this regarding?" },
    { id: 's3', speaker: 'ai', timestamp: 11, text: "I'm reaching out because ABC Hospital signed up to learn how AI can automate patient appointment reminders. Do you have two minutes?" },
    { id: 's4', speaker: 'customer', timestamp: 19, text: "Sure. Right now we do all of that manually — the front desk calls every patient. It takes hours.", tags: ['objection'] },
    { id: 's5', speaker: 'ai', timestamp: 28, text: "That's exactly what we help with. Our system places the reminder calls automatically and books or reschedules appointments in real time. How many branches are you running?" },
    { id: 's6', speaker: 'customer', timestamp: 37, text: "We have four branches. Missed appointments are a real problem for us.", tags: ['pricing'] },
    { id: 's7', speaker: 'ai', timestamp: 44, text: "Across four branches this typically recovers a meaningful share of no-shows. Would automated reminders and rescheduling be useful for your team?" },
    { id: 's8', speaker: 'customer', timestamp: 53, text: "Definitely. What would something like this cost?", tags: ['question', 'pricing'] },
    { id: 's9', speaker: 'ai', timestamp: 58, text: "For four branches, plans generally start around $1,500 per month, and most clients see that pay back through recovered appointments within the first month." },
    { id: 's10', speaker: 'customer', timestamp: 68, text: "That's within range. I'd need to run it by management before we commit.", tags: ['objection'] },
    { id: 's11', speaker: 'ai', timestamp: 75, text: "Completely understandable. I can send a proposal you can share with them. How quickly are you hoping to get started?", tags: ['question'] },
    { id: 's12', speaker: 'customer', timestamp: 84, text: "Ideally next month. One thing — would this integrate with our current scheduling system?", tags: ['question', 'objection'] },
    { id: 's13', speaker: 'ai', timestamp: 92, text: "In most cases yes — our team confirms the integration during onboarding. Shall I book a short call to review the proposal together?" },
    { id: 's14', speaker: 'customer', timestamp: 101, text: "Yes, Friday works for me. Let's do late morning.", tags: [] },
    { id: 's15', speaker: 'ai', timestamp: 107, text: "Perfect — I've scheduled Friday at 11 AM and I'll send the proposal and pricing ahead of time. Thanks, John." },
    { id: 's16', speaker: 'customer', timestamp: 116, text: "Great, thank you. Talk Friday.", tags: [] },
  ],

  businessAnalysis: [
    {
      id: 'ba-intent',
      title: 'Customer Intent',
      tone: 'accent',
      icon: 'intent',
      text: 'Interested in reducing manual appointment calls across four hospital branches and recovering missed appointments.',
    },
    {
      id: 'ba-pain',
      title: 'Pain Points',
      tone: 'attention',
      icon: 'pain',
      items: ['High staff workload', 'Missed appointments', 'Manual follow-up'],
    },
    {
      id: 'ba-objections',
      title: 'Objections',
      tone: 'attention',
      icon: 'objection',
      items: ['Needs management approval', 'Asked about pricing'],
    },
    {
      id: 'ba-positive',
      title: 'Positive Signals',
      tone: 'positive',
      icon: 'positive',
      items: ['Asked implementation timeline', 'Requested proposal', 'Confirmed interest'],
    },
    {
      id: 'ba-negative',
      title: 'Negative Signals',
      tone: 'negative',
      icon: 'negative',
      items: ['Concern about integration'],
    },
  ],

  extracted: [
    { id: 'e-company', label: 'Company', value: 'ABC Hospital', icon: 'company' },
    { id: 'e-industry', label: 'Industry', value: 'Healthcare', icon: 'industry' },
    { id: 'e-employees', label: 'Employees', value: '120', icon: 'employees' },
    { id: 'e-solution', label: 'Current Solution', value: 'Manual calling', icon: 'solution' },
    { id: 'e-product', label: 'Interested Product', value: 'Appointment AI', icon: 'product' },
    { id: 'e-budget', label: 'Budget', value: '$1,500/month', icon: 'budget' },
    { id: 'e-timeline', label: 'Timeline', value: 'Next Month', icon: 'timeline' },
    { id: 'e-dm', label: 'Decision Maker', value: 'Operations Manager', icon: 'decision-maker' },
  ],

  nextActions: [
    { id: 'a1', label: 'Send proposal' },
    { id: 'a2', label: 'Schedule demo' },
    { id: 'a3', label: 'Call Friday' },
    { id: 'a4', label: 'Send pricing PDF' },
    { id: 'a5', label: 'Notify sales manager' },
  ],

  followUp: {
    messages: [
      {
        channel: 'email',
        subject: 'Your appointment automation proposal — ABC Hospital',
        body: `Hi John,\n\nThank you for taking the time to speak today. As discussed, our platform automates appointment reminders and rescheduling across all four of your branches, helping recover missed appointments and freeing up your front-desk team.\n\nI've attached a proposal outlining a plan around $1,500/month, along with pricing details you can share with your management team. I've also scheduled our follow-up for Friday at 11:00 AM to walk through implementation and confirm integration with your current scheduling system.\n\nLooking forward to Friday.\n\nBest regards,\nV3 AI Team`,
      },
      {
        channel: 'whatsapp',
        body: `Hi John! Great speaking with you today. 🙌 I'm sending over the proposal for automating appointment reminders across your four branches (~$1,500/mo). We're set for Friday at 11 AM to review everything and confirm the integration. Talk soon!`,
      },
      {
        channel: 'sms',
        body: `Hi John, thanks for the call today. Sending your appointment-AI proposal ($1,500/mo) shortly. Confirmed for Friday 11 AM to review. — V3`,
      },
    ],
  },

  coaching: {
    didWell: ['Maintained natural flow', 'Handled objection correctly', 'Booked appointment'],
    needsImprovement: ['Interrupted customer once', 'Introduced pricing too early', 'Opening could be shorter'],
    suggestedPrompt:
      'Open with a one-line value statement and confirm the contact before qualifying. Hold pricing until intent and branch count are established. Acknowledge the customer fully before responding to avoid interruptions.',
  },

  knowledge: {
    answeredPercent: 92,
    unansweredPercent: 8,
    missingTopics: ['Insurance policy', 'Weekend appointments', 'Cancellation process'],
  },

  executiveReport: {
    title: 'Executive Conversation Report',
    body: 'This conversation resulted in a qualified opportunity with strong buying intent. The customer expressed interest in replacing manual appointment reminders and confirmed budget availability of $1,500/month. AI successfully handled objections and booked a follow-up meeting for Friday. One improvement opportunity is reducing the opening script by approximately 10 seconds to increase engagement.',
    footer: 'Generated automatically by V3 AI',
  },
};
