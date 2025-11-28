import { LayoutProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, User, Menu, Globe, ChevronRight, CheckCircle2 } from "lucide-react";
import { WebsiteContext } from "@/types/form-config";

export const WebsiteStyleLayout = ({ fields, renderField, websiteContext }: LayoutProps) => {
  // Use provided context or fallbacks
  const context: WebsiteContext = websiteContext || {
    companyName: "Form Playground",
    themeColor: "#2563EB", // Blue-600
    navigationItems: [
      { label: "Home", href: "#", active: true },
      { label: "Services", href: "#" },
      { label: "About", href: "#" },
      { label: "Contact", href: "#" }
    ],
    heroTitle: "Form Application",
    heroSubtitle: "Complete the form below to proceed with your request.",
    footerLinks: [
      {
        title: "Company",
        links: [
          { label: "About Us", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Press", href: "#" }
        ]
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "#" },
          { label: "Help Center", href: "#" },
          { label: "Guidelines", href: "#" }
        ]
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "#" },
          { label: "Terms", href: "#" },
          { label: "Cookie Policy", href: "#" }
        ]
      }
    ]
  };

  // Split fields logic
  // If sidebar content exists, put all fields in main column (left)
  // Otherwise split them 50/50
  let leftFields = fields;
  let rightFields: typeof fields = [];

  if (!context.sidebarContent) {
    const midpoint = Math.ceil(fields.length / 2);
    leftFields = fields.slice(0, midpoint);
    rightFields = fields.slice(midpoint);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Dynamic Style Injection for Theme Color */}
      <style>{`
        :root {
          --theme-primary: ${context.themeColor};
        }
        .theme-text { color: var(--theme-primary); }
        .theme-bg { background-color: var(--theme-primary); }
        .theme-border { border-color: var(--theme-primary); }
        .theme-hover-bg:hover { background-color: var(--theme-primary); opacity: 0.9; }
      `}</style>

      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3 cursor-pointer">
              {context.logoUrl && context.logoUrl.length > 3 ? (
                <img src={context.logoUrl} alt="Logo" className="h-8 w-auto" />
              ) : (
                <div className="w-10 h-10 theme-bg rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {context.logoUrl || context.companyName.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-gray-900 tracking-tight">{context.companyName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {context.navigationItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={(e) => e.preventDefault()}
                  className={`text-sm font-medium transition-colors cursor-default ${item.active ? 'theme-text' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700 cursor-default" onClick={(e) => e.preventDefault()}>
                <Search className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <Button className="theme-bg hover:opacity-90 text-white border-none shadow-md cursor-default" onClick={(e) => e.preventDefault()}>
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              {context.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {context.heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Main Form Column */}
          <div className="flex-1 w-full min-w-0">

            {/* If no sidebar, we might split fields into two columns within the main area */}
            {!context.sidebarContent && rightFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card className="border-t-4 theme-border shadow-md">
                    <CardHeader>
                      <CardTitle>Primary Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {leftFields.map((field) => (
                        <div key={field.id}>{renderField(field)}</div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card className="border-t-4 border-gray-300 shadow-md">
                    <CardHeader>
                      <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {rightFields.map((field) => (
                        <div key={field.id}>{renderField(field)}</div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // Single column layout (used when sidebar is present OR fields list is small)
              <Card className="border-t-4 theme-border shadow-lg">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle className="text-xl">Application Form</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                  {fields.map((field) => (
                    <div key={field.id}>{renderField(field)}</div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar Column (if content exists) */}
          {context.sidebarContent && (
            <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
              <Card className="bg-white shadow-md border border-gray-200 lg:sticky lg:top-24">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {context.sidebarContent.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="prose prose-sm text-gray-600">
                    <p>{context.sidebarContent.content}</p>
                  </div>

                  {context.sidebarContent.links && context.sidebarContent.links.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900">Quick Links</h4>
                      <ul className="space-y-2">
                        {context.sidebarContent.links.map((link, idx) => (
                          <li key={idx}>
                            <button onClick={(e) => e.preventDefault()} className="text-sm theme-text hover:underline flex items-center gap-2 cursor-default text-left">
                              <ChevronRight className="w-3 h-3" />
                              {link.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900">Secure Submission</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Your data is encrypted and sent securely.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 theme-bg rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {context.logoUrl || context.companyName.charAt(0)}
                  </span>
                </div>
                <span className="text-lg font-bold">{context.companyName}</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making the world a better place through structured data collection.
              </p>
            </div>

            {context.footerLinks.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <button onClick={(e) => e.preventDefault()} className="text-gray-400 hover:text-white text-sm transition-colors cursor-default text-left">
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {context.companyName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button onClick={(e) => e.preventDefault()} className="text-gray-500 hover:text-white transition-colors cursor-default">
                <Globe className="w-5 h-5" />
              </button>
              <button onClick={(e) => e.preventDefault()} className="text-gray-500 hover:text-white transition-colors cursor-default">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
