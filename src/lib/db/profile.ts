import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { UpdateProfileInput } from '@/lib/validation/schemas';

/**
 * Get user profile
 */
export async function getProfile(userId: string) {
  return prisma.candidate.findUnique({
    where: { id: userId },
  });
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.skills !== undefined) updateData.skills = data.skills;
  if (data.experience !== undefined) updateData.experience = data.experience;
  if (data.preferences !== undefined) updateData.preferences = data.preferences;

  return prisma.candidate.update({
    where: { id: userId },
    data: updateData,
  });
}

/**
 * Create or update profile field
 */
export async function createOrUpdateProfileField(
  userId: string,
  fieldType: string,
  content: Record<string, unknown>
) {
  return prisma.profileData.upsert({
    where: {
      candidateId_type: {
        candidateId: userId,
        type: fieldType,
      },
    },
    update: { content: content as unknown as Prisma.InputJsonValue },
    create: {
      candidateId: userId,
      type: fieldType,
      content: content as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Get profile fields
 */
export async function getProfileFields(userId: string, type?: string) {
  const where: Record<string, unknown> = { candidateId: userId };

  if (type) {
    where.type = type;
  }

  return prisma.profileData.findMany({
    where,
  });
}

/**
 * Add skill to profile
 */
import { SkillProficiency } from '@prisma/client';

const PROFICIENCY_MAP: Record<string, SkillProficiency> = {
  beginner: SkillProficiency.beginner,
  intermediate: SkillProficiency.intermediate,
  advanced: SkillProficiency.advanced,
  expert: SkillProficiency.expert,
  master: SkillProficiency.expert, // no master level; cap at expert
};

export async function addSkill(userId: string, name: string, proficiency: string = 'intermediate') {
  return prisma.skill.create({
    data: {
      candidateId: userId,
      name,
      proficiency: PROFICIENCY_MAP[proficiency] ?? SkillProficiency.intermediate,
    },
  });
}

/**
 * Get user skills
 */
export async function getSkills(userId: string) {
  return prisma.skill.findMany({
    where: { candidateId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Add achievement to profile
 */
export async function addAchievement(
  userId: string,
  title: string,
  description: string,
  metrics?: Record<string, unknown>
) {
  return prisma.achievement.create({
    data: {
      candidateId: userId,
      title,
      description,
      metrics: metrics as unknown as Prisma.InputJsonValue | undefined,
    },
  });
}

/**
 * Get user achievements
 */
export async function getAchievements(userId: string) {
  return prisma.achievement.findMany({
    where: { candidateId: userId },
    orderBy: { createdAt: 'desc' },
  });
}
