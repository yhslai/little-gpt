#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%


; For Photoshop

; Map F1 to F12 to create new layer 
#IfWinActive ahk_exe Photoshop.exe
F1::F12

; Map 'Tab' to F16 to toggle Brusherator
Tab::
Send {F16}
return

; Map 'V' to F17 to toggle Modificator
v::
Send {F17}
return

; Map 'Numpad1/3' to F15/^F15 to mark layer and jump to marked layer
Numpad1::F15
Numpad3::^F15

; Map 'Numpad2/5' to F14/^F14 and  to jump to bottom/top of clipping stack 
Numpad2::F14
Numpad5::^F14

; Map 'Numpad8' to +^F14 and to create a new layer on top of clipping stack
Numpad8::+^F14

; Map 'C' to return to toggle Color Picker
#IfWinActive Color Picker ahk_exe Photoshop.exe 
c::Enter

#IfWinActive