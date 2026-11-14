import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="empty-state">
      <h2>Not found</h2>
      <p>This item may have been deleted.</p>
      <Link className="ab ab-dark" href="/admin">
        Back to projects
      </Link>
    </div>
  );
}
