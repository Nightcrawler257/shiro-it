with open('shiro-v3.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'updatesummary' in line.lower():
        print(f"Line {i+1}: {line.strip()}")
