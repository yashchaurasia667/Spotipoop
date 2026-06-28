#!/bin/bash

# --- Configuration ---
TARGET_BINARY_NAME="backend-x86_64-unknown-linux-gnu"
TAURI_BIN_DIR="../client/src-tauri/binaries/"
DIST_DIR="./dist"

# 1. Run PyInstaller
echo -e "\e[36mStarting PyInstaller build...\e[0m"
pyinstaller --clean --onefile --collect-data ytmusicapi --hidden-import bs4 --name "$TARGET_BINARY_NAME" ipc.py

# Check if build was successful
if [ $? -ne 0 ]; then
    echo -e "\e[31mPyInstaller build failed. Aborting script.\e[0m" >&2
    exit 1
fi

# 2. Delete old binaries in Tauri directory
echo -e "\e[33mCleaning up old binaries in $TAURI_BIN_DIR...\e[0m"
if ls "$TAURI_BIN_DIR"/backend* 1> /dev/null 2>&1; then
    rm -f "$TAURI_BIN_DIR"/backend*
fi

# 3. Ensure destination directory exists (if not already there)
mkdir -p "$TAURI_BIN_DIR"

# 4. Move new binary from dist to Tauri binaries folder
echo -e "\e[32mMoving new binary to Tauri directory...\e[0m"

# Find the generated binary
NEW_BINARY=$(ls "$DIST_DIR"/backend* 2>/dev/null | head -n 1)

if [ -n "$NEW_BINARY" ]; then
    mv "$NEW_BINARY" "$TAURI_BIN_DIR"
    echo -e "\e[42;37mSuccessfully moved $(basename "$NEW_BINARY") to $TAURI_BIN_DIR\e[0m"
else
    echo -e "\e[33mWarning: Could not find the generated binary in $DIST_DIR\e[0m"
fi
