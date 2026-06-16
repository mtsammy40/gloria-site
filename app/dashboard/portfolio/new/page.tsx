import { verifySession } from '@/lib/auth/session';
import { createArtworkAction } from '@/app/actions/portfolio';
import { ArtworkForm } from '../artwork-form';

export default async function NewArtworkPage() {
  await verifySession();
  return <ArtworkForm action={createArtworkAction} heading="Add artwork" />;
}
