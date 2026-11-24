Add-Type -AssemblyName 'System.IO.Compression'
Add-Type -AssemblyName 'System.IO.Compression.FileSystem'

$srcDir = 'c:\Users\THIS PC\Downloads\florea-prototype-v2\temp_docx_build'
$dstZip = 'c:\Users\THIS PC\Downloads\florea-prototype-v2\Florea_Capstone_Proposal_Revised.docx'

if (Test-Path $dstZip) {
    Remove-Item $dstZip -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($dstZip, [System.IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem -Path $srcDir -Recurse -File | ForEach-Object {
    $relPath = $_.FullName.Substring($srcDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
$zip.Dispose()
Write-Host 'SUCCESS: ZIP with forward slashes created!'
