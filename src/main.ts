import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import { mountApp } from './ui/app'

const appRoot = document.getElementById('app')

if (!appRoot) {
  throw new Error('Application root element "#app" was not found.')
}

if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('showcase')) {
  const { mountDesignShowcase } = await import('./dev/showcase')
  mountDesignShowcase(appRoot)
} else {
  mountApp(appRoot)
}
