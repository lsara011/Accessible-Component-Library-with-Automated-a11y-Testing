import './ChatBubbles.css'

export type ChatBubbleProps = {
  message: string
  sender: string
  variant?: 'sent' | 'received'
  timestamp?: string
  image?: {
    src: string
    alt: string
  }
}

const ChatBubble = ({
  message,
  sender,
  variant = 'received',
  timestamp,
  image,
}: ChatBubbleProps) => {
  return (
    <article
      className={`chat-bubble chat-bubble--${variant} font-raleway text-black dark:text-white`}
      aria-label={`Message from ${sender}`}
    >
      <header className="chat-bubble__header dark:text-white">
        <span className="chat-bubble__sender px-2">{sender}</span>
        {timestamp && <span className="chat-bubble__timestamp p-2">{timestamp}</span>}
      </header>
      <p className="chat-bubble__message p-3 bg-purple-600 text-black dark:bg-purple-900 dark:text-white border-black rounded-4xl ">{message}</p>
      {image && <img className ="chat-bubble__image rounded-4xl pt-1" src={image.src} alt='Tire with slash on the side'  />}
      {/*Intentionally left out alt to show storybook error*/}
    </article>
  )
}

export default ChatBubble
