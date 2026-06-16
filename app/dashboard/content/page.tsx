import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/content/settings';
import { verifySession } from '@/lib/auth/session';
import { updateSettingsAction } from '@/app/actions/settings';
import { ContentForm } from './content-form';

export default async function ContentDashboardPage() {
  await verifySession();
  const settings = await getSiteSettings(db);
  return <ContentForm settings={settings} action={updateSettingsAction} />;
}
