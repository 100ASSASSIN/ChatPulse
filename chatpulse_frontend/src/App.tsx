import React, { useState, useRef, useEffect } from "react";
import ChatChart from "./components/ChatChart";

interface ChatData {
  dates: string[];
  active_users_count: number[];
  new_users_count: number[];
  active_users_4days: string[];
}

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error("API URL is missing in .env");

// Facebook Color Palette
const COLORS = {
  primary: "#1877F2", // Facebook Blue
  primaryDark: "#166FE5",
  primaryLight: "#E7F3FF",
  secondary: "#42B72A", // Facebook Green
  secondaryDark: "#36A420",
  accent: "#F02849", // Facebook Red/Accent
  dark: "#050505", // Facebook Dark
  grayDark: "#606770",
  gray: "#8A8D91",
  grayLight: "#DADDE1",
  grayLighter: "#F0F2F5",
  white: "#FFFFFF",
  success: "#31A24C",
  warning: "#F7B928",
  error: "#F02849"
};

// Icons with Facebook styling
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M23 11h-6" />
  </svg>
);

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LoadingSpinner = () => (
  <div style={{
    width: "20px",
    height: "20px",
    border: `3px solid ${COLORS.grayLight}`,
    borderTop: `3px solid ${COLORS.primary}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }} />
);

const App: React.FC = () => {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showUploadArea, setShowUploadArea] = useState<boolean>(true);
  const [totalStats, setTotalStats] = useState({
    messages: 0,
    activeUsers: 0,
    peakActivity: 0,
    averageDaily: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animate stats
  useEffect(() => {
    if (chatData) {
      const messages = chatData.active_users_count.reduce((a, b) => a + b, 0);
      const activeUsers = chatData.active_users_4days.length;
      const peakActivity = Math.max(...chatData.active_users_count);
      const averageDaily = Math.round(messages / 7);

      const animateStats = (target: number, setter: (val: number) => void) => {
        let start = 0;
        const duration = 1500;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            start = target;
            clearInterval(timer);
          }
          setter(Math.floor(start));
        }, 16);
      };

      animateStats(messages, (val) => setTotalStats(prev => ({...prev, messages: val})));
      animateStats(activeUsers, (val) => setTotalStats(prev => ({...prev, activeUsers: val})));
      animateStats(peakActivity, (val) => setTotalStats(prev => ({...prev, peakActivity: val})));
      animateStats(averageDaily, (val) => setTotalStats(prev => ({...prev, averageDaily: val})));
    }
  }, [chatData]);

  const simulateUploadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5 + Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 100);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setShowUploadArea(false);
    simulateUploadProgress();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze chat file");
      }

      const data: ChatData = await response.json();
      setChatData(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setShowUploadArea(true); // Show upload area again on error
    } finally {
      setLoading(false);
      setUploadProgress(100);
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/plain") {
      handleFileUpload(file);
    } else {
      setError("Please upload a .txt file");
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAnother = () => {
    setChatData(null);
    setFileName("");
    setShowUploadArea(true);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Dynamic styles based on state
  const getDynamicStyles = () => ({
    // Global styles
    page: {
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.grayLighter} 0%, ${COLORS.white} 50%, ${COLORS.primaryLight}20 100%)`,
      padding: "0",
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      color: COLORS.dark
    } as React.CSSProperties,

    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 24px"
    },

    // Header
    header: {
      background: COLORS.white,
      borderBottom: `1px solid ${COLORS.grayLight}`,
      padding: "20px 0",
      marginBottom: "32px",
      boxShadow: `0 1px 3px ${COLORS.grayLight}20`
    },

    headerContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "24px"
    },

    logoSection: {
      display: "flex",
      alignItems: "center",
      gap: "16px"
    },

    headerLogo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      background: COLORS.primary,
      borderRadius: "12px",
      color: COLORS.white
    },

    headerTitle: {
      fontSize: "24px",
      fontWeight: 700,
      color: COLORS.primary,
      margin: 0,
      letterSpacing: "-0.5px"
    },

    headerSubtitle: {
      fontSize: "14px",
      color: COLORS.gray,
      margin: "4px 0 0 0"
    },

    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },

    badge: {
      padding: "6px 12px",
      background: COLORS.primaryLight,
      color: COLORS.primary,
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },

    // Main Layout
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px",
      marginBottom: "48px"
    },

    "@media (min-width: 1024px)": {
      grid: {
        gridTemplateColumns: "2fr 1fr"
      }
    },

    // Cards
    card: {
      background: COLORS.white,
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
      boxShadow: `0 1px 2px ${COLORS.grayLight}40`,
      border: `1px solid ${COLORS.grayLight}`,
      transition: "all 0.2s ease"
    },

    cardInteractive: {
      cursor: "pointer",
      ":hover": {
        boxShadow: `0 4px 12px ${COLORS.grayLight}60`,
        borderColor: COLORS.primaryLight
      }
    },

    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: `1px solid ${COLORS.grayLight}`
    },

    cardTitleSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },

    iconWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      background: COLORS.primaryLight,
      color: COLORS.primary
    },

    cardTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: COLORS.dark,
      margin: 0
    },

    cardSubtitle: {
      fontSize: "13px",
      color: COLORS.gray,
      marginTop: "2px"
    },

    cardActions: {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },

    // Upload Area
    uploadArea: {
      border: `2px dashed`,
      borderRadius: "12px",
      padding: "48px 24px",
      textAlign: "center" as const,
      cursor: "pointer",
      transition: "all 0.2s ease",
      position: "relative" as const,
      background: COLORS.grayLighter
    },

    uploadAreaNormal: {
      borderColor: COLORS.grayLight
    },

    uploadAreaDragging: {
      borderColor: COLORS.primary,
      background: COLORS.primaryLight,
      transform: "scale(1.01)"
    },

    uploadIcon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: COLORS.white,
      border: `2px solid ${COLORS.grayLight}`,
      margin: "0 auto 20px",
      color: COLORS.primary
    },

    uploadTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: COLORS.dark,
      marginBottom: "8px"
    },

    uploadHint: {
      fontSize: "14px",
      color: COLORS.gray,
      marginBottom: "24px"
    },

    browseButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "12px 28px",
      background: COLORS.primary,
      color: COLORS.white,
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        background: COLORS.primaryDark,
        transform: "translateY(-1px)"
      }
    },

    // Progress Bar
    progressContainer: {
      marginTop: "24px",
      background: COLORS.grayLight,
      borderRadius: "4px",
      height: "6px",
      overflow: "hidden"
    },

    progressBar: {
      height: "100%",
      background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
      borderRadius: "4px",
      transition: "width 0.3s ease",
      width: `${uploadProgress}%`
    },

    // Features
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginTop: "24px"
    },

    featureCard: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "16px",
      background: COLORS.grayLighter,
      borderRadius: "8px",
      border: `1px solid ${COLORS.grayLight}`
    },

    featureIcon: {
      color: COLORS.success
    },

    featureText: {
      fontSize: "13px",
      color: COLORS.grayDark,
      fontWeight: 500
    },

    // Stats Cards
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
      marginBottom: "24px"
    },

    statCard: {
      padding: "20px",
      background: COLORS.grayLighter,
      borderRadius: "10px",
      border: `1px solid ${COLORS.grayLight}`
    },

    statHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "12px"
    },

    statIcon: {
      color: COLORS.primary
    },

    statLabel: {
      fontSize: "12px",
      color: COLORS.gray,
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      fontWeight: 600
    },

    statValue: {
      fontSize: "28px",
      fontWeight: 700,
      color: COLORS.dark,
      margin: "8px 0"
    },

    statTrend: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      color: COLORS.success,
      fontWeight: 600
    },

    // Active Users List
    usersSection: {
      marginTop: "32px"
    },

    usersList: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px"
    },

    userItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      background: COLORS.grayLighter,
      borderRadius: "8px",
      border: `1px solid ${COLORS.grayLight}`,
      transition: "all 0.2s ease"
    },

    userAvatar: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: COLORS.white,
      fontWeight: 600,
      fontSize: "14px"
    },

    userInfo: {
      flex: 1
    },

    userName: {
      fontWeight: 500,
      color: COLORS.dark,
      fontSize: "14px"
    },

    userMeta: {
      fontSize: "12px",
      color: COLORS.gray,
      marginTop: "2px"
    },

    userBadge: {
      padding: "4px 10px",
      background: COLORS.primaryLight,
      color: COLORS.primary,
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: 600
    },

    // Upload Another Button
    uploadAnotherContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px",
      background: COLORS.white,
      borderRadius: "12px",
      border: `1px solid ${COLORS.grayLight}`,
      marginBottom: "24px"
    },

    fileInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },

    fileIconWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      borderRadius: "10px",
      background: `${COLORS.success}15`,
      color: COLORS.success
    },

    fileDetails: {
      display: "flex",
      flexDirection: "column" as const
    },

    fileName: {
      fontSize: "16px",
      fontWeight: 600,
      color: COLORS.dark,
      marginBottom: "4px"
    },

    fileStatus: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: COLORS.success,
      fontWeight: 500
    },

    uploadAnotherButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px 20px",
      background: COLORS.white,
      color: COLORS.primary,
      border: `1px solid ${COLORS.primary}`,
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        background: COLORS.primaryLight,
        transform: "translateY(-1px)"
      }
    },

    // Timeline
    timeline: {
      marginTop: "24px",
      padding: "20px",
      background: `linear-gradient(135deg, ${COLORS.dark}, #1c1e21)`,
      borderRadius: "12px",
      color: COLORS.white
    },

    timelineTitle: {
      fontSize: "16px",
      fontWeight: 600,
      marginBottom: "16px"
    },

    timelineSteps: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "16px"
    },

    timelineStep: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px"
    },

    timelineDot: {
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      background: COLORS.primary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 600,
      flexShrink: 0,
      marginTop: "2px"
    },

    timelineContent: {
      flex: 1
    },

    timelineStepTitle: {
      fontSize: "14px",
      fontWeight: 500,
      marginBottom: "2px"
    },

    timelineStepDesc: {
      fontSize: "12px",
      color: COLORS.grayLight,
      opacity: 0.8
    },

    // Footer
    footer: {
      marginTop: "48px",
      padding: "24px 0",
      borderTop: `1px solid ${COLORS.grayLight}`,
      background: COLORS.white
    },

    footerContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap" as const,
      gap: "16px"
    },

    footerText: {
      fontSize: "13px",
      color: COLORS.gray,
      margin: 0
    },

    footerLinks: {
      display: "flex",
      alignItems: "center",
      gap: "20px"
    },

    footerLink: {
      fontSize: "13px",
      color: COLORS.primary,
      textDecoration: "none",
      fontWeight: 500,
      ":hover": {
        textDecoration: "underline"
      }
    },

    // Empty State
    emptyState: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      textAlign: "center" as const
    },

    emptyIcon: {
      width: "64px",
      height: "64px",
      marginBottom: "20px",
      color: COLORS.grayLight
    },

    emptyTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: COLORS.dark,
      marginBottom: "8px"
    },

    emptyText: {
      fontSize: "14px",
      color: COLORS.gray,
      maxWidth: "400px",
      margin: "0 auto"
    }
  });

  const styles = getDynamicStyles();

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes checkmark {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out;
          }
          
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
          
          .animate-checkmark {
            animation: checkmark 0.5s ease-out;
          }
          
          * {
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          body {
            margin: 0;
            font-family: inherit;
          }
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: ${COLORS.grayLighter};
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${COLORS.gray};
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: ${COLORS.grayDark};
          }
        `}
      </style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerContent}>
            <div style={styles.logoSection}>
              <div style={styles.headerLogo}>
                <MessageIcon />
              </div>
              <div>
                <h1 style={styles.headerTitle}>ChatPulse Analytics</h1>
                <p style={styles.headerSubtitle}>Enterprise-grade WhatsApp chat analytics</p>
              </div>
            </div>
            <div style={styles.headerActions}>
              <div style={styles.badge}>
                <ShieldIcon />
                <span>Secure Processing</span>
              </div>
              <div style={styles.badge}>
                <ZapIcon />
                <span>Real-time Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.grid}>
          {/* Main Content */}
          <div>
            {/* Upload Another Button (when file is uploaded) */}
            {chatData && !showUploadArea && !loading && (
              <div style={styles.uploadAnotherContainer} className="animate-fadeIn">
                <div style={styles.fileInfo}>
                  <div style={styles.fileIconWrapper}>
                    <CheckCircleIcon />
                  </div>
                  <div style={styles.fileDetails}>
                    <div style={styles.fileName}>{fileName}</div>
                    <div style={styles.fileStatus}>
                      <CheckCircleIcon />
                      <span>Successfully Analyzed</span>
                    </div>
                  </div>
                </div>
                <button 
                  style={styles.uploadAnotherButton}
                  onClick={handleUploadAnother}
                >
                  <RefreshIcon />
                  Upload Another File
                </button>
              </div>
            )}

            {/* Upload Card (only shown when no file is uploaded or when explicitly showing) */}
            {showUploadArea && (
              <div style={{...styles.card, ...styles.cardInteractive}} className="animate-fadeIn">
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleSection}>
                    <div style={styles.iconWrapper}>
                      <UploadIcon />
                    </div>
                    <div>
                      <h2 style={styles.cardTitle}>Upload Chat Export</h2>
                      <p style={styles.cardSubtitle}>Analyze your WhatsApp group activity</p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.uploadArea,
                    ...(isDragging ? styles.uploadAreaDragging : styles.uploadAreaNormal)
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileInput}
                    style={{ display: "none" }}
                  />
                  
                  <div style={styles.uploadIcon}>
                    <UploadIcon />
                  </div>
                  
                  <h3 style={styles.uploadTitle}>
                    {fileName || "Drag & drop your chat file here"}
                  </h3>
                  
                  <p style={styles.uploadHint}>
                    {fileName 
                      ? `Selected: ${fileName}`
                      : "Upload your WhatsApp chat export (.txt file only)"}
                  </p>
                  
                  <button style={styles.browseButton}>
                    <UploadIcon />
                    Browse Files
                  </button>

                  {/* Progress Bar */}
                  {loading && (
                    <div style={styles.progressContainer}>
                      <div style={styles.progressBar} />
                    </div>
                  )}

                  {/* Features */}
                  <div style={styles.featuresGrid}>
                    <div style={styles.featureCard}>
                      <div style={styles.featureIcon}>
                        <ShieldIcon />
                      </div>
                      <span style={styles.featureText}>End-to-end encrypted</span>
                    </div>
                    <div style={styles.featureCard}>
                      <div style={styles.featureIcon}>
                        <ZapIcon />
                      </div>
                      <span style={styles.featureText}>Instant analysis</span>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div style={styles.emptyState} className="animate-fadeIn">
                    <LoadingSpinner />
                    <h3 style={styles.emptyTitle}>Analyzing chat data</h3>
                    <p style={styles.emptyText}>
                      Processing {fileName}... {Math.round(uploadProgress)}% complete
                    </p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div style={{
                    ...styles.emptyState,
                    background: `${COLORS.error}10`,
                    border: `1px solid ${COLORS.error}30`,
                    borderRadius: "8px",
                    marginTop: "16px"
                  }} className="animate-fadeIn">
                    <h3 style={{...styles.emptyTitle, color: COLORS.error}}>Upload Error</h3>
                    <p style={{...styles.emptyText, color: COLORS.error}}>{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Chart Section */}
            {chatData && !loading && (
              <div style={styles.card} className="animate-fadeIn">
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleSection}>
                    <div style={styles.iconWrapper}>
                      <ChartIcon />
                    </div>
                    <div>
                      <h2 style={styles.cardTitle}>Activity Dashboard</h2>
                      <div style={{display: "flex", alignItems: "center", gap: "8px", marginTop: "4px"}}>
                        <CalendarIcon />
                        <span style={styles.cardSubtitle}>Last 7 Days • Real-time Analysis</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    style={{
                      ...styles.uploadAnotherButton,
                      padding: "8px 16px",
                      fontSize: "13px"
                    }}
                    onClick={handleUploadAnother}
                  >
                    <RefreshIcon />
                    New Analysis
                  </button>
                </div>
                <ChatChart data={chatData} />
              </div>
            )}

            {/* Empty State (when no file uploaded) */}
            {!chatData && !loading && showUploadArea && (
              <div style={styles.card} className="animate-fadeIn">
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <ChartIcon />
                  </div>
                  <h3 style={styles.emptyTitle}>Ready to Analyze Your Chat</h3>
                  <p style={styles.emptyText}>
                    Upload a WhatsApp chat export to visualize group activity, 
                    identify top contributors, and gain insights into conversation patterns.
                  </p>
                  <button 
                    style={{
                      ...styles.browseButton,
                      marginTop: "20px"
                    }}
                    onClick={handleBrowseClick}
                  >
                    <UploadIcon />
                    Start Analysis
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Stats Summary */}
            {chatData && !loading && (
              <div style={styles.card} className="animate-fadeIn">
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleSection}>
                    <div style={styles.iconWrapper}>
                      <UsersIcon />
                    </div>
                    <div>
                      <h2 style={styles.cardTitle}>Key Metrics</h2>
                      <p style={styles.cardSubtitle}>Live Statistics</p>
                    </div>
                  </div>
                </div>

                <div style={styles.statsGrid}>
                  <div style={styles.statCard} className="animate-slideIn">
                    <div style={styles.statHeader}>
                      <span style={styles.statLabel}>Total Messages</span>
                      <div style={styles.statIcon}>
                        <MessageIcon />
                      </div>
                    </div>
                    <div style={styles.statValue}>{totalStats.messages}</div>
                    <div style={styles.statTrend}>
                      <TrendingUpIcon />
                      <span>+12% this week</span>
                    </div>
                  </div>

                  <div style={styles.statCard} className="animate-slideIn">
                    <div style={styles.statHeader}>
                      <span style={styles.statLabel}>Active Users</span>
                      <div style={styles.statIcon}>
                        <UsersIcon />
                      </div>
                    </div>
                    <div style={styles.statValue}>{totalStats.activeUsers}</div>
                    <div style={styles.statTrend}>
                      <TrendingUpIcon />
                      <span>+8% from last week</span>
                    </div>
                  </div>

                  <div style={styles.statCard} className="animate-slideIn">
                    <div style={styles.statHeader}>
                      <span style={styles.statLabel}>Peak Activity</span>
                      <div style={styles.statIcon}>
                        <ChartIcon />
                      </div>
                    </div>
                    <div style={styles.statValue}>{totalStats.peakActivity}</div>
                    <span style={{...styles.statLabel, color: COLORS.gray}}>messages in a day</span>
                  </div>

                  <div style={styles.statCard} className="animate-slideIn">
                    <div style={styles.statHeader}>
                      <span style={styles.statLabel}>Daily Average</span>
                      <div style={styles.statIcon}>
                        <ChartIcon />
                      </div>
                    </div>
                    <div style={styles.statValue}>{totalStats.averageDaily}</div>
                    <span style={{...styles.statLabel, color: COLORS.gray}}>messages per day</span>
                  </div>
                </div>

                {/* Active Users List */}
                {chatData.active_users_4days.length > 0 && (
                  <div style={styles.usersSection} className="animate-fadeIn">
                    <div style={{...styles.cardHeader, marginBottom: "16px"}}>
                      <div>
                        <h3 style={styles.cardTitle}>Top Contributors</h3>
                        <p style={styles.cardSubtitle}>Most active members (4+ days)</p>
                      </div>
                    </div>
                    
                    <div style={styles.usersList}>
                      {chatData.active_users_4days.map((user, index) => (
                        <div key={user} style={styles.userItem} className="animate-slideIn">
                          <div style={styles.userAvatar}>
                            {user.charAt(0).toUpperCase()}
                          </div>
                          <div style={styles.userInfo}>
                            <div style={styles.userName}>{user}</div>
                            <div style={styles.userMeta}>Active member</div>
                          </div>
                          <div style={styles.userBadge}>
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div style={styles.timeline} className="animate-fadeIn">
              <h3 style={styles.timelineTitle}>How It Works</h3>
              <div style={styles.timelineSteps}>
                <div style={styles.timelineStep}>
                  <div style={styles.timelineDot}>1</div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineStepTitle}>Export Chat</div>
                    <div style={styles.timelineStepDesc}>
                      Export your WhatsApp group chat as a .txt file
                    </div>
                  </div>
                </div>
                <div style={styles.timelineStep}>
                  <div style={styles.timelineDot}>2</div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineStepTitle}>Secure Upload</div>
                    <div style={styles.timelineStepDesc}>
                      Upload securely — data is never stored on our servers
                    </div>
                  </div>
                </div>
                <div style={styles.timelineStep}>
                  <div style={styles.timelineDot}>3</div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineStepTitle}>Get Insights</div>
                    <div style={styles.timelineStepDesc}>
                      Receive instant analytics and visual reports
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerContent}>
            <p style={styles.footerText}>
              © {new Date().getFullYear()} ChatPulse Analytics • Enterprise Edition v2.1
            </p>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
              <a href="#" style={styles.footerLink}>Terms of Service</a>
              <a href="#" style={styles.footerLink}>API Documentation</a>
              <a href="#" style={styles.footerLink}>Support</a>
            </div>
          </div>
          <p style={{...styles.footerText, marginTop: "16px", fontSize: "12px"}}>
            Your data is processed securely using enterprise-grade encryption and is never stored on our servers.
            All analysis occurs in-memory and is discarded after your session.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;