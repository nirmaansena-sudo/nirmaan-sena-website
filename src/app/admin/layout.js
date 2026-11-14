import './admin.css';

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="admin">{children}</div>;
}
