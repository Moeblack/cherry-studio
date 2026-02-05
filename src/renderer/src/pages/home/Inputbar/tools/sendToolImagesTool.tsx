import { useAssistant } from '@renderer/hooks/useAssistant'
import SendToolImagesButton from '@renderer/pages/home/Inputbar/tools/components/SendToolImagesButton'
import { defineTool, registerTool, TopicType } from '@renderer/pages/home/Inputbar/types'
import { getEffectiveMcpMode } from '@renderer/types'
import { useCallback } from 'react'

const SendToolImagesTool = ({ context }) => {
  const { assistant } = context
  const { updateAssistant } = useAssistant(assistant.id)

  const handleToggle = useCallback(() => {
    updateAssistant({ ...assistant, sendMcpToolImages: !assistant.sendMcpToolImages })
  }, [assistant, updateAssistant])

  return <SendToolImagesButton assistant={assistant} onToggle={handleToggle} />
}

const sendToolImagesTool = defineTool({
  key: 'send_tool_images',
  label: (t) => t('chat.input.send_tool_images.label'),
  visibleInScopes: [TopicType.Chat],
  condition: ({ assistant }) => getEffectiveMcpMode(assistant) !== 'disabled',
  render: (context) => <SendToolImagesTool context={context} />
})

registerTool(sendToolImagesTool)

export default sendToolImagesTool
