/// <reference types="expo/types" />

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

declare module '@env' {
  export const API_BASE_URL: string;
  export const WS_URL: string;
  export const NODE_ENV: string;
  export const APP_NAME: string;
  export const APP_VERSION: string;
}
