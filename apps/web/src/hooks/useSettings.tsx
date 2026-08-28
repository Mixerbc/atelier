import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fallbackSettings, normalizeSettings, toBusinessConfig } from '../config/business'
import { canUseApi, storeApi } from '../lib/api'
import { staticSettings } from '../data/staticCatalog'
import type { BusinessConfig, BusinessSettings } from '../types'

interface SettingsContextValue {
  settings: BusinessSettings
  config: BusinessConfig
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(fallbackSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const source = canUseApi() ? await storeApi.getSettings() : staticSettings
      const data = normalizeSettings(source)
      setSettings(data)
      setError(null)
    } catch {
      setSettings(normalizeSettings(staticSettings))
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo(
    () => ({
      settings,
      config: toBusinessConfig(settings),
      loading,
      error,
      refresh,
    }),
    [error, loading, settings],
  )

  return createElement(SettingsContext.Provider, { value }, children)
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    return {
      settings: fallbackSettings,
      config: toBusinessConfig(fallbackSettings),
      loading: false,
      error: null,
      refresh: async () => undefined,
    }
  }
  return ctx
}
