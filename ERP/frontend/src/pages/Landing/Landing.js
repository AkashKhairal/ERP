import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  User
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';

const Landing = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const { isAuthenticated, user } = useAuth();

  // Force light mode for landing page
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
  }, []);

  const testimonials = [
    {
      quote: "We replaced 4 tools with CreatorBase and saved hours weekly.",
      author: "Raj Sharma",
      role: "YouTube Producer",
      avatar: "🎥",
      rating: 5
    },
    {
      quote: "Our SaaS sprints finally feel manageable!",
      author: "Meenal Patel",
      role: "Product Manager",
      avatar: "💼",
      rating: 5
    },
    {
      quote: "The content calendar feature alone is worth the subscription.",
      author: "Alex Chen",
      role: "Content Creator",
      avatar: "📝",
      rating: 5
    }
  ];

  const screenshots = [
    {
      title: "Dashboard Overview",
      description: "Get a bird's eye view of your entire operation",
      image: "/dashboard-preview.png",
      features: ["Real-time metrics", "Quick actions", "Recent activity"]
    },
    {
      title: "Task Management",
      description: "Kanban boards and sprint planning made simple",
      image: "/task-preview.png",
      features: ["Drag & drop", "Sprint planning", "Time tracking"]
    },
    {
      title: "Content Calendar",
      description: "Plan and schedule content across all platforms",
      image: "/content-preview.png",
      features: ["Visual calendar", "Multi-platform", "Asset management"]
    },
    {
      title: "Financial Reports",
      description: "Track revenue, expenses, and profitability",
      image: "/finance-preview.png",
      features: ["P&L reports", "Budget tracking", "Invoice management"]
    }
  ];

  const integrations = [
    { name: "YouTube", icon: "🎥", description: "Pull performance stats automatically" },
    { name: "Google Drive", icon: "☁️", description: "Access scripts and assets" },
    { name: "Slack", icon: "💬", description: "Task updates via chat" },
    { name: "Stripe", icon: "💳", description: "Track revenue & payments" },
    { name: "Notion", icon: "📝", description: "Import content calendars" },
    { name: "GitHub", icon: "🐙", description: "Link PRs to projects" }
  ];

  const features = [
    {
      icon: Users,
      title: "Team & HR Management",
      description: "Onboard your team, track time, manage salaries and leaves — all in one place.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: FolderOpen,
      title: "Project & Task Management",
      description: "Plan, assign, and track tasks using agile sprints, kanban boards, and reminders.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: DollarSign,
      title: "Finance & Budgeting",
      description: "Monitor income, expenses, AdSense, salaries, and send invoices — no spreadsheet needed.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Team productivity, YouTube performance, course sales — all visualized.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: FileText,
      title: "Content & Course Ops",
      description: "Plan content calendars, store scripts, track courses, and collaborate with your editors.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Shield,
      title: "Roles & Permissions",
      description: "Control access for Admins, Tech Leads, Editors, Interns, and HR — securely.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "3 users",
        "2 projects",
        "Basic modules",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Creator Pro",
      price: "₹499",
      period: "/month",
      description: "For growing creators and teams",
      features: [
        "Unlimited users",
        "All modules",
        "Integrations",
        "Priority support",
        "Advanced analytics"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Team",
      price: "₹1299",
      period: "/month",
      description: "For established teams and companies",
      features: [
        "Everything in Pro",
        "AI Assistant",
        "Reports Export",
        "Custom integrations",
        "Dedicated support",
        "White-label options"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    const screenshotInterval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 4000);

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(screenshotInterval);
    };
  }, [testimonials.length, screenshots.length]);

  return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CreatorBase
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors">Integrations</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-600 hidden sm:block">
                      Welcome, {user?.firstName}!
                    </span>
                  </div>
                  <Link to="/app/dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
              🚀 Now with AI Assistant powered by GPT-4
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
            {isAuthenticated ? (
              <>
                Welcome back, {user?.firstName}! 👋
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ready to continue?
                </span>
              </>
            ) : (
              <>
                The Command Center for
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Creators & SaaS Teams
                </span>
              </>
            )}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            {isAuthenticated 
              ? "Your dashboard is ready with all your latest updates and activities."
              : "Manage your content, code, team, tasks, and money — all from one clean, powerful dashboard."
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isAuthenticated ? (
              <>
                <Link to="/app/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto">
                    🚀 Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/app/profile">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2">
                    <User className="mr-2 h-5 w-5" />
                    View Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto">
                    🚀 Start Using Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2">
                  <Play className="mr-2 h-5 w-5" />
                  👀 See Live Demo
                </Button>
              </>
            )}
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-2 border-white"></div>
                ))}
              </div>
              <span className="text-sm">Join 2,000+ creators</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything you need to scale
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Six powerful modules that work together to give you complete control over your creative business.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="mt-4">
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardDescription>
                </CardContent>
              </Card>
            ))}

            {/* AI Assistant Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">AI Assistant (Bonus)</h3>
                <p className="text-gray-600">Powered by GPT-4</p>
                <CardDescription className="mt-4">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Let GPT-4 brainstorm content ideas, summarize tasks, write emails, and provide intelligent insights to boost your productivity.
                  </p>
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots/Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              See CreatorBase in action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beautiful, intuitive, and powerful. Here's what your dashboard will look like.
            </p>
          </div>

          <div className="relative">
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreenshot(index)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentScreenshot === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {screenshot.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{screenshots[currentScreenshot].title}</h3>
                  <p className="text-gray-600">{screenshots[currentScreenshot].description}</p>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Screenshot Preview</p>
                  <p className="text-sm text-gray-500 mt-2">{screenshots[currentScreenshot].title}</p>
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-4">
                {screenshots[currentScreenshot].features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentScreenshot((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentScreenshot((prev) => (prev + 1) % screenshots.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Works with your favorite tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CreatorBase integrates with the tools you already love and use every day.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">{integration.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Loved by creators worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of creators and teams who have transformed their workflow with CreatorBase.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto bg-white shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <Quote className="h-12 w-12 text-blue-600 mx-auto mb-6" />
              <p className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].quote}"
              </p>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].author}</p>
                  <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl' : 'shadow-lg'} border-0 hover:shadow-2xl transition-shadow duration-300`}>
                {plan.popular && (
                  <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  <Button
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Built by creators, for creators
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            CreatorBase is built by a creator-founder for creators and builders.
          </p>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Hi, I'm a YouTube creator and founder of multiple SaaS products. I designed CreatorBase to solve the chaos of content, team, and product management — with simplicity, clarity, and power.
          </p>
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            Join me and thousands of teams already making their workflow calm and structured.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto">
                🎬 Start creating
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto">
                💻 Start building
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto">
                💡 Start now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ready to organize your chaos?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            🎬 Start creating. 💻 Start building. 💡 Start now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto">
                Start Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CB</span>
                </div>
                <span className="text-xl font-bold">CreatorBase</span>
              </div>
              <p className="text-gray-600 mb-4">
                The command center for creators and SaaS teams.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#integrations" className="hover:text-blue-600 transition-colors">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#about" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2025 CreatorBase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 