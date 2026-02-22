/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Globe, 
  Settings, 
  ShieldCheck, 
  Download, 
  Camera, 
  Mic, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Monitor,
  Layout,
  Palette,
  Code,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface AppConfig {
  url: string;
  name: string;
  packageName: string;
  version: string;
  themeColor: string;
  fullscreen: boolean;
  splashScreen: {
    enabled: boolean;
    duration: number;
    backgroundColor: string;
  };
  permissions: {
    camera: boolean;
    microphone: boolean;
    geolocation: boolean;
    storage: boolean;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  url: 'https://example.com',
  name: 'My Web App',
  packageName: 'com.webapp.builder',
  version: '1.0.0',
  themeColor: '#4F46E5',
  fullscreen: true,
  splashScreen: {
    enabled: true,
    duration: 3000,
    backgroundColor: '#4F46E5',
  },
  permissions: {
    camera: true,
    microphone: true,
    geolocation: true,
    storage: true,
  }
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [previewMode, setPreviewMode] = useState<'app' | 'splash'>('app');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const buildSteps = [
    "Initializing build environment...",
    "Configuring Android Manifest...",
    "Injecting WebView bridges...",
    "Optimizing assets and icons...",
    "Signing APK with debug key...",
    "Finalizing package..."
  ];

  const handleBuild = async () => {
    setIsBuilding(true);
    setBuildStep(0);
    setShowResult(false);
    setDownloadUrl(null);

    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Build failed');
      const data = await response.json();
      setDownloadUrl(data.downloadUrl);
      console.log("Build initiated on server:", data);
    } catch (error) {
      console.error("Build error:", error);
    }
  };

  const generatedMainActivity = `package ${config.packageName};

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        ${config.permissions.camera ? '// Camera support enabled\n        webSettings.setMediaPlaybackRequiresUserGesture(false);' : ''}

        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("${config.url}");
    }
}`;

  const [activeCodeFile, setActiveCodeFile] = useState<'manifest' | 'java'>('manifest');

  useEffect(() => {
    if (isBuilding) {
      const interval = setInterval(() => {
        setBuildStep((prev) => {
          if (prev >= buildSteps.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setIsBuilding(false);
              setShowResult(true);
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isBuilding]);

  const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');

  const generatedManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    ${config.permissions.camera ? '<uses-permission android:name="android.permission.CAMERA" />' : ''}
    ${config.permissions.microphone ? '<uses-permission android:name="android.permission.RECORD_AUDIO" />' : ''}
    ${config.permissions.geolocation ? '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />' : ''}
    ${config.permissions.storage ? '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />' : ''}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.name}"
        android:theme="@style/${config.fullscreen ? 'Theme.AppCompat.Light.NoActionBar.FullScreen' : 'AppTheme'}">
        
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Smartphone size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Web2APK <span className="text-indigo-600">Studio</span></h1>
          </div>
          <div className="flex items-center gap-6 ml-8">
            <button 
              onClick={() => setActiveTab('config')}
              className={cn(
                "text-sm font-bold transition-all relative py-5",
                activeTab === 'config' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Configuration
              {activeTab === 'config' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={cn(
                "text-sm font-bold transition-all relative py-5",
                activeTab === 'code' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Source Code
              {activeTab === 'code' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBuild}
              disabled={isBuilding}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isBuilding ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              {isBuilding ? "Building..." : "Generate APK"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'config' ? (
            <>
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="text-indigo-600" size={20} />
                  <h2 className="font-bold text-lg">Source Configuration</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Website URL</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        value={config.url}
                        onChange={(e) => setConfig({...config, url: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="https://your-website.com"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <ExternalLink size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">App Name</label>
                      <input 
                        type="text" 
                        value={config.name}
                        onChange={(e) => setConfig({...config, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Package Name</label>
                      <input 
                        type="text" 
                        value={config.packageName}
                        onChange={(e) => setConfig({...config, packageName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="text-indigo-600" size={20} />
                  <h2 className="font-bold text-lg">Native Permissions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'camera', label: 'Camera Access', icon: Camera, desc: 'Allow app to capture photos/videos' },
                    { id: 'microphone', label: 'Microphone', icon: Mic, desc: 'Allow app to record audio' },
                    { id: 'geolocation', label: 'Location', icon: MapPin, desc: 'Access GPS for location services' },
                    { id: 'storage', label: 'File Uploads', icon: Upload, desc: 'Allow picking files from gallery' },
                  ].map((perm) => (
                    <div 
                      key={perm.id}
                      onClick={() => setConfig({
                        ...config, 
                        permissions: { ...config.permissions, [perm.id]: !config.permissions[perm.id as keyof typeof config.permissions] }
                      })}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                        config.permissions[perm.id as keyof typeof config.permissions] 
                          ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" 
                          : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        config.permissions[perm.id as keyof typeof config.permissions] ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        <perm.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{perm.label}</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            config.permissions[perm.id as keyof typeof config.permissions] ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                          )}>
                            {config.permissions[perm.id as keyof typeof config.permissions] && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{perm.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="text-indigo-600" size={20} />
                  <h2 className="font-bold text-lg">Branding & UI</h2>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Theme Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={config.themeColor}
                          onChange={(e) => setConfig({...config, themeColor: e.target.value})}
                          className="w-12 h-12 rounded-lg border-0 cursor-pointer p-0"
                        />
                        <input 
                          type="text" 
                          value={config.themeColor}
                          onChange={(e) => setConfig({...config, themeColor: e.target.value})}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">App Version</label>
                      <input 
                        type="text" 
                        value={config.version}
                        onChange={(e) => setConfig({...config, version: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm">Full Screen Mode</h3>
                        <p className="text-xs text-slate-500">Hide status bar and navigation for a true immersive experience</p>
                      </div>
                      <button 
                        onClick={() => setConfig({
                          ...config, 
                          fullscreen: !config.fullscreen
                        })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          config.fullscreen ? "bg-indigo-600" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          config.fullscreen ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm">Splash Screen</h3>
                        <p className="text-xs text-slate-500">Show a loading screen when the app starts</p>
                      </div>
                      <button 
                        onClick={() => setConfig({
                          ...config, 
                          splashScreen: { ...config.splashScreen, enabled: !config.splashScreen.enabled }
                        })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          config.splashScreen.enabled ? "bg-indigo-600" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          config.splashScreen.enabled ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    {config.splashScreen.enabled && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Background Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={config.splashScreen.backgroundColor}
                              onChange={(e) => setConfig({
                                ...config, 
                                splashScreen: { ...config.splashScreen, backgroundColor: e.target.value }
                              })}
                              className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0"
                            />
                            <input 
                              type="text" 
                              value={config.splashScreen.backgroundColor}
                              onChange={(e) => setConfig({
                                ...config, 
                                splashScreen: { ...config.splashScreen, backgroundColor: e.target.value }
                              })}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration (ms)</label>
                          <input 
                            type="number" 
                            step="500"
                            min="1000"
                            max="10000"
                            value={config.splashScreen.duration}
                            onChange={(e) => setConfig({
                              ...config, 
                              splashScreen: { ...config.splashScreen, duration: parseInt(e.target.value) }
                            })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="bg-slate-900 rounded-2xl p-6 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => setActiveCodeFile('manifest')}
                      className={cn(
                        "text-[10px] font-mono px-2 py-1 rounded transition-all",
                        activeCodeFile === 'manifest' ? "bg-slate-800 text-indigo-400" : "text-slate-500 hover:text-slate-400"
                      )}
                    >
                      AndroidManifest.xml
                    </button>
                    <button 
                      onClick={() => setActiveCodeFile('java')}
                      className={cn(
                        "text-[10px] font-mono px-2 py-1 rounded transition-all",
                        activeCodeFile === 'java' ? "bg-slate-800 text-indigo-400" : "text-slate-500 hover:text-slate-400"
                      )}
                    >
                      MainActivity.java
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(activeCodeFile === 'manifest' ? generatedManifest : generatedMainActivity)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <pre className="flex-1 font-mono text-sm text-indigo-300 overflow-auto p-4 bg-slate-950 rounded-xl border border-slate-800">
                <code>{activeCodeFile === 'manifest' ? generatedManifest : generatedMainActivity}</code>
              </pre>
              <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-xs text-indigo-300 leading-relaxed">
                  <span className="font-bold text-indigo-400">Pro Tip:</span> This {activeCodeFile === 'manifest' ? 'manifest' : 'Java class'} is ready for production. Use it in your Android Studio project to create a professional wrapper.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button 
                onClick={() => setPreviewMode('app')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                  previewMode === 'app' ? "bg-indigo-600 text-white shadow-md" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                )}
              >
                App Interface
              </button>
              <button 
                onClick={() => setPreviewMode('splash')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                  previewMode === 'splash' ? "bg-indigo-600 text-white shadow-md" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                )}
              >
                Splash Screen
              </button>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-[8px] border-slate-800 relative mx-auto max-w-[320px] aspect-[9/19]">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-8 h-1 rounded-full bg-slate-700" />
              </div>

              {/* Screen Content */}
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">
                  {previewMode === 'splash' ? (
                    <motion.div 
                      key="splash"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white"
                      style={{ backgroundColor: config.splashScreen.backgroundColor }}
                    >
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md mb-6"
                      >
                        <Globe size={48} />
                      </motion.div>
                      <motion.h3 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl font-bold"
                      >
                        {config.name}
                      </motion.h3>
                      <div className="absolute bottom-12">
                        <Loader2 className="animate-spin opacity-50" size={24} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="app"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col h-full"
                    >
                      {/* Status Bar - Only show if NOT fullscreen */}
                      {!config.fullscreen && (
                        <div 
                          className="h-12 flex items-end justify-between px-6 pb-2 text-white"
                          style={{ backgroundColor: config.themeColor }}
                        >
                          <span className="text-[10px] font-bold">9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-2 border border-white/50 rounded-sm" />
                            <div className="w-2 h-2 bg-white/50 rounded-full" />
                          </div>
                        </div>
                      )}

                      {/* WebView Simulation */}
                      <div className={cn(
                        "flex-1 bg-slate-50 flex flex-col items-center justify-center text-center relative overflow-hidden",
                        !config.fullscreen && "p-6"
                      )}>
                        {/* Website Content Mockup */}
                        <div className="absolute inset-0 bg-white flex flex-col">
                          {/* Mock Browser Header (Subtle) */}
                          {!config.fullscreen && (
                            <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50">
                              <div className="w-2 h-2 rounded-full bg-slate-200" />
                              <div className="flex-1 h-5 bg-white rounded-md border border-slate-200 flex items-center px-2">
                                <span className="text-[8px] text-slate-400 truncate">{config.url}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex-1 p-6 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl shadow-md mb-4 flex items-center justify-center text-white" style={{ backgroundColor: config.themeColor }}>
                              <Globe size={32} />
                            </div>
                            <h3 className="font-bold text-sm text-slate-900">{config.name}</h3>
                            <p className="text-[9px] text-slate-400 mt-1">Website Content Area</p>
                            
                            <div className="mt-6 w-full space-y-2 max-w-[200px]">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                              <div className="h-1.5 w-3/4 bg-slate-100 rounded-full" />
                              <div className="h-1.5 w-1/2 bg-slate-100 rounded-full" />
                            </div>
                          </div>
                        </div>

                        {/* Floating Permission Indicators (Only if not fullscreen or as subtle overlays) */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-20 pointer-events-none">
                          {config.permissions.camera && <Camera size={12} />}
                          {config.permissions.microphone && <Mic size={12} />}
                          {config.permissions.storage && <Upload size={12} />}
                          {config.permissions.geolocation && <MapPin size={12} />}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Home Indicator */}
                <div className="h-8 flex items-center justify-center bg-white">
                  <div className="w-24 h-1 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>

            <div className="mt-8 bg-indigo-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Code size={20} className="text-indigo-400" />
                  Build Summary
                </h4>
                <ul className="space-y-2 text-sm text-indigo-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    WebView Engine: Chromium 120+
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Target SDK: Android 14 (API 34)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Native Bridges: Enabled
                  </li>
                </ul>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Smartphone size={120} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Build Overlay */}
      <AnimatePresence>
        {isBuilding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                  <Smartphone size={32} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Building Your APK</h2>
              <p className="text-slate-500 mb-8">This usually takes about 60 seconds. Please don't close this window.</p>
              
              <div className="space-y-4 text-left">
                {buildSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      idx < buildStep ? "bg-emerald-500 text-white" : 
                      idx === buildStep ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-300"
                    )}>
                      {idx < buildStep ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      idx === buildStep ? "text-slate-900" : "text-slate-400"
                    )}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-indigo-600 p-8 text-white text-center relative">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Build Successful!</h2>
                <p className="text-indigo-100">Your Android application package is ready for deployment.</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase">File Name</span>
                    <p className="font-mono text-sm mt-1">{config.name.toLowerCase().replace(/\s+/g, '-')}-v{config.version}.apk</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase">File Size</span>
                    <p className="font-mono text-sm mt-1">4.2 MB</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <a 
                    href={downloadUrl || '#'} 
                    download={`${config.name.toLowerCase().replace(/\s+/g, '-')}-v${config.version}.apk`}
                    className={cn(
                      "w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2",
                      !downloadUrl && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      if (!downloadUrl) e.preventDefault();
                    }}
                  >
                    <Download size={20} />
                    Download APK
                  </a>
                  <button 
                    onClick={() => setShowResult(false)}
                    className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Back to Editor
                  </button>
                </div>

                <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={20} />
                  <div>
                    <h5 className="text-sm font-bold text-amber-900">Important Note</h5>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      This is a debug-signed APK. To publish on the Google Play Store, you will need to sign it with a production release key.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Builder App Splash Screen */}
      <AnimatePresence>
        {showSplashScreen && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-indigo-600 flex flex-col items-center justify-center text-white"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-32 h-32 bg-white/20 rounded-[2.5rem] flex items-center justify-center backdrop-blur-xl mb-8 shadow-2xl border border-white/30"
            >
              <Smartphone size={64} />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl font-black tracking-tighter mb-2">Web2APK Studio</h1>
              <p className="text-indigo-100 font-medium opacity-80">Professional App Builder</p>
            </motion.div>
            
            <div className="absolute bottom-16 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-white/50" size={32} />
              <span className="text-xs font-bold tracking-widest uppercase text-white/40">Loading Workspace</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
