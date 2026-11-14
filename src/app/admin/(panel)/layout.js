import AdminBar from '@/components/admin/AdminBar';
import { requireAdminPage } from '@/lib/session';
import { getStore, storeKind } from '@/lib/store';
import { cloudinaryConfig } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }) {
  const session = await requireAdminPage();
  let newCount = 0;
  try {
    const enquiries = await (await getStore()).listEnquiries();
    newCount = enquiries.filter((e) => e.status === 'new').length;
  } catch {}

  const warnings = [];
  if (storeKind() === 'file') {
    warnings.push(
      'Data is saved in a local file (.data/store.json). This is fine for testing on your computer. For the live site, add MONGODB_URI so projects and enquiries are stored in MongoDB.'
    );
  }
  if (!cloudinaryConfig()) {
    warnings.push(
      'Uploads are saved on this computer. For the live site, add the CLOUDINARY_* settings so photos and videos are stored and delivered by Cloudinary.'
    );
  }

  return (
    <>
      <AdminBar email={session.e} newEnquiries={newCount} />
      <main className="adm-wrap adm-main">
        {warnings.map((w) => (
          <p className="notice" key={w}>
            {w}
          </p>
        ))}
        {children}
      </main>
    </>
  );
}
