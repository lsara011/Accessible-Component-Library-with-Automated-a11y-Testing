import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "../components/Modal";
import {expect, userEvent, within} from 'storybook/test'

function ModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        description="Update your display name."
      >
        <label>
          Display name <input name="displayName" />
        </label>
        <button type="button" onClick={() => setOpen(false)}>
          Save
        </button>
      </Modal>
    </>
  );
}

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: { a11y: { test: "error" } },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    onClose: () => {},
    title: "Edit profile",
    children: null,
  },
  render: () => <ModalExample />,

  play: async ({canvasElement}) =>{
    const canvas = within(canvasElement)

    await userEvent.click(
      canvas.getByRole('button', {name: 'Open modal'}),
    )

    await expect (canvas.getByRole('dialog', {name: 'Edit profile'})).toBeVisible()
  },
};
