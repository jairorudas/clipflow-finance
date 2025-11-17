export function requireNodeEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(
      `Env var ${name} is undefined. ` +
      `Please add ${name} to your .env.server file. ` +
      `For development, you can leave this feature disabled by not using it.`
    );
  } else {
    return value;
  }
}
