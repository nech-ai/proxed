# Base: Bun
FROM oven/bun:1.2.19

ARG NODE_MAJOR=22
ENV DEBIAN_FRONTEND=noninteractive

# Workaround for Debian apt "not valid yet" errors in ephemeral builders
# Disables date/valid-until checks so apt update works even if clock skew occurs
RUN printf 'Acquire::Check-Valid-Until "false";\nAcquire::Check-Date "false";\n' > /etc/apt/apt.conf.d/99no-check-valid

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl ca-certificates openssh-client \
    postgresql-client python3 python3-venv \
    build-essential pkg-config jq \
  && rm -rf /var/lib/apt/lists/*

# Node.js (optional if tools need it)
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

# Supabase CLI: use bunx to fetch & run on demand (no global install)
# We'll warm the cache after switching to the developer user

# Non-root user (idempotent; avoids UID/GID conflicts in base image)
RUN if ! getent group developer >/dev/null; then groupadd developer; fi \
  && if ! id -u developer >/dev/null 2>&1; then useradd -m -g developer -s /bin/bash developer; fi \
  && grep -q '^developer ' /etc/sudoers || echo 'developer ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER developer
WORKDIR /home/developer

# Code is mounted/checked out by Cursor

# Warm bunx cache for Supabase CLI for the developer user
RUN bunx --yes supabase --version || true
