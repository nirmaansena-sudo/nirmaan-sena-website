import EnquiriesList from '@/components/admin/EnquiriesList';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Enquiries' };

export default async function EnquiriesPage() {
  const enquiries = await (await getStore()).listEnquiries();
  return <EnquiriesList initial={enquiries} />;
}
