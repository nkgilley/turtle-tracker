#!/usr/bin/env bash
# ==============================================================================
# TurtleTrack - Automated Unraid Deployment Script
# Deploys TurtleTrack to your Unraid home server via SSH & Docker
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load optional local deployment config if present (.gitignore protected)
if [ -f "${SCRIPT_DIR}/.env.deploy" ]; then
  # shellcheck source=/dev/null
  source "${SCRIPT_DIR}/.env.deploy"
fi

# Configuration (defaults can be overridden via environment variables or .env.deploy)
UNRAID_HOST="${UNRAID_HOST:-root@tower.local}"
UNRAID_IP=$(echo "${UNRAID_HOST}" | cut -d'@' -f2)
APP_NAME="${APP_NAME:-turtletrack}"
PORT="${PORT:-8550}"
DOCKER_IMAGE="${DOCKER_IMAGE:-nkgilley/turtletrack:latest}"
REMOTE_APPDATA="/mnt/user/appdata/${APP_NAME}"
REMOTE_TEMPLATE="/boot/config/plugins/dockerMan/templates-user/my-${APP_NAME}.xml"

# ANSI Color codes for clean output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "=================================================================="
echo "   🐢 TurtleTrack - Unraid Automated Deployment"
echo "=================================================================="
echo -e "${NC}"
echo -e "${BLUE}Target Server:${NC} ${UNRAID_HOST}"
echo -e "${BLUE}Target Port:${NC}   ${PORT}"
echo -e "${BLUE}Remote Path:${NC}   ${REMOTE_APPDATA}"
echo ""

# 1. Test SSH Connection
echo -e "${BLUE}[1/5] Verifying SSH connectivity to Unraid...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "${UNRAID_HOST}" "uname -a" > /dev/null 2>&1; then
  echo -e "${RED}Error: Cannot connect to ${UNRAID_HOST} via SSH.${NC}"
  echo "Please verify that SSH is enabled on your Unraid server and your SSH key is authorized."
  exit 1
fi
echo -e "${GREEN}✓ Connected successfully to Unraid.${NC}"

# 2. Sync project files to Unraid appdata
echo -e "${BLUE}[2/5] Syncing project files to ${REMOTE_APPDATA}...${NC}"
ssh "${UNRAID_HOST}" "mkdir -p ${REMOTE_APPDATA}"

rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.gemini' \
  --exclude '.tempmediaStorage' \
  --exclude 'dist' \
  --exclude '.DS_Store' \
  "${SCRIPT_DIR}/" "${UNRAID_HOST}:${REMOTE_APPDATA}/"

echo -e "${GREEN}✓ Files synced to Unraid.${NC}"

# 3. Install Unraid Docker GUI Template
echo -e "${BLUE}[3/5] Installing Unraid Docker GUI template...${NC}"
if [ -f "${SCRIPT_DIR}/unraid-template.xml" ]; then
  # Inject selected port if overridden
  sed "s/8550/${PORT}/g" "${SCRIPT_DIR}/unraid-template.xml" | \
    ssh "${UNRAID_HOST}" "cat > ${REMOTE_TEMPLATE}"
  echo -e "${GREEN}✓ Unraid template installed to ${REMOTE_TEMPLATE}.${NC}"
fi

# 4. Pull or Build Docker Image on Unraid
if [ "${LOCAL_BUILD:-false}" = "true" ]; then
  echo -e "${BLUE}[4/5] Building Docker image locally on Unraid (${APP_NAME}:latest)...${NC}"
  ssh "${UNRAID_HOST}" "cd ${REMOTE_APPDATA} && docker build -t ${APP_NAME}:latest ."
  TARGET_IMAGE="${APP_NAME}:latest"
else
  echo -e "${BLUE}[4/5] Pulling Docker image from Docker Hub (${DOCKER_IMAGE})...${NC}"
  ssh "${UNRAID_HOST}" "docker pull ${DOCKER_IMAGE}"
  TARGET_IMAGE="${DOCKER_IMAGE}"
fi
echo -e "${GREEN}✓ Docker image ready.${NC}"

# 5. Stop existing container and start new one
echo -e "${BLUE}[5/5] Launching container on port ${PORT}...${NC}"
ssh "${UNRAID_HOST}" "
  docker stop ${APP_NAME} 2>/dev/null || true
  docker rm ${APP_NAME} 2>/dev/null || true
  docker run -d \
    --name ${APP_NAME} \
    --restart unless-stopped \
    -p ${PORT}:80 \
    \${TARGET_IMAGE:-\"${TARGET_IMAGE}\"}
"

# Verification
echo -e "${BLUE}Verifying deployment health...${NC}"
sleep 2
HTTP_STATUS=$(ssh "${UNRAID_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PORT}/" || echo "000")

if [ "${HTTP_STATUS}" = "200" ]; then
  echo -e "${GREEN}✓ Container is healthy and responding (HTTP 200).${NC}"
else
  echo -e "${YELLOW}Warning: Container started but received HTTP ${HTTP_STATUS}. Check logs with: ssh ${UNRAID_HOST} 'docker logs ${APP_NAME}'${NC}"
fi

echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}   🎉 TurtleTrack Successfully Deployed to Unraid!${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo ""
echo -e "Access your portfolio anytime from any device at:"
echo -e "👉 ${CYAN}http://${UNRAID_IP}:${PORT}${NC}"
echo ""
echo -e "You can also view and control it directly from the Unraid ${BLUE}Docker${NC} WebGUI tab."
echo ""
