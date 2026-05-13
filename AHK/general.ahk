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


; Mac-style alt+` (SC029 = backtick)
LAlt & Tab::AltTab
LAlt & SC029::ShiftAltTab