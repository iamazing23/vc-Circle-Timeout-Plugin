/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { sendMessage } from "@utils/discord";
import {
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalRoot,
    ModalSize,
    openModal,
} from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { Menu, SelectedChannelStore, UserStore, useState } from "@webpack/common";
import type { User } from "discord-types/general";

const settings = definePluginSettings({
    useBanInsteadOfMute: {
        description: "Use `c!ban` instead of `c!mute`. Applies to R1, R2, and R3.",
        type: OptionType.BOOLEAN,
        default: false,
        restartNeeded: false,
    },
    timeSettings: {
        description: "Mute time for R4",
        type: OptionType.STRING,
        default: "20m",
        restartNeeded: false,
    },
    cleanSettings: {
        description: "Sends `c!clean` after a mute",
        type: OptionType.BOOLEAN,
        default: false,
        restartNeeded: false,
    },
    cleanTime: {
        description: "Time in seconds after the mute to send `c!clean`",
        type: OptionType.NUMBER,
        default: 3,
        restartNeeded: false,
    },
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => console.error("Failed to copy to clipboard:", err));
}

function CustomChatBoxModal({
    modalProps,
    modalKey,
    defaultMessage,
    onSubmit,
}: {
    modalProps: any;
    modalKey: string;
    defaultMessage: string;
    onSubmit: (message: string) => void;
}) {
    const [message, setMessage] = useState(defaultMessage);

    return (
        <ErrorBoundary>
            <ModalRoot {...modalProps} size={ModalSize.SMALL}>
                <ModalHeader>
                    <h4 className="modal-header">Timeout Duration</h4>
                    <div className="close-button-container">
                        <ModalCloseButton onClick={modalProps.onClose} />
                    </div>
                </ModalHeader>

                <ModalContent>
                    <div className="input-container">
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="custom-time single-line"
                            placeholder="Enter timeout duration"
                        />
                    </div>
                </ModalContent>
                <ModalFooter>
                    <button
                        className="send-command"
                        onClick={() => {
                            onSubmit(message);
                            modalProps.onClose();
                        }}
                    >
                        Submit
                    </button>
                </ModalFooter>
            </ModalRoot>
        </ErrorBoundary>
    );
}

function openCustomChatBoxModal(defaultMessage: string, onSubmit: (message: string) => void) {
    const modalKey = "custom-chat-box-modal-" + Date.now();
    openModal(
        props => (
            <CustomChatBoxModal
                modalProps={props}
                modalKey={modalKey}
                defaultMessage={defaultMessage}
                onSubmit={onSubmit}
            />
        ),
        { modalKey }
    );
}

const UserContext: NavContextMenuPatchCallback = (children, { user }: { user: User; }) => {
    if (!user || user.id === UserStore.getCurrentUser().id) return;
    try {
        const useBan = settings.store.useBanInsteadOfMute || false;
        const defaultTime = settings.store.timeSettings || "20m";

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
                            copyToClipboard(user.id);
                        }}
                    />
                    <Menu.MenuItem
                        id="r2exploiting"
                        label="R2 (Exploiting)"
                        action={() => {
                            const command = getCommand("R2", useBan ? null : "4w");
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                            copyToClipboard(user.id);
                        }}
                    />
                    <Menu.MenuItem
                        id="r3advertising"
                        label="R3 (Advertising)"
                        action={() => {
                            const command = getCommand("R3", useBan ? null : "4w");
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                            copyToClipboard(user.id);
                        }}
                    />
                    <Menu.MenuItem
                        id="r4NSFW"
                        label="R4 (MSFW)"
                        action={() => {
                            const command = getCommand("R3", useBan ? null : "4w");
                            sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                            copyToClipboard(user.id);
                        }}
                    />
                    <Menu.MenuItem
                        id="r5channelmisuse"
                        label="R5 (Channel Misuse)"
                        action={() => {
                            openCustomChatBoxModal(defaultTime, customTime => {
                                const command = `c!mute ${user.id} ${customTime} R5`;
                                sendMessage(SelectedChannelStore.getChannelId(), { content: command });
                                copyToClipboard(user.id);
                            });
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
        "user-context": UserContext,
    },
    settings,
});
