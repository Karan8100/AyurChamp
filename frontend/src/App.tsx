import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import AssessmentRunPage from './pages/assessment/AssessmentRunPage'
import VikritiAssessmentPage from './pages/assessment/VikritiAssessmentPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import DietPlannerPage from './pages/diet/DietPlannerPage'
import AssessmentHistoryPage from './pages/history/AssessmentHistoryPage'
import LoginPage from './pages/LoginPage'
import PrakrutiReportPage from './pages/report/PrakrutiReportPage'
import ProfilePage from './pages/profile/ProfilePage'
import RecommendationsPage from './pages/recommendations/RecommendationsPage'
import RitucharyaPage from './pages/ritucharya/RitucharyaPage'
import SignupPage from './pages/SignupPage'

const isAuthenticated = () => Boolean(localStorage.getItem('ayushya_token') || localStorage.getItem('ayusha_token'))

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}

function AuthGuard({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function RootRedirect() {
  return <Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Persistent AppShell Layout for all standard pages */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/prakruti-report" element={<PrakrutiReportPage />} />
        <Route path="/assessment-history" element={<AssessmentHistoryPage />} />
        <Route path="/diet-planner" element={<DietPlannerPage />} />
        <Route path="/ritucharya" element={<RitucharyaPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fullscreen interactive flows without sidebar */}
      <Route path="/assessment" element={<AuthGuard><AssessmentRunPage /></AuthGuard>} />
      <Route path="/assessment/run" element={<AuthGuard><AssessmentRunPage /></AuthGuard>} />
      <Route path="/vikriti-assessment" element={<AuthGuard><VikritiAssessmentPage /></AuthGuard>} />
      <Route path="/diet-plan" element={<Navigate to="/diet-planner" replace />} />

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

