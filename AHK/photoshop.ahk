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
Send {F17}{v}
return

; Map 'NumpadDiv/NumpadMult' to mark layer and jump to marked layer
NumpadDiv::F13
+NumpadDiv::+F13
NumpadMult::F15
+NumpadMult::+F15

; Map 'Numpad2/5' to F14/^F14 and  to jump to bottom/top of clipping stack 
Numpad2::F14
Numpad5::^F14

; Map 'Numpad8' to +^F14 and to create a new layer on top of clipping stack
Numpad8::+^F14

; Map 'Numpad1/3' to ![/] to select previous/next layer
Numpad1::![
Numpad3::!]



; Map Alt + RMB drag to Zoom tool

LAlt & RButton::
MouseGetPos, x, y
Send {RButton up}{LAlt up}{Z down}{LButton down}
return

; Can't switch to original tool... just switch to brush for now
LAlt & RButton Up::
Send {LAlt up}{LButton up}{Z up}{W down}
return


; Map 'C' to return to toggle Color Picker
#IfWinActive Color Picker ahk_exe Photoshop.exe 
c::Enter

#IfWinActive