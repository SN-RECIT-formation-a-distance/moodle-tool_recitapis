$from = "moodle-tool_recitapis/src/*"
$to = "shared/recitfad3/admin/tool/recitapis"
$source = "./src";

try {
    . ("..\sync\watcher.ps1")
}
catch {
    Write-Host "Error while loading sync.ps1 script." 
}