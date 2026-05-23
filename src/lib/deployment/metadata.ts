import { log } from '@/lib/logging/logger';

export interface DeploymentMetadata {
  deploymentVersion: string;
  deploymentSha: string;
  deploymentEnvironment: 'staging' | 'production';
  railwayServiceId: string | null;
  deploymentTimestamp: string;
  previousDeploymentVersion: string | null;
}

export function getDeploymentMetadata(): DeploymentMetadata {
  const version = process.env.DEPLOYMENT_VERSION ?? 'unknown';
  const sha = process.env.GIT_SHA ?? 'unknown';
  const rawEnv = process.env.DEPLOY_ENV ?? process.env.NODE_ENV;
  const environment: 'staging' | 'production' =
    rawEnv === 'staging' ? 'staging' : 'production';

  if (version === 'unknown' || sha === 'unknown') {
    log.warn({ version, sha }, 'Deployment metadata fields missing — set DEPLOYMENT_VERSION and GIT_SHA');
  }

  return {
    deploymentVersion: version,
    deploymentSha: sha,
    deploymentEnvironment: environment,
    railwayServiceId: process.env.RAILWAY_SERVICE_ID ?? null,
    deploymentTimestamp: process.env.DEPLOYMENT_TIMESTAMP ?? new Date().toISOString(),
    previousDeploymentVersion: process.env.PREVIOUS_DEPLOYMENT_VERSION ?? null,
  };
}
