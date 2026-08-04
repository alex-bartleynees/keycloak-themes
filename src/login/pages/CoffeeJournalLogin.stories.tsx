import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login.ftl" });

const meta = {
    title: "coffee-journal/login.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory kcContext={{ themeName: "coffee-journal" }} />
};

export const WithLoginError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                themeName: "coffee-journal",
                login: { username: "alex" },
                message: {
                    type: "error",
                    summary: "Invalid username or password."
                }
            }}
        />
    )
};
