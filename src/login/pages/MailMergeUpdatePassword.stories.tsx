import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-update-password.ftl" });

const meta = {
    title: "mailmerge/login-update-password.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory kcContext={{ themeName: "mailmerge" }} />
};

/** First sign-in with the temporary password an admin set. */
export const FirstLogin: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                themeName: "mailmerge",
                message: { type: "warning", summary: "You need to change your password to activate your account." }
            }}
        />
    )
};
