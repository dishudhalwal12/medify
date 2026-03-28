import { serverTimestamp } from "firebase/firestore";

import { createDefaultProfile, getProfileCompletion, mergeProfileWithDefaults } from "@/lib/profile";
import { HealthProfile } from "@/types";
import { getDocument, upsertDocument } from "@/services/firebase/firestore";

class ProfileService {
  async getProfile(uid: string): Promise<HealthProfile | null> {
    return getDocument<HealthProfile>("healthProfiles", uid);
  }

  async ensureProfile(uid: string, fullName: string) {
    const existing = await this.getProfile(uid);

    if (existing) {
      return mergeProfileWithDefaults(existing, { uid, fullName });
    }

    const profile = createDefaultProfile(uid, fullName);

    await upsertDocument("healthProfiles", uid, {
      ...profile,
      createdAt: serverTimestamp(),
    });

    return mergeProfileWithDefaults(profile, { uid, fullName });
  }

  async updateProfile(uid: string, profile: Partial<HealthProfile>) {
    await upsertDocument("healthProfiles", uid, {
      ...profile,
      updatedAt: serverTimestamp(),
    });

    if (profile.fullName) {
      await upsertDocument("users", uid, {
        fullName: profile.fullName,
      });
    }

    return this.getProfile(uid);
  }

  async getProfileCompletion(uid: string) {
    const profile = await this.getProfile(uid);
    return getProfileCompletion(profile);
  }
}

export const profileService = new ProfileService();
