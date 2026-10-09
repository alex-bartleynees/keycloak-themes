import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login.ftl" });

const meta = {
    title: "mailmerge/login.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory kcContext={{ themeName: "mailmerge" }} />
};

export const WithLoginError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                themeName: "mailmerge",
                login: { username: "staff@shop.co.nz" },
                message: {
                    type: "error",
                    summary: "Invalid username or password."
                }
            }}
        />
    )
};
