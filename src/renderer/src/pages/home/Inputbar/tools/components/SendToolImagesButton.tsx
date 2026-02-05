import { ActionIconButton } from '@renderer/components/Buttons'
import type { Assistant } from '@renderer/types'
import { getEffectiveMcpMode } from '@renderer/types'
import { Tooltip } from 'antd'
import { ScanEye } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  assistant: Assistant
  onToggle: () => void
}

const SendToolImagesButton: FC<Props> = ({ assistant, onToggle }) => {
  const { t } = useTranslation()

  const mcpEnabled = getEffectiveMcpMode(assistant) !== 'disabled'

  const ariaLabel = assistant.sendMcpToolImages
    ? t('chat.input.send_tool_images.enabled')
    : t('chat.input.send_tool_images.disabled')

  return (
    <Tooltip placement="top" title={ariaLabel} mouseLeaveDelay={0} arrow>
      <ActionIconButton
        onClick={onToggle}
        active={assistant.sendMcpToolImages}
        disabled={!mcpEnabled}
        aria-label={ariaLabel}
        aria-pressed={assistant.sendMcpToolImages}>
        <ScanEye size={18} />
      </ActionIconButton>
    </Tooltip>
  )
}

export default SendToolImagesButton
