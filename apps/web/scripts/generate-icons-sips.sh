#!/bin/bash

# Generate PWA icons from logo.png using macOS sips

LOGO_PATH="public/logo.png"
PUBLIC_DIR="public"

if [ ! -f "$LOGO_PATH" ]; then
    echo "❌ logo.png not found in public folder"
    exit 1
fi

echo "🎨 Generating PWA icons from logo.png using sips..."
echo ""

# Define icon sizes
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    output_file="${PUBLIC_DIR}/icon-${size}x${size}.png"
    echo "Generating ${output_file}..."
    
    sips -z $size $size "$LOGO_PATH" --out "$output_file" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Generated icon-${size}x${size}.png"
    else
        echo "❌ Failed to generate icon-${size}x${size}.png"
    fi
done

echo ""
echo "🎉 Icon generation complete!"
echo ""
echo "Generated files:"
for size in "${sizes[@]}"; do
    file="icon-${size}x${size}.png"
    if [ -f "${PUBLIC_DIR}/${file}" ]; then
        echo "✅ ${file}"
    else
        echo "❌ ${file}"
    fi
done