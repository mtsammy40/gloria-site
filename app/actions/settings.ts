'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { updateSiteSettings } from '@/lib/content/settings';
import { uploadImage, UploadError } from '@/lib/blob/upload';
import { verifySession } from '@/lib/auth/session';

export type SettingsState = { type: 'idle' } | { type: 'success' } | { type: 'error'; message: string };

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await verifySession();

  const patch: Record<string, unknown> = {
    homeTagline: formData.get('homeTagline')?.toString().trim() ?? '',
    homeArtistStatement: formData.get('homeArtistStatement')?.toString().trim() ?? '',
    aboutBio: formData.get('aboutBio')?.toString().trim() ?? '',
    aboutStatementQuote: formData.get('aboutStatementQuote')?.toString().trim() ?? '',
    contactEmail: formData.get('contactEmail')?.toString().trim() ?? '',
    instagramHandle: formData.get('instagramHandle')?.toString().trim() ?? '',
    pinterestHandle: formData.get('pinterestHandle')?.toString().trim() ?? '',
    mailingBannerHeading: formData.get('mailingBannerHeading')?.toString().trim() ?? '',
    mailingBannerSubheading: formData.get('mailingBannerSubheading')?.toString().trim() ?? '',
    heroVideoUrl: formData.get('heroVideoUrl')?.toString().trim() || null,
    shippingFeeKenyaKes: parseInt(formData.get('shippingFeeKenyaKes')?.toString() ?? '0', 10) || 0,
    shippingFeeInternationalKes:
      parseInt(formData.get('shippingFeeInternationalKes')?.toString() ?? '0', 10) || 0,
    usdExchangeRate: parseFloat(formData.get('usdExchangeRate')?.toString() ?? '130') || 130,
  };

  const heroImageFile = formData.get('heroPosterImage') as File | null;
  if (heroImageFile && heroImageFile.size > 0) {
    try {
      patch.heroPosterUrl = await uploadImage(heroImageFile, 'site');
    } catch (err) {
      return {
        type: 'error',
        message: err instanceof UploadError ? err.message : 'Hero poster upload failed.',
      };
    }
  }

  const portraitFile = formData.get('aboutPortraitImage') as File | null;
  if (portraitFile && portraitFile.size > 0) {
    try {
      patch.aboutPortraitUrl = await uploadImage(portraitFile, 'site');
    } catch (err) {
      return {
        type: 'error',
        message: err instanceof UploadError ? err.message : 'Portrait upload failed.',
      };
    }
  }

  const studioFile = formData.get('aboutStudioImage') as File | null;
  if (studioFile && studioFile.size > 0) {
    try {
      patch.aboutStudioUrl = await uploadImage(studioFile, 'site');
    } catch (err) {
      return {
        type: 'error',
        message: err instanceof UploadError ? err.message : 'Studio photo upload failed.',
      };
    }
  }

  try {
    await updateSiteSettings(db, patch);
  } catch {
    return { type: 'error', message: 'Failed to save settings.' };
  }

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/contact');
  revalidatePath('/portfolio');
  revalidatePath('/shop');

  return { type: 'success' };
}
