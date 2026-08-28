/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_BUSINESS_NAME?: string
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_DELIVERY_FEE?: string
  readonly VITE_MINIMUM_ORDER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
