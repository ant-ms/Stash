import { mount, unmount } from "svelte"

import CodePromptPopup from "$components/Popups/Prompts/CodePromptPopup.svelte"
import IconPromptPopup from "$components/Popups/Prompts/IconPromptPopup.svelte"
import NotifyPromptPopup from "$components/Popups/Prompts/NotifyPromptPopup.svelte"
import SelectMultiplePromptPopup from "$components/Popups/Prompts/SelectMultiplePromptPopup.svelte"
import SelectPromptDropdown from "$components/Popups/Prompts/SelectPromptDropdown.svelte"
import SelectPromptPopup from "$components/Popups/Prompts/SelectPromptPopup.svelte"
import TagSearchPromptPopup from "$components/Popups/Prompts/TagSearchPromptPopup.svelte"
import TextPromptPopup from "$components/Popups/Prompts/TextPromptPopup.svelte"
import { type IconName } from "$lib/possibleIcons.svelte"

import type { TagExtended } from "./TagsController.svelte"

export const prompts = {
    text: (question: string, value = ""): Promise<string | null> =>
        new Promise(resolve => {
            const element = mount(TextPromptPopup, {
                target: document.body,
                props: {
                    question,
                    value,
                    onresult: result => {
                        if (result != null) resolve(result)
                        else resolve(null)
                        unmount(element)
                    }
                }
            })
        }),

    icon: (
        question: string,
        value = ""
    ): Promise<IconName | null> =>
        new Promise(resolve => {
            const element = mount(IconPromptPopup, {
                target: document.body,
                props: {
                    question,
                    value,
                    onresult: result => {
                        if (result != null) resolve(result as any)
                        else resolve(null)
                        unmount(element)
                    }
                }
            })
        }),

    select: (
        question: string,
        options: string[],
        value = ""
    ): Promise<string | null> =>
        new Promise(resolve => {
            const element = mount(SelectPromptPopup, {
                target: document.body,
                props: {
                    question,
                    options,
                    value: value || options[0],
                    onresult: result => {
                        if (result != null) resolve(result)
                        else resolve(null)
                        unmount(element)
                    }
                }
            })
        }),

    selectMultiple: (
        question: string,
        options: { name: string; value: string }[],
        selected: string[] = []
    ): Promise<string[] | null> =>
        new Promise(resolve => {
            const element = mount(SelectMultiplePromptPopup, {
                target: document.body,
                props: {
                    question,
                    options,
                    selected: selected || [],
                    onresult: result => {
                        if (result != null) resolve(result)
                        else resolve(null)
                        unmount(element)
                    }
                }
            })
        }),

    dropdown: (
        target: Element,
        options: string[],
        value = ""
    ): Promise<string | null> =>
        new Promise(resolve => {
            console.log(target)
            const element = mount(SelectPromptDropdown, {
                target,
                props: {
                    options,
                    value: value || options[0],

                    onresult: result => {
                        if (result != null) resolve(result)
                        else resolve(null)
                        unmount(element)
                    }
                }
            })
        }),

    tag: (question: string, value = ""): Promise<TagExtended | null> =>
        new Promise(resolve => {
            const element = mount(TagSearchPromptPopup, {
                target: document.body,
                props: {
                    question,
                    value,
                    //   TODO
                    onresult: result => {
                        if (result != null) resolve(result)
                        else resolve(null)
                        unmount(element)
                    }
                }
            })
        }),

    notify: (text: string): Promise<boolean> =>
        new Promise(resolve => {
            const element = mount(NotifyPromptPopup, {
                target: document.body,
                props: {
                    text,
                    onresult: result => {
                        resolve(result)
                        unmount(element)
                    }
                }
            })
        }),

    code: (text: string): Promise<boolean> =>
        new Promise(resolve => {
            const element = mount(CodePromptPopup, {
                target: document.body,
                props: {
                    text,
                    onresult: result => {
                        resolve(result)
                        unmount(element)
                    }
                }
            })
        })
}
