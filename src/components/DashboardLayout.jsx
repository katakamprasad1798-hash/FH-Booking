import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function DashboardLayout({ children, title, headerAction }) {
  return (
    <div className="layout-root">
      <div className="dashboard">
        <Sidebar />
        <main className="main-content">
          <TopNavbar title={title} headerAction={headerAction} />
          <div className="content-area">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
