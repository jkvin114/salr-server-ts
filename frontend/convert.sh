for file in build/html/*.html; do mv "$file" "${file%.html}.txt"; done