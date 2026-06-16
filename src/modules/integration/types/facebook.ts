/**
 * Shared types for the Meta / Facebook JavaScript SDK.
 * Used wherever window.FB is accessed.
 */

export interface FBLoginResponse {
  authResponse?: {
    code?: string;
    accessToken?: string;
    grantedScopes?: string;
    userID?: string;
    expiresIn?: number;
    signedRequest?: string;
    graphDomain?: string;
    data_access_expiration_time?: number;
  };
  status?: 'connected' | 'not_authorized' | 'unknown';
}

export interface FBLoginOptions {
  config_id?: string;
  response_type?: string;
  override_default_response_type?: boolean;
  scope?: string;
  extras?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FBInitOptions {
  appId?: string;
  cookie?: boolean;
  xfbml?: boolean;
  version?: string;
  autoLogAppEvents?: boolean;
  [key: string]: unknown;
}

export interface FacebookSDK {
  init: (options: FBInitOptions) => void;
  login: (
    callback: (response: FBLoginResponse) => void,
    options?: FBLoginOptions
  ) => void;
  logout: (callback: (response: FBLoginResponse) => void) => void;
  getLoginStatus: (callback: (response: FBLoginResponse) => void) => void;
  api: (
    path: string,
    method: string,
    params: Record<string, unknown>,
    callback: (response: Record<string, unknown>) => void
  ) => void;
}
