import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatBubble from "./ChatBubble";
import chatImage from "../assets/ChatGPT Image Oct 24, 2026, 03_13_51 PM.png"
const meta = {
  title: "Components/ChatBubble",
  component: ChatBubble,
  tags: ["autodocs"],
  args: {
    message: "Hi! How can I help you today?",
    sender: "Alex",
    variant: "received",
    timestamp: "10:30 AM",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["sent", "received"],
    },
  },
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LightMode: Story = {
  globals: { theme: 'light' },
};

export const DarkMode: Story = {
  globals: { theme: 'dark' },
};

export const Sent: Story = {
  args: {
    message: "I would like to know if this photo is AI-Generated?",
    sender: "You",
    variant: "sent",
    timestamp: "10:31 AM",
  },
};

export const LongMessage: Story = {
  args: {
    message:
      "This is a longer message to help you check text wrapping and spacing. Try viewing this story on a narrow screen and increasing the text size to see how your chat bubble handles multiple lines of content.",
  },
};

export const WithoutTimestamp: Story = {
  args: {
    timestamp: undefined,
  },
};

export const SentWithPhoto: Story = {
  args: {
    sender: "You",
    variant: "sent",
    message: "Can you check and see if the photo is AI Generated?",
    // @ts-expect-error Intentially missing alt for accessibility demo
    image: {
      src: chatImage,
    },
  },
  parameters: {
    a11y: {test: 'todo'}
  }
};
