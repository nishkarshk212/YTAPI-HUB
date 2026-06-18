import { NextResponse } from "next/server";
import { ERROR_CODES } from "./constants";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiSuccess<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(body, { status });
}

export function apiError(
  errorDef: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
  details?: unknown,
) {
  const body: ApiError = {
    success: false,
    error: {
      code: errorDef.code,
      message: errorDef.message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status: errorDef.status });
}
