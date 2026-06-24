#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="https://alinx.build"

mkdir -p public/images/portraits public/images/projects public/images/brochures public/images/icons public/assets/projects public/assets/brochures

download() {
  local url="$1"
  local dest="$2"
  if [ -f "$dest" ] && [ -s "$dest" ]; then
    echo "skip $dest"
    return 0
  fi
  echo "get $dest"
  curl -fsSL "$url" -o "$dest" || wget -q "$url" -O "$dest"
}

# Portraits
for f in Greg-Geml Ghantous-El-Tayar Spyro-Georgakopoulos Dante-Ladouceur Will-Wiebe Ryan-Lamarque Chris-Iorio; do
  download "$BASE/images/portraits/${f}.jpg" "public/images/portraits/${f}.jpg"
done
# Greg has version query in original
download "$BASE/images/portraits/Greg-Geml.jpg?v=1.1" "public/images/portraits/Greg-Geml.jpg" 2>/dev/null || true

# Projects images
declare -A PROJECTS=(
  ["42-Mill-St"]="42-Mill-St"
  ["140-Thomas-Condo"]="140-Thomas"
  ["Cambridge-Retirement"]="Cambridge-Retirement"
  ["Kingsville-Condo"]="Kingsville-Condominium"
  ["Milton-Retirement"]="Milton-Retirement"
  ["Pretty-River-Retirement"]="Pretty-River-Retirement"
  ["Ressam-Gardens"]="Ressam-Gardens-Memory-Care"
  ["Silver-Maple"]="Silver-Maple-Apartments"
  ["St-Thomas-Retirement"]="St-Thomas-Retirement"
  ["The-Hive"]="The-Hive-on-Pelissier"
  ["Union-Midrise"]="Union-Midrise-Condominium"
  ["Westview-Park"]="Westview-Park-Place"
)

download "$BASE/images/projects/42-Mill-St.jpg" "public/images/projects/42-Mill-St.jpg"
download "$BASE/images/projects/140-Thomas-Condo.jpg" "public/images/projects/140-Thomas-Condo.jpg"
download "$BASE/images/projects/Cambridge-Retirement.jpg" "public/images/projects/Cambridge-Retirement.jpg"
download "$BASE/images/projects/Kingsville-Condo.jpg" "public/images/projects/Kingsville-Condo.jpg"
download "$BASE/images/projects/Milton-Retirement.jpg" "public/images/projects/Milton-Retirement.jpg"
download "$BASE/images/projects/Pretty-River-Retirement.jpg" "public/images/projects/Pretty-River-Retirement.jpg"
download "$BASE/images/projects/Ressam-Gardens.jpg" "public/images/projects/Ressam-Gardens.jpg"
download "$BASE/images/projects/Silver-Maple.jpg" "public/images/projects/Silver-Maple.jpg"
download "$BASE/images/projects/St-Thomas-Retirement.jpg" "public/images/projects/St-Thomas-Retirement.jpg"
download "$BASE/images/projects/The-Hive.jpg" "public/images/projects/The-Hive.jpg"
download "$BASE/images/projects/Union-Midrise.jpg" "public/images/projects/Union-Midrise.jpg"
download "$BASE/images/projects/Westview-Park.jpg" "public/images/projects/Westview-Park.jpg"

# Project PDFs
download "$BASE/assets/projects/42-Mill-St.pdf" "public/assets/projects/42-Mill-St.pdf"
download "$BASE/assets/projects/140-Thomas.pdf" "public/assets/projects/140-Thomas.pdf"
download "$BASE/assets/projects/Cambridge-Retirement.pdf" "public/assets/projects/Cambridge-Retirement.pdf"
download "$BASE/assets/projects/Kingsville-Condominium.pdf" "public/assets/projects/Kingsville-Condominium.pdf"
download "$BASE/assets/projects/Milton-Retirement.pdf" "public/assets/projects/Milton-Retirement.pdf"
download "$BASE/assets/projects/Pretty-River-Retirement.pdf" "public/assets/projects/Pretty-River-Retirement.pdf"
download "$BASE/assets/projects/Ressam-Gardens-Memory-Care.pdf" "public/assets/projects/Ressam-Gardens-Memory-Care.pdf"
download "$BASE/assets/projects/Silver-Maple-Apartments.pdf" "public/assets/projects/Silver-Maple-Apartments.pdf"
download "$BASE/assets/projects/St-Thomas-Retirement.pdf" "public/assets/projects/St-Thomas-Retirement.pdf"
download "$BASE/assets/projects/The-Hive-on-Pelissier.pdf" "public/assets/projects/The-Hive-on-Pelissier.pdf"
download "$BASE/assets/projects/Union-Midrise-Condominium.pdf" "public/assets/projects/Union-Midrise-Condominium.pdf"
download "$BASE/assets/projects/Westview-Park-Place.pdf" "public/assets/projects/Westview-Park-Place.pdf"

# Brochures
download "$BASE/images/brochures/A-Linx-Overview.webp" "public/images/brochures/A-Linx-Overview.webp"
download "$BASE/images/brochures/A-Linx-Panelized-Brochure.webp" "public/images/brochures/A-Linx-Panelized-Brochure.webp"
download "$BASE/assets/brochures/A-Linx-Overview.pdf" "public/assets/brochures/A-Linx-Overview.pdf"
download "$BASE/assets/brochures/A-Linx-Panelized-Brochure.pdf" "public/assets/brochures/A-Linx-Panelized-Brochure.pdf"

# Icons
download "$BASE/images/icons/Instagram_Glyph_Black.svg" "public/images/icons/Instagram_Glyph_Black.svg"
download "$BASE/images/icons/InBug-Black.png" "public/images/icons/InBug-Black.png"

echo "Done. File count:"
find public/images/portraits public/images/projects public/images/brochures public/images/icons public/assets -type f 2>/dev/null | wc -l
