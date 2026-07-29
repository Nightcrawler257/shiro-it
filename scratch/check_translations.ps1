$html = Get-Content 'shiro-v2.html' -Raw
$js = Get-Content 'shiro-v3.js' -Raw

$htmlKeys = [regex]::Matches($html, 'data-translate="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

# Look for keys in translations object - they appear as:  key: "value", or  key: 'value',
$missing = @()
foreach ($key in $htmlKeys) {
    if ($js -notmatch "(?m)^\s+$([regex]::Escape($key)):") {
        $missing += $key
    }
}

Write-Host "=== KEYS IN HTML BUT MISSING FROM JS TRANSLATIONS ==="
$missing | ForEach-Object { Write-Host "  MISSING: $_" }
Write-Host ""
Write-Host "Total HTML keys: $($htmlKeys.Count)"
Write-Host "Missing: $($missing.Count)"
