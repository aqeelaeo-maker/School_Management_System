import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  User,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { UserProfile, School, UserRole } from '../types';
import { getUserProfile, createUserProfile } from '../services/userService';
import { getAllSchools, getSchoolById } from '../services/schoolService';
import { seedInitialDatabase } from '../services/seedService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  currentSchool: School | null;
  availableSchools: School[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAsRole: (role: UserRole, targetSchoolId?: string) => Promise<void>;
  switchSchool: (schoolId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  seedData: () => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load available schools on startup
  const loadSchools = async () => {
    const list = await getAllSchools();
    setAvailableSchools(list);
    return list;
  };

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authErr) {
            console.warn('Anonymous sign-in error or bypassed:', authErr);
          }
        }

        let schools = await loadSchools();
        // If database is completely empty on first launch, auto-seed with initial schools
        if (schools.length === 0) {
          console.log('No schools found. Auto-seeding initial multi-school data...');
          await seedInitialDatabase();
          schools = await loadSchools();
        }

        // Check if there is an active saved profile in session
        const savedUid = localStorage.getItem('sms_current_uid');
        if (savedUid) {
          const profile = await getUserProfile(savedUid);
          if (profile && isMounted) {
            setUserProfile(profile);
            if (profile.schoolId) {
              const sch = await getSchoolById(profile.schoolId);
              if (sch && isMounted) setCurrentSchool(sch);
            }
          }
        } else if (schools.length > 0 && isMounted) {
          // Default to Super Admin for seamless initial exploration
          const superAdminProfile = await getUserProfile('user_super_admin');
          if (superAdminProfile) {
            setUserProfile(superAdminProfile);
            setCurrentSchool(schools[0]);
            localStorage.setItem('sms_current_uid', 'user_super_admin');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile && isMounted) {
          setUserProfile(profile);
          if (profile.schoolId) {
            const sch = await getSchoolById(profile.schoolId);
            if (sch && isMounted) setCurrentSchool(sch);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await getUserProfile(cred.user.uid);
      if (!profile) {
        throw new Error('User profile not found in database.');
      }
      if (profile.status === 'inactive' || profile.status === 'suspended') {
        throw new Error('This account has been deactivated. Please contact your Super Administrator.');
      }
      setUserProfile(profile);
      localStorage.setItem('sms_current_uid', profile.uid);
      if (profile.schoolId) {
        const sch = await getSchoolById(profile.schoolId);
        setCurrentSchool(sch);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    localStorage.removeItem('sms_current_uid');
    setUserProfile(null);
    setCurrentSchool(null);
  };

  // Quick switch role simulator for live testing of all 6 portals
  const quickLoginAsRole = async (role: UserRole, targetSchoolId?: string) => {
    setLoading(true);
    try {
      let uid = 'user_super_admin';
      const targetSchool = targetSchoolId || availableSchools[0]?.id || 'sch_beacon_01';

      if (role === 'super_admin') {
        uid = 'user_super_admin';
      } else if (role === 'school_admin') {
        uid = 'user_beacon_admin';
      } else if (role === 'principal') {
        uid = 'user_beacon_principal';
      } else if (role === 'teacher') {
        uid = 'user_beacon_teacher_1';
      } else if (role === 'student') {
        uid = 'user_beacon_student_1';
      } else if (role === 'parent') {
        uid = 'user_beacon_parent_1';
      }

      let profile = await getUserProfile(uid);
      if (!profile) {
        // Fallback profile creation
        profile = {
          uid,
          name: `${role.replace('_', ' ').toUpperCase()} User`,
          email: `${role}@edusphere.org`,
          role,
          schoolId: role === 'super_admin' ? undefined : targetSchool,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await createUserProfile(profile);
      }

      setUserProfile(profile);
      localStorage.setItem('sms_current_uid', profile.uid);

      if (profile.schoolId) {
        const sch = await getSchoolById(profile.schoolId);
        setCurrentSchool(sch);
      } else if (availableSchools.length > 0) {
        setCurrentSchool(availableSchools[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchSchool = async (schoolId: string) => {
    const sch = await getSchoolById(schoolId);
    if (sch) {
      setCurrentSchool(sch);
      if (userProfile && userProfile.role === 'super_admin') {
        // Update temporary context for Super Admin
        setUserProfile((prev) => (prev ? { ...prev, schoolId } : null));
      }
    }
  };

  const refreshProfile = async () => {
    if (userProfile?.uid) {
      const refreshed = await getUserProfile(userProfile.uid);
      if (refreshed) {
        setUserProfile(refreshed);
        if (refreshed.schoolId) {
          const sch = await getSchoolById(refreshed.schoolId);
          if (sch) setCurrentSchool(sch);
        }
      }
    }
    await loadSchools();
  };

  const seedData = async () => {
    setLoading(true);
    try {
      const result = await seedInitialDatabase();
      await loadSchools();
      if (userProfile?.uid) {
        const p = await getUserProfile(userProfile.uid);
        if (p) setUserProfile(p);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        currentSchool,
        availableSchools,
        loading,
        login,
        logout,
        quickLoginAsRole,
        switchSchool,
        refreshProfile,
        seedData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
