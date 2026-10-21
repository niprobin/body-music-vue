import {
  Play,
  Pause,
  Home,
  Calendar,
  Music,
  Disc3,
  Star,
  MoreHorizontal,
  ArrowRight
} from 'lucide-vue-next'

// Icon names used in templates, mapped to Lucide components
export const iconMap = {
  // Player icons
  play: Play,
  pause: Pause,

  // Navigation icons
  house: Home,
  calendar: Calendar,
  music: Music,
  disc: Disc3,

  // UI icons
  star: Star,
  ellipsis: MoreHorizontal,
  'arrow-right': ArrowRight
}

// Icon size mapping, in pixels
export const iconSizes = {
  xs: 12,
  sm: 16,
  medium: 20,
  lg: 24,
  xl: 32,
  '2xl': 48
}

// Composable for icon management
export function useIcons() {
  const getIcon = (iconName) => {
    const icon = iconMap[iconName]
    if (!icon) {
      console.warn(`Icon "${iconName}" not found in iconMap`)
      return null
    }
    return icon
  }

  const getIconSize = (size) => {
    return iconSizes[size] || iconSizes.medium
  }

  return {
    getIcon,
    getIconSize
  }
}