#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%


; For Photoshop

; Map F1 to F12 to create new layer 
#IfWinActive ahk_exe Photoshop.exe
*F1::*F12

; Map 'Tab' to F16 to toggle Brusherator
Tab::
Send {F16}
return

; Map 'V' to F17 to toggle Modificator
v::
Send {F17}
return

; Map 'C' to return to toggle Color Picker
#IfWinActive Color Picker ahk_exe Photoshop.exe 
c::Enter

#IfWinActive