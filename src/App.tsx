import { Component, lazy, Suspense, type ReactNode } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppStateProvider } from './state/AppState';
import Dashboard from './pages/Dashboard';
import Curriculum from './pages/Curriculum';
import Project from './pages/Project';
import { LabIndex, LessonPage } from './pages/Lab';
import Review from './pages/Review';
import Journal from './pages/Journal';
import { Setup, Roadmaps, Capstone, Ideas, About, NotFound } from './pages/Reference';
const Audit = lazy(() => import('./pages/Audit'));
const Settings = lazy(() => import('./pages/Settings'));

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="content narrow">
        <h1>Something broke on this page</h1>
        <p className="muted" style={{ margin: '10px 0' }}>Your progress is saved and was not affected. Error: <code>{this.state.error.message}</code></p>
        <div className="btn-row"><a className="btn primary" href="#/" onClick={() => this.setState({ error: null })}>Go to Today</a>
          <button className="btn" onClick={() => location.reload()}>Reload</button></div>
      </div>
    );
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <HashRouter>
          <Suspense fallback={<div className="content">Loading…</div>}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="curriculum" element={<Curriculum />} />
                <Route path="project/:id" element={<ErrorBoundary><Project /></ErrorBoundary>} />
                <Route path="lab" element={<LabIndex />} />
                <Route path="lesson/:id" element={<ErrorBoundary><LessonPage /></ErrorBoundary>} />
                <Route path="review" element={<Review />} />
                <Route path="journal" element={<Journal />} />
                <Route path="setup" element={<Setup />} />
                <Route path="roadmaps" element={<Roadmaps />} />
                <Route path="capstone" element={<Capstone />} />
                <Route path="ideas" element={<Ideas />} />
                <Route path="audit" element={<Audit />} />
                <Route path="settings" element={<Settings />} />
                <Route path="about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
      </AppStateProvider>
    </ErrorBoundary>
  );
}
