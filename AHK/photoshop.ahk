#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%


; For Photoshop
; Map 'Tab' to F16 to toggle Brusherator
; Map 'V' to F17 to toggle Modificator
; Map 'C' to return to toggle Color Picker

#IfWinActive ahk_exe Photoshop.exe
Tab::
Send {F16}
return

v::
Send {F17}
return

#IfWinActive Color Picker ahk_exe Photoshop.exe 
c::
Send {Enter}
return

#IfWinActive