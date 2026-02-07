export const LogType = {
  INFO: "INFO" as const,
  WARNING: "WARNING" as const,
  ERROR: "ERROR" as const,
};

export type LogType = typeof LogType[keyof typeof LogType];