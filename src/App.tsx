import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { SchoolsManagement } from './pages/super-admin/SchoolsManagement';
import { GlobalUsers } from './pages/super-admin/GlobalUsers';
import { AuditLogsView } from './pages/super-admin/AuditLogsView';
import { SystemSettings } from './pages/super-admin/SystemSettings';

// School Admin & Principal Pages
import { SchoolDashboard } from './pages/school-admin/SchoolDashboard';
import { StudentsManagement } from './pages/school-admin/StudentsManagement';
import { TeachersManagement } from './pages/school-admin/TeachersManagement';
import { ParentsManagement } from './pages/school-admin/ParentsManagement';
import { AcademicManagement } from './pages/school-admin/AcademicManagement';
import { AttendanceModule } from './pages/school-admin/AttendanceModule';
import { FeesManagement } from './pages/school-admin/FeesManagement';
import { ExaminationsModule } from './pages/school-admin/ExaminationsModule';
import { TimetableModule } from './pages/school-admin/TimetableModule';
import { HomeworkModule } from './pages/school-admin/HomeworkModule';
import { OperationsModule } from './pages/school-admin/OperationsModule';
import { NoticesModule } from './pages/school-admin/NoticesModule';
import { ReportsModule } from './pages/school-admin/ReportsModule';
import { SchoolSettingsPage } from './pages/school-admin/SchoolSettingsPage';

// Portals for Students/Parents and Teachers
import { StudentParentPortal } from './pages/portal/StudentParentPortal';
import { TeacherPortal } from './pages/portal/TeacherPortal';

// Auth Page
import { LoginPage } from './pages/auth/LoginPage';

// Loading & AI components
import { RefreshCw, Sparkles, Building2, ShieldAlert } from 'lucide-react';
import { AIAssistantModal } from './components/ai/AIAssistantModal';

const AppContent: React.FC = () => {
  const { userProfile, currentSchool, loading } = useAuth();
  const role = userProfile?.role || 'super_admin';

  // Default initial active tab based on role
  const getDefaultTab = (userRole: string) => {
    switch (userRole) {
      case 'super_admin':
        return 'super_dashboard';
      case 'teacher':
        return 'teacher_dashboard';
      case 'student':
        return 'student_dashboard';
      case 'parent':
        return 'parent_dashboard';
      case 'principal':
        return 'principal_dashboard';
      case 'school_admin':
      default:
        return 'dashboard';
    }
  };

  const [activeTab, setActiveTab] = useState<string>('super_dashboard');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Sync tab when user profile role switches
  useEffect(() => {
    if (userProfile?.role) {
      setActiveTab(getDefaultTab(userProfile.role));
    }
  }, [userProfile?.role]);

  if (loading) {
    return (
      <div
        className="relative flex h-screen w-screen flex-col items-center justify-center text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 35%, #027A8F 70%, #00D2BC 100%)',
        }}
      >
        {/* Blue-to-Turquoise Ambient Lighting Mesh */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-36 -left-24 h-[36rem] w-[36rem] rounded-full bg-[#0A3997]/30 blur-[110px]" />
          <div className="absolute -bottom-32 -right-20 h-[38rem] w-[38rem] rounded-full bg-[#00D2BC]/35 blur-[110px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.12] text-[#F4F6F8] shadow-xl ring-2 ring-white/30 backdrop-blur-md animate-bounce">
            <Building2 className="h-7 w-7 text-[#F4F6F8]" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#F4F6F8]">
            <RefreshCw className="h-4 w-4 animate-spin text-[#00D2BC]" />
            <span>Initializing School Management System...</span>
          </div>
          <p className="mt-1 text-xs text-[#CBD5E1]">Loading Tenant Partitioning & Auth States</p>

          {/* Powered By Logo in Loading Screen */}
          <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-3.5 py-1.5 shadow-sm border border-white/20 backdrop-blur-xs">
            <span className="text-xs font-semibold text-[#F4F6F8] tracking-wide">
              Powered By
            </span>
            <img
              src="/assets/aistudio/NEXORA_Technologies_Logo_290384d8.png"
              alt="NEXORA Technologies"
              style={{ filter: 'brightness(0) invert(0.96) drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
              className="h-6 w-auto max-w-[160px] object-contain"
            />
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, show the dedicated login page
  if (!userProfile) {
    return <LoginPage />;
  }

  // Render the current view according to active tab and role
  const renderCurrentPage = () => {
    // Portal specific views
    if (role === 'student' || role === 'parent') {
      return <StudentParentPortal />;
    }

    if (role === 'teacher') {
      if (activeTab === 'teacher_dashboard' || activeTab === 'attendance') {
        return <TeacherPortal />;
      }
      if (activeTab === 'students') {
        return <StudentsManagement />;
      }
      if (activeTab === 'homework') {
        return <HomeworkModule />;
      }
      if (activeTab === 'examinations') {
        return <ExaminationsModule />;
      }
      if (activeTab === 'timetable') {
        return <TimetableModule />;
      }
      if (activeTab === 'notices') {
        return <NoticesModule />;
      }
      return <TeacherPortal />;
    }

    // Super Admin tabs
    if (role === 'super_admin') {
      switch (activeTab) {
        case 'super_dashboard':
          return <SuperAdminDashboard onNavigateTab={setActiveTab} />;
        case 'schools':
          return <SchoolsManagement onEnterSchool={() => setActiveTab('dashboard')} />;
        case 'global_users':
          return <GlobalUsers />;
        case 'audit_logs':
          return <AuditLogsView />;
        case 'system_settings':
          return <SystemSettings />;
        case 'dashboard':
          return <SchoolDashboard onNavigateTab={setActiveTab} onOpenAI={() => setAiModalOpen(true)} />;
        case 'students':
          return <StudentsManagement />;
        case 'teachers':
          return <TeachersManagement />;
        case 'parents':
          return <ParentsManagement />;
        case 'academics':
          return <AcademicManagement />;
        case 'attendance':
          return <AttendanceModule />;
        case 'fees':
          return <FeesManagement />;
        case 'examinations':
          return <ExaminationsModule />;
        case 'timetable':
          return <TimetableModule />;
        case 'homework':
          return <HomeworkModule />;
        case 'library':
          return <OperationsModule initialTab="library" />;
        case 'transport':
          return <OperationsModule initialTab="transport" />;
        case 'expenses':
          return <OperationsModule initialTab="expenses" />;
        case 'notices':
          return <NoticesModule />;
        case 'reports':
          return <ReportsModule />;
        case 'settings':
          return <SchoolSettingsPage />;
        default:
          return <SuperAdminDashboard onNavigateTab={setActiveTab} />;
      }
    }

    // Principal & School Admin tabs
    switch (activeTab) {
      case 'principal_dashboard':
      case 'dashboard':
        return <SchoolDashboard onNavigateTab={setActiveTab} onOpenAI={() => setAiModalOpen(true)} />;
      case 'students':
        return <StudentsManagement />;
      case 'teachers':
        return <TeachersManagement />;
      case 'parents':
        return <ParentsManagement />;
      case 'academics':
        return <AcademicManagement />;
      case 'attendance':
        return <AttendanceModule />;
      case 'fees':
        return <FeesManagement />;
      case 'examinations':
        return <ExaminationsModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'homework':
        return <HomeworkModule />;
      case 'library':
        return <OperationsModule initialTab="library" />;
      case 'transport':
        return <OperationsModule initialTab="transport" />;
      case 'expenses':
        return <OperationsModule initialTab="expenses" />;
      case 'notices':
        return <NoticesModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SchoolSettingsPage />;
      default:
        return <SchoolDashboard onNavigateTab={setActiveTab} onOpenAI={() => setAiModalOpen(true)} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderCurrentPage()}
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
