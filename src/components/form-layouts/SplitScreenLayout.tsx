import { LayoutProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, ArrowRight } from "lucide-react";

export const SplitScreenLayout = ({ fields, renderField }: LayoutProps) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      {/* Left Decoration Panel */}
      <div className="lg:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-8 backdrop-blur-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Complete Your Application</h2>
          <p className="text-slate-300 leading-relaxed">
            Please fill out the form accurately. Your information helps us process your request faster.
          </p>
        </div>

        <div className="relative z-10 mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <span>Secure Form</span>
            <div className="h-1 w-1 bg-slate-400 rounded-full" />
            <span>Encrypted</span>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 p-8 md:p-12 bg-gray-50/50 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
