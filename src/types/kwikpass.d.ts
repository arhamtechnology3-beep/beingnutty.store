export type KpOtpResponse = {
  status: number;
  message?: string;
  body?: { data?: Record<string, unknown> };
};

export type KpVerifyResponse = {
  status: number;
  message?: string;
  body?: {
    data?: {
      email?: string | null;
      token?: string;
      coreToken?: string;
      kpToken?: string;
    };
  };
};

export type KpLoginSdk = {
  logEvents?: (event: unknown) => void;
  kpSendOTP?: (phone: string) => Promise<KpOtpResponse> | KpOtpResponse;
  kpVerifyOTP?: (payload: { phone: string; otp: string | number }) => Promise<KpVerifyResponse> | KpVerifyResponse;
  handleKPLogout?: () => void;
  handleKpSSOButton?: () => void;
  kwikForm?: () => void;
};

declare global {
  interface Window {
    merchantInfo?: Record<string, unknown>;
    kpqueue?: unknown[];
    __KP_LOGIN_SDK_INSTANCE__?: KpLoginSdk;
  }
}

export {};
