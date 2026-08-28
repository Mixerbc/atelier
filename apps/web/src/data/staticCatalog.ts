import catalog from './catalog-snapshot.json' with { type: 'json' }
import categories from './categories-snapshot.json' with { type: 'json' }
import settings from './settings-snapshot.json' with { type: 'json' }
import type { BusinessSettings, Category, Product } from '../types'

export const staticProducts = catalog as Product[]
export const staticCategories = categories as Category[]
export const staticSettings = settings as BusinessSettings
