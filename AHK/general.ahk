#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%

SetNumLockState, AlwaysOn  ; Keep num lock on

; Mac-style quit tab/app
!w::
Send {Alt up}{LCtrl down}w{LCtrl up}
Return

!q::!F4
Return

; Mac-style alt+`
`::ShiftAltTab

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

; Previous/Next tab
![::
Send {RAlt up}{Ctrl down}{PgUp}{Ctrl up}
Return
!]::
Send {RAlt up}{Ctrl down}{PgDn}{Ctrl up}
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

