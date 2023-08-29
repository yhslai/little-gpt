# Hardlink to $HOME\PowerShell\Microsoft.PowerShell_profile.ps1

Import-Module PSReadLine

$OnViModeChange = [scriptblock]{
    if ($args[0] -eq 'Command') {
        # Set the cursor to a blinking block.
        Write-Host -NoNewLine "`e[1 q"
    }
    else {
        # Set the cursor to a blinking line.
        Write-Host -NoNewLine "`e[5 q"
    }
}

Set-PsReadLineOption -EditMode Vi
Set-PSReadLineOption -ViModeIndicator Script -ViModeChangeHandler $OnViModeChange

# Shows navigable menu of all options when hitting Tab
Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete
Set-PSReadlineKeyHandler -Key Ctrl+r -Function ReverseSearchHistory
Set-PSReadlineKeyHandler -Key Ctrl+s -Function ForwardSearchHistory
Set-PSReadlineKeyHandler -Key Ctrl+f -Function ForwardChar

$env:Path += ";$HOME\github\little_windows\bin"
$env:Path += ";C:\Program Files\cmake\bin"
$env:Path += ";C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build"
$env:Path += ";C:\Program Files\Perforce"
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
$env:Path += ";C:\Program Files\lilypond-2.24.1\bin"

# Linux HOME
$env:LHOME = "\\wsl$\Ubuntu\home\raincole"

function global:prompt {
    $ESC = [char]27
    $regex = [regex]::Escape($HOME) + "(\\.*)*$"
    "$ESC[36m$($executionContext.SessionState.Path.CurrentLocation.Path -replace $regex, '~$1')$('>' * ($nestedPromptLevel + 1)) $ESC[0m";
}

$current_directory = pwd
& 'C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\Launch-VsDevShell.ps1'
cd $current_directory

# Powershell doesn't change cursor back to verticl line upon exiting vim
# See https://github.com/microsoft/terminal/issues/4335#issuecomment-1238989185
function vim {
    & "vim.exe" $args && echo "`e[5 q"
}
