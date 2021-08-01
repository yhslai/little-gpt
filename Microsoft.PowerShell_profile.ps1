# Hardlink to $HOME\PowerShell\Microsoft.PowerShell_profile.ps1

Set-PSReadlineOption -EditMode vi
Set-PSReadLineOption -PredictionSource History
function OnViModeChange {
    if ($args[0] -eq 'Command') {
        # Set the cursor to a blinking block.
        Write-Host -NoNewLine "`e[1 q"
    } else {
        # Set the cursor to a blinking line.
        Write-Host -NoNewLine "`e[5 q"
    }
}
Set-PSReadLineOption -ViModeIndicator Script -ViModeChangeHandler $function:OnViModeChange
# Shows navigable menu of all options when hitting Tab
Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete
Set-PSReadlineKeyHandler -Key Ctrl+r -Function ReverseSearchHistory
Set-PSReadlineKeyHandler -Key Ctrl+s -Function ForwardSearchHistory
Set-PSReadlineKeyHandler -Key Ctrl+f -Function ForwardChar

$env:Path += ";$HOME\Documents\github\little_windows\bin"
Import-Module posh-git
