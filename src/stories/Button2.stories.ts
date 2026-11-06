import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button2 } from './Button2'

const meta = {
  title: 'Components/Button2',
  component: Button2,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Save changes',
    disabled: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Button2>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const LongLabel: Story = {
  args: {
    label: 'Save changes and continue',
  },
}