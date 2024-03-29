import { useIsDarkMode } from 'ui/src'
import { MeldLogos } from 'wallet/src/features/fiatOnRamp/meld'

export function useMeldLogoUrl(logos: MeldLogos | undefined): string | undefined {
  const isDarkMode = useIsDarkMode()

  if (!logos) {
    return
  }

  return isDarkMode ? logos.darkLogo : logos.lightLogo
}
