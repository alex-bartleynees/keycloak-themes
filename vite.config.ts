import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            accountThemeImplementation: "none",
            // One JAR can hold several themes (one per app that shares this Keycloak).
            // Add more names here (e.g. "product-feedback") as you build them out.
            themeName: ["dopamine-kick", "coffee-journal"]
        })
    ]
});
