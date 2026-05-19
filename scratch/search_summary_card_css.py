with open('shiro-v3.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'summary-card' in line.lower():
        print(f"Line {i+1}: {line.strip()}")
