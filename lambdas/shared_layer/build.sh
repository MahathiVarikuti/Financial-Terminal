#!/usr/bin/env bash
# build.sh — Builds the shared Lambda layer with Linux-compatible (manylinux2014) wheels
# Run this from the lambdas/shared_layer/ directory before `sam deploy`

set -e

echo "🧹 Cleaning previous build artifacts..."
rm -rf python/

echo "📦 Installing manylinux2014 wheels (Linux-compatible for Lambda)..."
pip install \
  --platform manylinux2014_x86_64 \
  --target ./python \
  --only-binary=:all: \
  --upgrade \
  -r requirements.txt

echo "✂️  Stripping unnecessary files to minimize layer size..."
find ./python -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find ./python -type f -name "*.pyc" -delete 2>/dev/null || true
find ./python -type f -name "*.pyo" -delete 2>/dev/null || true
find ./python -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find ./python -type d -name "test" -exec rm -rf {} + 2>/dev/null || true
find ./python -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true
find ./python -name "*.md" -delete 2>/dev/null || true
find ./python -name "LICENCE*" -delete 2>/dev/null || true
find ./python -name "LICENSE*" -delete 2>/dev/null || true

echo ""
echo "✅ Layer build complete."
echo "📏 Layer size: $(du -sh ./python | cut -f1)"
echo ""
echo "Next steps:"
echo "  cd ../ && sam build && sam deploy --guided"
