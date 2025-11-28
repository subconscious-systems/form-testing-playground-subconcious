import { LayoutProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, User, Menu, Globe } from "lucide-react";

export const WebsiteStyleLayout = ({ fields, renderField }: LayoutProps) => {
  // Split fields into left and right sections
  const midpoint = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, midpoint);
  const rightFields = fields.slice(midpoint);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section - Dummy Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Form Playground</span>
            </div>

            {/* Navigation Links - Dummy */}
            <nav className="hidden md:flex items-center gap-6">
              <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-not-allowed opacity-60">
                <Globe className="w-4 h-4" />
                <span>English</span>
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-not-allowed opacity-60">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 cursor-not-allowed opacity-60">
                Careers Page
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-not-allowed opacity-60">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-700 cursor-not-allowed opacity-60">
                Join Community
              </button>
            </nav>

            {/* Mobile Menu - Dummy */}
            <button className="md:hidden text-gray-600 cursor-not-allowed opacity-60">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero/Banner Section - Dummy */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Form Application</h1>
              <p className="text-blue-100">Complete the form below to proceed</p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button variant="secondary" className="cursor-not-allowed opacity-60" disabled>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="secondary" className="cursor-not-allowed opacity-60" disabled>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form Fields */}
          <div className="space-y-6">
            {/* Dummy Card Header */}
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Form Information
                  </CardTitle>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {leftFields.map((field) => (
                  <div key={field.id}>
                    {renderField(field)}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dummy Action Card */}
            <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-500 font-medium">Quick Actions</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" className="cursor-not-allowed opacity-60" disabled>
                      Save Draft
                    </Button>
                    <Button variant="outline" size="sm" className="cursor-not-allowed opacity-60" disabled>
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-6">
            {/* Dummy Card Header */}
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Additional Details
                  </CardTitle>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                    Optional
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rightFields.length > 0 ? (
                  rightFields.map((field) => (
                    <div key={field.id}>
                      {renderField(field)}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No additional fields</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dummy Info Card */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Need Help?</h3>
                  <p className="text-xs text-gray-600">
                    This is a dummy help section. Click the buttons below for assistance.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="cursor-not-allowed opacity-60" disabled>
                      Contact Support
                    </Button>
                    <Button variant="ghost" size="sm" className="cursor-not-allowed opacity-60" disabled>
                      View FAQ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Dummy Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex gap-4">
              <button className="hover:text-gray-700 cursor-not-allowed opacity-60" disabled>
                Privacy Policy
              </button>
              <button className="hover:text-gray-700 cursor-not-allowed opacity-60" disabled>
                Terms of Service
              </button>
              <button className="hover:text-gray-700 cursor-not-allowed opacity-60" disabled>
                Contact
              </button>
            </div>
            <p className="text-xs">© 2024 Form Playground. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

