import path from "path";
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

type LogLevel = "error" | "warning" | "info" | "debug" | "off";

interface ConfigLog {
  console_level: LogLevel;
  file_level: LogLevel;
  file_maxsize: string;
  file_retention: string;
  file_path: string;
}

export interface GraphStyle {
  [label: string]: {
    color: string;
    label_field: string;
  };
}

export interface Config {
  port: number;
  error_with_stack: boolean;
  logs: ConfigLog;
  graphql_cache_max_age: number;
  data_file_path: string;
}

export const config: Config = {
  port: process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 4000,
  error_with_stack: process.env.ERROR_WITH_STACK ? true : false,
  graphql_cache_max_age: 86400,
  logs: {
    console_level: (process.env.LOG_CONSOLE_LEVEL || "info") as LogLevel,
    file_level: (process.env.LOG_FILE_LEVEL || "error") as LogLevel,
    file_maxsize: "200m",
    file_retention: "7d",
    file_path: "./",
  },
  data_file_path: process.env.DATA_FILE_PATH || path.resolve(__dirname, "../../../data/bbu_export.json"),
};
