import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Home, ArrowLeft, Search, AlertCircle, Compass, Sparkles } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Elements */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-md w-full"
        >
          {/* Main Card */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Top Accent Line */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="p-8 text-center">
              {/* Animated 404 */}
              <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative inline-block mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-20" />
                <div className="relative flex items-center justify-center">
                <span className="text-8xl font-black bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
                  4
                </span>
                  <div className="relative mx-2">
                    <AlertCircle className="w-20 h-20 text-slate-400" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                      <Compass className="w-10 h-10 text-blue-500" />
                    </motion.div>
                  </div>
                  <span className="text-8xl font-black bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
                  4
                </span>
                </div>
              </motion.div>

              {/* Error Message */}
              <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-slate-800 mt-4 mb-2">
                  Page Not Found
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">404 Error</span>
                </div>
                <p className="text-slate-500 mb-6">
                  Oops! The page you're looking for doesn't exist or has been moved to another URL.
                </p>
              </motion.div>

              {/* Search Suggestion */}
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Search className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-700 mb-1">Looking for something specific?</p>
                    <p className="text-xs text-slate-500">
                      Try checking the URL for typos, or go back to the modules page to access your tools.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="group flex items-center gap-2 px-5 py-2.5 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Go Back
                </Button>
                <Button
                    onClick={() => navigate("/modules")}
                    className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Go to Modules
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Footer Note */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-6"
          >
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Need help?</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>Contact support</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                <span>Return to home</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
}