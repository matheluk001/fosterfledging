#!/bin/bash
echo "🗂️  Archiving old HTML files..."
mkdir -p old_layout
mv layout/*.html old_layout/ 2>/dev/null
echo "✅ Done! Files moved to old_layout/"
ls -la old_layout/
