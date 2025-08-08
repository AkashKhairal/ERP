'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Check, 
  Play, 
  Star, 
  Users, 
  FolderOpen, 
  DollarSign, 
  BarChart3, 
  FileText, 
  Shield, 
  Zap,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Quote,
  Github,
  Linkedin,
  Youtube,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Award,
  Globe,
  Lock,
  Sparkles,
  User,
  Brain,
  ClipboardList,
  Users2,
  BarChart,
  Package,
  ChevronDown,
  ChevronUp,
  X,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

const Landing = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isYearly, setIsYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()

  // Force light mode for landing page
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
    document.body.style.backgroundColor = '#ffffff'
    document.body.style.color = '#000000'
  }, [])

  const testimonials = [
    {
      quote: "I finally found a tool that matches my pace.",
      author: "Aayush",
      role: "Dev + Creator",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      quote: "CreatorBase replaced 3 apps I used to juggle daily.",
      author: "Priya",
      role: "Designer & Blogger",
      avatar: "🎨",
      rating: 5
    },
    {
      quote: "Our team productivity increased by 40% in the first month.",
      author: "Rahul",
      role: "Startup Founder",
      avatar: "🚀",
      rating: 5
    }
  ]

  const targetUsers = [
    {
      icon: "🎬",
      title: "Content Creators with a Day Job",
      description: "Manage your side hustle alongside your 9-to-5"
    },
    {
      icon: "🧠",
      title: "Solopreneurs Managing Projects",
      description: "Scale your solo business without the complexity"
    },
    {
      icon: "💻",
      title: "Devs & Designers Building Products",
      description: "Focus on building while we handle the operations"
    }
  ]

  const keyFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Content Planner",
      description: "Smart content suggestions and scheduling"
    },
    {
      icon: ClipboardList,
      title: "Project + Task Management",
      description: "Kanban boards and sprint planning"
    },
    {
      icon: Users2,
      title: "Team Collaboration & Roles",
      description: "Manage team permissions and workflows"
    },
    {
      icon: BarChart,
      title: "Dashboard for Progress & Metrics",
      description: "Real-time insights and analytics"
    },
    {
      icon: Package,
      title: "Templates & Automations",
      description: "Save time with reusable workflows"
    },
    {
      icon: Lock,
      title: "Secure Cloud Access",
      description: "Enterprise-grade security for your data"
    }
  ]

  const pricingPlans = [
    {
      name: "Beginner",
      price: isYearly ? "₹0" : "₹0",
      period: "month",
      description: "Basic content & task tools",
      features: [
        "Up to 3 team members",
        "Basic task management",
        "Content calendar",
        "Email support"
      ],
      popular: false,
      cta: "Start Free"
    },
    {
      name: "Pro",
      price: isYearly ? "₹399" : "₹499",
      period: "month",
      description: "AI planner, team support",
      features: [
        "Up to 10 team members",
        "AI-powered content planner",
        "Advanced analytics",
        "Priority support",
        "Custom integrations"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Master",
      price: isYearly ? "₹799" : "₹999",
      period: "month",
      description: "All features unlocked",
      features: [
        "Unlimited team members",
        "Advanced AI features",
        "Custom workflows",
        "Dedicated support",
        "White-label options"
      ],
      popular: false,
      cta: "Start Free Trial"
    }
  ]

  const faqs = [
    {
      question: "Is there a free trial?",
      answer: "Yes! We offer a 14-day free trial on all paid plans. No credit card required to start."
    },
    {
      question: "Can I use CreatorBase with my team?",
      answer: "Absolutely! CreatorBase is built for teams. You can invite team members, assign roles, and collaborate seamlessly."
    },
    {
      question: "What if I don't like it?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your subscription."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance."
    }
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CreatorBase</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('faq')} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                FAQ
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link href="/app/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                  {/* User Profile */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm border-2 border-gray-200 ${user?.avatar ? 'hidden' : ''}`}>
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              {/* User Profile for Mobile */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 mb-4">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm border-2 border-gray-200 ${user?.avatar ? 'hidden' : ''}`}>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link href="/app/dashboard">
                    <Button size="sm">Dashboard</Button>
                  </Link>
                </div>
              )}
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }} 
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Features
                </button>
                <button 
                  onClick={() => { scrollToSection('pricing'); setIsMobileMenuOpen(false); }} 
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => { scrollToSection('faq'); setIsMobileMenuOpen(false); }} 
                  className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                >
                  FAQ
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            One Dashboard to Run Your Content Hustle Like a Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            CreatorBase helps 9-to-5 professionals manage content, tasks, and teams — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          <div className="relative">
            <img 
              src="/hero.svg" 
              alt="CreatorBase Dashboard Preview" 
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Built for Modern Side-Hustlers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a creator, indie hacker, or startup founder — CreatorBase helps you do more in less time.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {targetUsers.map((user, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{user.icon}</div>
                  <CardTitle className="text-xl">{user.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{user.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Everything You Need. Nothing You Don't.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for content creators and modern teams.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            See It in Action
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Watch how fast it is to build your workflow with CreatorBase.
          </p>
          <div className="relative max-w-4xl mx-auto">
            <img 
              src="/demo.svg" 
              alt="CreatorBase Demo" 
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Simple Pricing for Every Stage
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Yearly
                <Badge variant="secondary" className="ml-2">Save 20%</Badge>
              </span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Loved by Early Users
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-600 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-center">
                    <div className="text-2xl mr-3">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </CardHeader>
                {openFaq === index && (
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to take your content hustle seriously?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators who have already streamlined their operations.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-blue-200 mt-4 text-sm">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">CreatorBase</span>
              </div>
              <p className="text-gray-400 mb-4">
                The complete platform for content creators and modern teams.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CreatorBase by Akash Khairal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing 