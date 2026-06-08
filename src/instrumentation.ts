export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initTelemetry } = await import('@/platform/telemetry/instrumentation');
    initTelemetry();

    const { enforceStartupGates } = await import('@/lib/runtime/startup-validator');
    // Enforce all connectivity and env validation gates during application startup
    await enforceStartupGates();
  }
}
