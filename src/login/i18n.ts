/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    // Override built-in messages. `loginTitle` drives the browser tab title
    // (document.title). Default is just the realm name ("development" /
    // "production"); set it to the product name instead.
    .withCustomTranslations({
        en: {
            loginTitle: "Dopamine Kick - Login"
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
