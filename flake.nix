{
  description = "Keycloakify themes development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22 # bundles npm; `build-keycloak-theme` shells out to `npm run build`
            yarn # yarn.lock is the source of truth for this repo
            maven # Keycloakify packages the theme JAR via Maven
            jdk # required by Maven for the JAR build
          ];

          shellHook = ''
            echo "🎨 Keycloakify themes dev environment"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "📁 Project: $PWD"
            echo "🟢 Node:  $(node --version)"
            echo "🧶 Yarn:  $(yarn --version)"
            echo "☕ Java:  $(java -version 2>&1 | head -n1)"
            echo "📦 Maven: $(mvn --version | head -n1)"
            echo ""
            echo "💡 Common commands:"
            echo "   yarn install                 # install deps"
            echo "   yarn storybook               # preview login pages offline"
            echo "   yarn build-keycloak-theme    # produce the theme JAR (dist_keycloak/)"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          '';
        };
      }
    );
}
