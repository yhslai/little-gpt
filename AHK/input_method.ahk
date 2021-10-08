#Persistent
#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%

if not A_IsAdmin
	Run *RunAs "%A_ScriptFullPath%" ; 


SetTitleMatchMode, 2


Loop {
  SetTitleMatchMode, RegEx
  regex := "ahk_exe i)(.*Code.*)|(.*Blender.*)|(.*photoshop.*)|(.*WindowsTerminal.*)|(.*krita.*)"
  ; regex := "(.*Visual Studio Code.*)|(.*Blender.*)|(.*Photoshop.*)"
  WinWaitActive, %regex%
  SetDefaultKeyboard(0x0409)  ; English
  WinWaitNotActive, %regex%
}


; Chinese = 0x0404
; English = 0x0409
SetDefaultKeyboard(LocaleID) {
  Global SPI_SETDEFAULTINPUTLANG := 0x005A
  SPIF_SENDWININICHANGE := 2
  Lan := DllCall("LoadKeyboardLayout", "Str", Format("{:08x}", LocaleID), "Int", 0)
  VarSetCapacity(Lan%LocaleID%, 4, 0)
  NumPut(LocaleID, Lan%LocaleID%)
  ;Lan := 0xE0090404
  DllCall("SystemParametersInfo"
            , "UInt", SPI_SETDEFAULTINPUTLANG
            , "UInt", 0
            , "UPtr", &Lan%LocaleID%
            , "UInt", SPIF_SENDWININICHANGE)
  WinGet, windows, List
  Loop %windows% {
    PostMessage 0x50, 0, %Lan%, , % "ahk_id " windows%A_Index%
  }
}