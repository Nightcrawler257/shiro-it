$content = Get-Content 'shiro-v2.html' -Raw
$matches2 = [regex]::Matches($content, 'data-translate="([^"]+)"')
$keys = $matches2 | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$keys
