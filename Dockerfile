# syntax=docker/dockerfile:1
#
# Custom Keycloak image with our Keycloakify login themes baked in.
#
# The theme JAR is produced beforehand by `yarn build-keycloak-theme`
# (CI runs this, then `docker build`). We use the ...all-other-versions JAR,
# which is the correct one for Keycloak 26.x.
#
# Runtime stays plain `start` (see the portfolio-cluster StatefulSet), so the
# only change this image introduces over stock Keycloak is the theme provider.

ARG KEYCLOAK_VERSION=26.4.7

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

COPY dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar /opt/keycloak/providers/

# Augment the server with the new provider so the theme is registered.
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

COPY --from=builder /opt/keycloak/ /opt/keycloak/

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
