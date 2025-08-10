'use client'

import React, { useState } from 'react'
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Video,
  FileText,
  Users,
  Settings,
  BarChart3,
  FolderOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('faq')

  // FAQ Data
  const faqCategories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      items: [
        {
          question: 'How do I create my first project?',
          answer: 'To create your first project, click on the "Projects" tab in the sidebar, then click the "Create Project" button. Fill in the project details including name, description, and team members, then click "Create Project".'
        },
        {
          question: 'How do I invite team members?',
          answer: 'You can invite team members by going to the "Teams" section, clicking on "Invite Members", and entering their email addresses. They will receive an invitation email with a link to join your team.'
        },
        {
          question: 'What are the different user roles?',
          answer: 'There are three main roles: Admin (full access), Manager (can manage projects and tasks), and Member (can view and update assigned tasks). Admins can change user roles in the team settings.'
        }
      ]
    },
    {
      title: 'Projects & Tasks',
      icon: FolderOpen,
      items: [
        {
          question: 'How do I assign tasks to team members?',
          answer: 'When creating or editing a task, you can assign it to team members using the "Assignees" field. You can select multiple team members if needed. Assigned members will receive notifications about their tasks.'
        },
        {
          question: 'Can I set task priorities?',
          answer: 'Yes, you can set task priorities as Low, Medium, High, or Critical. This helps team members understand which tasks need immediate attention. Priorities are color-coded for easy identification.'
        },
        {
          question: 'How do I track task progress?',
          answer: 'Task progress can be tracked through status updates (To Do, In Progress, Review, Done), time tracking, and progress bars. You can also add comments and attachments to provide updates.'
        }
      ]
    },
    {
      title: 'Team Management',
      icon: Users,
      items: [
        {
          question: 'How do I create a new team?',
          answer: 'To create a new team, go to the "Teams" section and click "Create Team". Enter the team name, description, and select team members. You can also set team permissions and access levels.'
        },
        {
          question: 'Can I have different teams for different projects?',
          answer: 'Yes, you can create multiple teams and assign different members to different projects. This allows for flexible team structures based on project requirements and expertise.'
        },
        {
          question: 'How do I manage team permissions?',
          answer: 'Team permissions can be managed in the team settings. You can control who can create projects, assign tasks, view sensitive information, and manage team members.'
        }
      ]
    },
    {
      title: 'Account & Settings',
      icon: Settings,
      items: [
        {
          question: 'How do I change my password?',
          answer: 'You can change your password in the Settings section under the Security tab. Enter your current password, then your new password twice to confirm the change.'
        },
        {
          question: 'Can I customize my notification preferences?',
          answer: 'Yes, you can customize notification preferences in the Settings section. Choose between email, push, and SMS notifications, and select which types of updates you want to receive.'
        },
        {
          question: 'How do I update my profile information?',
          answer: 'Profile information can be updated in the Profile section. Click on "Edit Profile" to modify your personal details, avatar, bio, and skills. Remember to save your changes.'
        }
      ]
    }
  ]

  // Tutorial Data
  const tutorials = [
    {
      title: 'Project Management Basics',
      description: 'Learn the fundamentals of creating and managing projects',
      duration: '15 min',
      level: 'Beginner',
      icon: FolderOpen,
      videoUrl: '#',
      steps: [
        'Create your first project',
        'Add team members',
        'Set project goals and milestones',
        'Track progress and updates'
      ]
    },
    {
      title: 'Task Organization',
      description: 'Master task creation, assignment, and tracking',
      duration: '20 min',
      level: 'Beginner',
      icon: CheckCircle,
      videoUrl: '#',
      steps: [
        'Create and organize tasks',
        'Set priorities and deadlines',
        'Assign tasks to team members',
        'Monitor task completion'
      ]
    },
    {
      title: 'Team Collaboration',
      description: 'Enhance team communication and collaboration',
      duration: '25 min',
      level: 'Intermediate',
      icon: Users,
      videoUrl: '#',
      steps: [
        'Set up team communication',
        'Use project comments effectively',
        'Share files and documents',
        'Coordinate team meetings'
      ]
    },
    {
      title: 'Advanced Analytics',
      description: 'Understand project metrics and performance',
      duration: '30 min',
      level: 'Advanced',
      icon: BarChart3,
      videoUrl: '#',
      steps: [
        'View project dashboards',
        'Analyze team performance',
        'Generate reports',
        'Track key metrics'
      ]
    }
  ]

  // Contact Methods
  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: Mail,
      contact: 'support@creatorbase.com',
      responseTime: '24 hours',
      bestFor: 'Non-urgent questions and detailed explanations'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: MessageSquare,
      contact: 'Available 9 AM - 6 PM EST',
      responseTime: 'Immediate',
      bestFor: 'Quick questions and real-time assistance'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      icon: Phone,
      contact: '+1 (555) 123-4567',
      responseTime: 'Immediate',
      bestFor: 'Complex issues and urgent problems'
    }
  ]

  // Documentation Links
  const documentationLinks = [
    {
      title: 'User Guide',
      description: 'Comprehensive guide to all features',
      icon: BookOpen,
      url: '#',
      category: 'General'
    },
    {
      title: 'API Documentation',
      description: 'Technical documentation for developers',
      icon: FileText,
      url: '#',
      category: 'Technical'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: Video,
      url: '#',
      category: 'Learning'
    },
    {
      title: 'Release Notes',
      description: 'Latest updates and new features',
      icon: Info,
      url: '#',
      category: 'Updates'
    }
  ]

  const filteredFAQ = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
    { id: 'contact', label: 'Contact Support', icon: MessageCircle },
    { id: 'docs', label: 'Documentation', icon: FileText },
  ]

  const renderFAQTab = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search FAQ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* FAQ Categories */}
      {filteredFAQ.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <category.icon className="h-5 w-5 text-primary" />
              <span>{category.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {category.items.map((item, itemIndex) => (
                <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {filteredFAQ.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No results found
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or browse our FAQ categories above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderTutorialsTab = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {tutorials.map((tutorial, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <tutorial.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={tutorial.level === 'Beginner' ? 'default' : tutorial.level === 'Intermediate' ? 'secondary' : 'destructive'}>
                  {tutorial.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Duration: {tutorial.duration}</span>
                <span>Level: {tutorial.level}</span>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-sm">What you'll learn:</p>
                <ul className="space-y-1">
                  {tutorial.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Watch Tutorial
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderContactTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Get Help from Our Support Team</CardTitle>
          <CardDescription>
            Choose the best way to get in touch with us based on your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center p-6 border rounded-lg hover:border-primary transition-colors">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <method.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{method.contact}</p>
                  <p className="text-muted-foreground">Response: {method.responseTime}</p>
                  <p className="text-xs text-muted-foreground">{method.bestFor}</p>
                </div>
                <Button className="w-full mt-4">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact {method.title}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before You Contact Us</CardTitle>
          <CardDescription>
            Here are some things to check before reaching out to support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Check These First</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Review our FAQ section above</li>
                <li>• Check our video tutorials</li>
                <li>• Look at the user documentation</li>
                <li>• Try refreshing your browser</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>When to Contact Support</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Technical errors or bugs</li>
                <li>• Account access issues</li>
                <li>• Billing problems</li>
                <li>• Feature requests</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDocsTab = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {documentationLinks.map((doc, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <doc.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{doc.category}</Badge>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            Explore more helpful resources to get the most out of CreatorBase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Knowledge Base</h4>
              <p className="text-sm text-muted-foreground">Detailed articles and guides</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Community Forum</h4>
              <p className="text-sm text-muted-foreground">Connect with other users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Status Page</h4>
              <p className="text-sm text-muted-foreground">System status and updates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return renderFAQTab()
      case 'tutorials':
        return renderTutorialsTab()
      case 'contact':
        return renderContactTab()
      case 'docs':
        return renderDocsTab()
      default:
        return renderFAQTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers, learn new features, and get support when you need it
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Help
