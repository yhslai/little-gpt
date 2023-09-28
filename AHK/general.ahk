#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%

SetNumLockState, AlwaysOn  ; Keep num lock on


; Keep a window on top
#Persistent
Menu, Tray, Add, Toggle Always On Top, AlwaysOnTop
return

AlwaysOnTop:
SplashTextOn,,, Please switch window...
Sleep, 1000
Winset, AlwaysOnTop, , A
SplashTextOn,,, Always on top toggled!
Sleep, 1000
SplashTextOff
return

; Mac-style alt+`
`::ShiftAltTab


#IfWinNotActive ahk_exe Code.exe

; PageUp / PageDown / Home / End
RCtrl & Up::
Send {RCtrl up}{PgUp}
Return
RCtrl & Down::
Send {RCtrl up}{PgDn}
Return
RCtrl & Left::
Send {RCtrl up}{Home}
Return
RCtrl & Right::
Send {RCtrl up}{End}
Return


; Emulate scroll
RAlt & up::
Loop 6
    Click, WheelUp
return
RAlt & down::
Loop 6
    Click, WheelDown
return


; Make CapsLock behave like Ctrl
$CapsLock::Ctrl
return

; Make Ctrl+CapsLock behave like CapsLock
LCtrl & CapsLock::CapsLock
return
