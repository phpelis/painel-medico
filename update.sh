# Antigravity Skill Kit — Unified Setup & Update
# ============================================================
# Run this from your PROJECT ROOT to install or update the kit.
#
# Unified Command (One-liner):
#   curl -sSL https://raw.githubusercontent.com/phpelis/antigravity_cloud_code_skill_kit/main/update.sh | bash
#
# Behavior:
#   - First time: Installs skills, rules, and configuration.
#   - Update: Replaces existing skills (smart sync), removes orphaned 
#     legacy folders, and handles renames (e.g., 01-core -> core-).
#
# Usage:
#   ./update.sh              → Update/Install from GitHub (main)
#   ./update.sh --branch dev → Update from a specific branch
#   ./update.sh --local path → Install/Update from local folder
# ============================================================

set -e

REPO_URL="https://github.com/phpelis/antigravity_cloud_code_skill_kit.git"
BRANCH="main"
LOCAL_KIT=""
# Initialize directories
# Use local ./tmp if /tmp is not available (Windows compatibility)
if [ -d "/tmp" ] && [ -w "/tmp" ]; then
  TMP_DIR="/tmp/antigravity_sk_update_$$"
else
  TMP_DIR="./tmp/antigravity_sk_update_$$"
  mkdir -p "./tmp"
fi

REVISED_SKILLS_LIST=".tasks/REVISAO_SKILLS.md" # Reference for future automation

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)  BRANCH="$2"; shift 2 ;;
    --local)   LOCAL_KIT="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: ./update.sh [options]"
      echo ""
      echo "Options:"
      echo "  --branch <name>  Pull from a specific branch (default: main)"
      echo "  --local <path>   Use a local kit folder instead of GitHub"
      echo "  --help           Show this help"
      exit 0
      ;;
    *) echo -e "${RED}Unknown option: $1${NC}"; exit 1 ;;
  esac
done

echo -e "${BLUE}  Antigravity Skill Kit — Unified Setup & Update${NC}"
echo "================================================="
echo ""

# ── Step 0: Migration & Pre-checks ────────────────────────────

# Migrate .agents to .agent if needed
if [ -d ".agents" ] && [ ! -d ".agent" ]; then
  echo -e "${YELLOW}Migrating: .agents → .agent (singular)${NC}"
  mv ".agents" ".agent"
  echo -e "${GREEN}✓ Migrated successfully${NC}"
fi

# ── Step 1: Get the source ──────────────────────────────────

if [ -n "$LOCAL_KIT" ]; then
  if [ ! -d "$LOCAL_KIT/skills" ]; then
    echo -e "${RED}Error: '$LOCAL_KIT' does not look like a skill kit folder (no skills/ dir).${NC}"
    exit 1
  fi
  SOURCE_DIR="$LOCAL_KIT"
  echo -e "${YELLOW}Source: local folder → $LOCAL_KIT${NC}"
else
  echo -e "${YELLOW}Fetching from GitHub (branch: $BRANCH)...${NC}"
  if ! command -v git &>/dev/null; then
    echo -e "${RED}Error: git is not installed.${NC}"
    exit 1
  fi

  rm -rf "$TMP_DIR"
  git clone --depth=1 --branch "$BRANCH" "$REPO_URL" "$TMP_DIR" 2>&1 | grep -v "^Cloning\|^remote\|^Receiving\|^Resolving\|^Unpacking" || true

  if [ ! -d "$TMP_DIR/skills" ]; then
    echo -e "${RED}Error: Failed to clone repository or skills/ folder not found.${NC}"
    rm -rf "$TMP_DIR"
    exit 1
  fi

  SOURCE_DIR="$TMP_DIR"
  echo -e "${GREEN}✓ Repository fetched${NC}"
fi

echo ""

# ── Step 2: Clean + Reinstall Skills ────────────────────────

# Known old patterns to remove for clean migration
OLD_PATTERNS=(
  "[0-9][0-9]-*"    # Legacy numbered format (e.g., 01-core-master)
  "core-master"      # Legacy short name
  "core-planner"     # Legacy short name
  "core-project"     # Legacy short name
  "arch-*"           # Legacy prefix shorthand
  "imp-*"            # Legacy prefix shorthand
)

reinstall_skills_dir() {
  local target="$1"
  local label="$2"
  local force_create="${3:-false}"

  if [ ! -d "$target" ]; then
    if [ "$force_create" = "true" ]; then
      echo -e "${BLUE}Initializing new directory: $target${NC}"
      mkdir -p "$target"
    else
      SKIPPED+=("$label ($target — not found, skipping)")
      return
    fi
  fi

  echo -e "${YELLOW}Syncing: $label → $target${NC}"

  # Get list of NEW skills (from source)
  NEW_SKILLS=()
  for skill_dir in "$SOURCE_DIR/skills"/*/; do
    NEW_SKILLS+=("$(basename "$skill_dir")")
  done

  # 1. CLEAN REINSTALL (Remove everything EXCEPT persistent data)
  echo -e "  ${YELLOW}Cleaning: $target...${NC}"
  # Remove skills and rules completely for a fresh start, 
  # but allow the user to have a 'mcp' data folder which we preserve.
  if [ -d "$target" ]; then
    # Delete all items except 'mcp'
    find "$target" -mindepth 1 -maxdepth 1 ! -name "mcp" -exec rm -rf {} + 2>/dev/null || true
  fi
  mkdir -p "$target"

  # 2. REMOVE ORPHANED SKILLS (Items in target but NOT in source)
  local removed_count=0
  for local_skill_dir in "$target"/*/; do
    skill_name=$(basename "$local_skill_dir")
    
    # Check if this skill exists in the source kit
    local found=false
    for new_skill in "${NEW_SKILLS[@]}"; do
      if [ "$skill_name" = "$new_skill" ]; then
        found=true
        break
      fi
    done

    if [ "$found" = false ]; then
      rm -rf "$local_skill_dir"
      removed_count=$((removed_count + 1))
      echo -e "  ${RED}-${NC} Removed orphaned/renamed skill: $skill_name"
    fi
  done

  # 3. INSTALL/UPDATE LIVE SKILLS
  local installed_count=0
  for skill_dir in "$SOURCE_DIR/skills"/*/; do
    skill_name=$(basename "$skill_dir")
    if [ ! -f "$skill_dir/SKILL.md" ]; then continue; fi
    
    # Clean overwrite
    rm -rf "$target/$skill_name"
    cp -r "$skill_dir" "$target/$skill_name"
    installed_count=$((installed_count + 1))
  done

  UPDATED+=("$label → $installed_count updated, $removed_count removed (synchronized)")
}

# In project root, we FORCE create if they don't exist (Unified Command)
reinstall_skills_dir ".agent/skills" "Antigravity workspace" "true"
reinstall_skills_dir ".claude/skills" "Claude Code workspace" "true"

# Global installs remain OPTIONAL (only update if already there)
reinstall_skills_dir "$HOME/.gemini/antigravity/skills" "Antigravity global" "false"
reinstall_skills_dir "$HOME/.claude/skills"             "Claude Code global" "false"
reinstall_skills_dir "$HOME/.cursor/skills"             "Cursor global"      "false"

# ── Step 4: Update rules files ──────────────────────────────
# Always create/update if skills are installed (handles legacy projects too)

HAS_SKILLS=false
[ -d ".agent/skills" ] && HAS_SKILLS=true
[ -d ".claude/skills" ]  && HAS_SKILLS=true

if [ "$HAS_SKILLS" = true ]; then
  # Root rules files
  cp "$SOURCE_DIR/CLAUDE.md" "./CLAUDE.md"
  UPDATED+=("CLAUDE.md (project root)")

  cp "$SOURCE_DIR/GEMINI.md" "./GEMINI.md"
  UPDATED+=("GEMINI.md (project root)")

  # Antigravity rule: .agent/rules/
  rm -rf ".agent/rules"
  mkdir -p ".agent/rules"
  cp "$SOURCE_DIR/GEMINI.md" ".agent/rules/antigravity-skill-kit.md"
  UPDATED+=("Antigravity rule → .agent/rules/antigravity-skill-kit.md")

  # Claude Code rule: .claude/rules/
  rm -rf ".claude/rules"
  mkdir -p ".claude/rules"
  cp "$SOURCE_DIR/CLAUDE.md" ".claude/rules/antigravity-skill-kit.md"
  UPDATED+=("Claude Code rule → .claude/rules/antigravity-skill-kit.md")

  # Self-update: replace update.sh with latest version
  cp "$SOURCE_DIR/update.sh" "./update.sh"
  chmod +x "./update.sh"
  UPDATED+=("update.sh (self-updated)")
fi

# ── Step 5: Update slash commands (if installed) ─────────────

COMMANDS_DIR="$HOME/.claude/commands"
if [ -d "$COMMANDS_DIR" ]; then
  # Remove old ctx-* commands if present from previous installs
  rm -f "$COMMANDS_DIR/ctx-doctor.md" "$COMMANDS_DIR/ctx-stats.md" "$COMMANDS_DIR/ctx-upgrade.md"
  cat > "$COMMANDS_DIR/update-kit.md" << 'EOF'
Update the installed Antigravity Skill Kit files and reconcile KIT-ALIGNMENT.md following the @tooling-update-kit skill instructions.
EOF
  UPDATED+=("Claude Code slash command (/update-kit)")
fi

# ── Step 6: Cleanup ─────────────────────────────────────────

if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
  rm -rf "$TMP_DIR"
fi

# ── Step 7: Report ──────────────────────────────────────────

echo "================================================"
echo -e "${GREEN}Update complete!${NC}"
echo ""

if [ ${#UPDATED[@]} -gt 0 ]; then
  echo -e "${GREEN}Updated:${NC}"
  for item in "${UPDATED[@]}"; do
    echo -e "  ${GREEN}✓${NC} $item"
  done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}Skipped (not installed):${NC}"
  for item in "${SKIPPED[@]}"; do
    echo -e "  ${YELLOW}-${NC} $item"
  done
fi

echo ""
