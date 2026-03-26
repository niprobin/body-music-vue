import {
  Play,
  Pause,
  Home,
  Calendar,
  Music,
  Star,
  Volume2,
  VolumeX,
  MoreHorizontal,
  ArrowRight
} from 'lucide-vue-next'

// Centralized icon mapping from Font Awesome names to Lucide components
export const iconMap = {
  // Player icons
  play: Play,
  pause: Pause,

  // Navigation icons
  house: Home,
  home: Home, // alias
  calendar: Calendar,
  music: Music,

  // UI icons
  star: Star,
  ellipsis: MoreHorizontal,
  'more-horizontal': MoreHorizontal, // alias
  'arrow-right': ArrowRight,

  // Volume icons (currently hidden but preserved)
  'volume-high': Volume2,
  'volume-2': Volume2, // alias
  'volume-xmark': VolumeX,
  'volume-x': VolumeX // alias
}

// Icon size mapping (similar to Font Awesome sizes)
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
    iconMap,
    iconSizes,
    getIcon,
    getIconSize
  }
}