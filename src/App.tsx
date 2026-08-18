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
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 animate-bounce">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
          <span>Initializing EduSphere Multi-School Cloud...</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 font-mono">Loading Tenant Partitioning & Auth States</p>
      </div>
    );
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
