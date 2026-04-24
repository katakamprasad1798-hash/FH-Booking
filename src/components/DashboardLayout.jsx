import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function DashboardLayout({ children, title, headerAction }) {
  return (
    <div className="layout-root">
      <TopNavbar />
      <div className="dashboard">
        <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <h1 className="page-title">{title}</h1>
          {headerAction && <div>{headerAction}</div>}
        </header>
        <div className="content-area">
          {children}
        </div>
        </main>
      </div>
    </div>
  );
}
