/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { sendMessage } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";
import { Menu, SelectedChannelStore, UserStore } from "@webpack/common";
import type { User } from "discord-types/general";

const settings = definePluginSettings({
    useBanInsteadOfMute: {
        description: "Use `c!ban` instead of `c!mute`. Applies to R1, R2, and R3.",
        type: OptionType.BOOLEAN,
        default: false,
        restartNeeded: false,
    },
    timeSettings: {
        description: "Mute time for R4 and rtc",
        type: OptionType.STRING,
        default: "20m",
        restartNeeded: false,
    },
});

const UserContext: NavContextMenuPatchCallback = (children, { user }: { user: User; }) => {
    if (!user || user.id === UserStore.getCurrentUser().id) return;
    try {
        const useBan = settings.store.useBanInsteadOfMute || false;
        const timeSettings = settings.store.timeSettings || "20m";



        const getCommand = (rule: string, duration: string | null) =>
            `${useBan ? "c!ban" : "c!mute"} ${user.id}${duration ? ` ${duration}` : ""} ${rule}`;

        children.splice(-1, 0, (
            <Menu.MenuGroup>
                <Menu.MenuItem
                    id="user-actions"
                    label="User Actions"
                    dropdown={true}
                >
                    <Menu.MenuItem
                        id="r1crosstrading"
                        label="R1 (Crosstrading)"
                        action={() => {
                            const command = getCommand("R1", useBan ? null : "4w");
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                        }}
                    />
                    <Menu.MenuItem
                        id="r2exploiting"
                        label="R2 (Exploiting)"
                        action={() => {
                            const command = getCommand("R2", useBan ? null : "4w");
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                        }}
                    />
                    <Menu.MenuItem
                        id="r3advertising"
                        label="R3 (Advertising)"
                        action={() => {
                            const command = getCommand("R3", useBan ? null : "4w");
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                        }}
                    />
                    <Menu.MenuItem
                        id="r4channelmisuse"
                        label="R4 (Channel Misuse)"
                        action={() => {
                            const command = `c!mute ${user.id} ${timeSettings} R4`;
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                        }}
                    />
                    <Menu.MenuItem
                        id="rtc"
                        label="rtc (TEMP)"
                        action={() => {
                            const command = `c!mute ${user.id} ${timeSettings} rtc`;
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                        }}
                    />
                </Menu.MenuItem>
            </Menu.MenuGroup>
        ));
    } catch (error) {
        console.error("Error:", error);
    }
};

export default definePlugin({
    name: "Circle Timeout",
    description: "Made for discord.gg/fischplaza",
    authors: [{ name: "iamazing2", id: 781235919025995787n }],
    contextMenus: {
        "user-context": UserContext
    },
    settings
});
